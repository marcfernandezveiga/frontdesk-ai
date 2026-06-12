/**
 * GET /api/schedule-week?business=<slug>&weekStart=<ISO date>
 *
 * Returns every slot (open AND booked) in the 7-day window starting at
 * weekStart (inclusive) for the given business. Booked slots include the
 * linked appointment's callerName and reason.
 *
 * Shape:
 * {
 *   slots: {
 *     id: string;
 *     startsAt: string;       // ISO 8601 UTC
 *     durationMin: number;
 *     isBooked: boolean;
 *     appointment?: { callerName: string; reason: string };
 *   }[]
 * }
 */

import { NextRequest } from "next/server";
import { BUSINESS_ID } from "@/lib/types";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppointmentSnippet {
  callerName: string;
  reason: string;
}

interface ScheduleWeekSlot {
  id: string;
  startsAt: string;
  durationMin: number;
  isBooked: boolean;
  appointment?: AppointmentSnippet;
}

interface ScheduleWeekPayload {
  slots: ScheduleWeekSlot[];
}

// ---------------------------------------------------------------------------
// Mock data (used when Supabase env vars are absent)
// ---------------------------------------------------------------------------

const MOCK_PAYLOAD: ScheduleWeekPayload = {
  slots: [
    {
      id: "mock-sw-1",
      startsAt: "2026-06-16T09:00:00Z",
      durationMin: 30,
      isBooked: false,
    },
    {
      id: "mock-sw-2",
      startsAt: "2026-06-16T09:30:00Z",
      durationMin: 30,
      isBooked: true,
      appointment: { callerName: "Sarah Chen", reason: "Lower back pain" },
    },
    {
      id: "mock-sw-3",
      startsAt: "2026-06-17T10:00:00Z",
      durationMin: 30,
      isBooked: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get("business") ?? BUSINESS_ID;
  const weekStartParam = searchParams.get("weekStart");

  if (!weekStartParam) {
    return Response.json(
      { error: "weekStart is required (ISO date, e.g. 2026-06-16)" },
      { status: 400 }
    );
  }

  const weekStart = new Date(weekStartParam);
  if (isNaN(weekStart.getTime())) {
    return Response.json({ error: "weekStart is not a valid date" }, { status: 400 });
  }
  weekStart.setUTCHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  if (!hasSupabaseEnv) {
    return Response.json(MOCK_PAYLOAD, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const supabase = createServiceClient();

    // Fetch all slots in the 7-day window for this business
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: slotRows, error: slotsErr } = await (supabase as any)
      .from("slots")
      .select("id, starts_at, duration_min, is_booked")
      .eq("business_id", businessId)
      .gte("starts_at", weekStart.toISOString())
      .lt("starts_at", weekEnd.toISOString())
      .order("starts_at", { ascending: true });

    if (slotsErr) {
      console.error("[schedule-week] Slots query error:", slotsErr);
      return Response.json({ error: "Database error" }, { status: 500 });
    }

    const rows = (slotRows ?? []) as {
      id: string;
      starts_at: string;
      duration_min: number;
      is_booked: boolean;
    }[];

    // Collect booked slot IDs so we can fetch their appointments in one shot
    const bookedIds = rows.filter((r) => r.is_booked).map((r) => r.id);

    // Map slot_id -> appointment snippet
    const appointmentMap = new Map<string, AppointmentSnippet>();

    if (bookedIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: apptRows, error: apptErr } = await (supabase as any)
        .from("appointments")
        .select("slot_id, caller_name, reason")
        .eq("business_id", businessId)
        .in("slot_id", bookedIds);

      if (apptErr) {
        console.warn("[schedule-week] Appointments query error:", apptErr);
        // Non-fatal: fall through with no appointment data
      } else {
        for (const appt of (apptRows ?? []) as {
          slot_id: string;
          caller_name: string;
          reason: string;
        }[]) {
          appointmentMap.set(appt.slot_id, {
            callerName: appt.caller_name,
            reason: appt.reason,
          });
        }
      }
    }

    const slots: ScheduleWeekSlot[] = rows.map((row) => {
      const slot: ScheduleWeekSlot = {
        id: row.id,
        startsAt: row.starts_at,
        durationMin: row.duration_min,
        isBooked: row.is_booked,
      };
      const appt = appointmentMap.get(row.id);
      if (appt) slot.appointment = appt;
      return slot;
    });

    const payload: ScheduleWeekPayload = { slots };
    return Response.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[schedule-week] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
