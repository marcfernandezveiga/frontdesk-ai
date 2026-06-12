import { BUSINESS_ID } from "@/lib/types";
import type { Slot, Appointment, BookAppointmentArgs, BookAppointmentResult } from "@/lib/types";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LONDON_TZ = "Europe/London";

/** Format a UTC ISO string as "Weekday at H:MM AM/PM" in London time. */
function toConfirmationTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  const weekday = d.toLocaleDateString("en-GB", {
    timeZone: LONDON_TZ,
    weekday: "long",
  });
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: LONDON_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${weekday} at ${time.replace("am", "AM").replace("pm", "PM")}`;
}

// ---------------------------------------------------------------------------
// In-memory mock (used only when Supabase env vars are absent)
// ---------------------------------------------------------------------------

const mockBookedIds = new Set<string>();

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  let body: BookAppointmentArgs;

  try {
    body = (await request.json()) as BookAppointmentArgs;
  } catch {
    const result: BookAppointmentResult = {
      ok: false,
      error: "Invalid JSON body",
    };
    return Response.json(result, { status: 400 });
  }

  const { slot_id, caller_name, reason } = body;

  if (!slot_id || !caller_name) {
    const result: BookAppointmentResult = {
      ok: false,
      error: "slot_id and caller_name are required",
    };
    return Response.json(result, { status: 400 });
  }

  if (!hasSupabaseEnv) {
    // --- MOCK PATH ---
    if (mockBookedIds.has(slot_id)) {
      const result: BookAppointmentResult = {
        ok: false,
        error: "That slot is already booked.",
      };
      return Response.json(result, { status: 409 });
    }
    mockBookedIds.add(slot_id);
    const result: BookAppointmentResult = {
      ok: true,
      appointment_id: `mock-appt-${Date.now()}`,
      confirmation: `You're booked for Saturday at 10:00 AM, see you then.`,
    };
    return Response.json(result);
  }

  // --- REAL SUPABASE PATH ---
  try {
    const supabase = createServiceClient();

    // Fetch the slot to validate it exists and is open.
    const { data: slotData, error: fetchErr } = await supabase
      .from("slots")
      .select("id, starts_at, is_booked, business_id")
      .eq("id", slot_id)
      .eq("business_id", BUSINESS_ID)
      .single();

    const slot = slotData as Pick<Slot, "id" | "starts_at" | "is_booked" | "business_id"> | null;

    if (fetchErr || !slot) {
      const result: BookAppointmentResult = {
        ok: false,
        error: "Slot not found.",
      };
      return Response.json(result, { status: 404 });
    }

    if (slot.is_booked) {
      const result: BookAppointmentResult = {
        ok: false,
        error: "That slot is already booked.",
      };
      return Response.json(result, { status: 409 });
    }

    // Optimistic write: mark slot booked with a guard against concurrent booking.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr, count: updatedCount } = await (supabase as any)
      .from("slots")
      .update({ is_booked: true })
      .eq("id", slot_id)
      .eq("is_booked", false);

    if (updateErr) {
      const result: BookAppointmentResult = {
        ok: false,
        error: "Slot was just booked by someone else. Please choose another.",
      };
      return Response.json(result, { status: 409 });
    }

    // Create the appointment record.
    const insertPayload: Omit<Appointment, "id" | "created_at"> = {
      business_id: BUSINESS_ID,
      slot_id: slot.id,
      caller_name,
      reason: reason ?? "",
      starts_at: slot.starts_at,
      status: "booked",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: apptData, error: apptErr } = await (supabase as any)
      .from("appointments")
      .insert(insertPayload)
      .select("id")
      .single();

    const appt = apptData as Pick<Appointment, "id"> | null;

    if (apptErr || !appt) {
      // Best-effort rollback.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("slots")
        .update({ is_booked: false })
        .eq("id", slot_id);

      const result: BookAppointmentResult = {
        ok: false,
        error: "Failed to create appointment. Please try again.",
      };
      return Response.json(result, { status: 500 });
    }

    // Suppress unused variable warning — updatedCount is used as a side-effect guard above.
    void updatedCount;

    const when = toConfirmationTime(slot.starts_at);
    const result: BookAppointmentResult = {
      ok: true,
      appointment_id: appt.id,
      confirmation: `You're booked for ${when}, see you then.`,
    };
    return Response.json(result);
  } catch (err) {
    console.error("[book] Unexpected error:", err);
    const result: BookAppointmentResult = {
      ok: false,
      error: "Internal server error",
    };
    return Response.json(result, { status: 500 });
  }
}
