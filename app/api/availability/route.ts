import { NextRequest } from "next/server";
import { BUSINESS_ID } from "@/lib/types";
import type { Slot, CheckAvailabilityResult } from "@/lib/types";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Business scoping helper
// ---------------------------------------------------------------------------

function getBusinessId(searchParams: URLSearchParams): string {
  return searchParams.get("business") ?? BUSINESS_ID;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LONDON_TZ = "Europe/London";

/** Format a UTC ISO string as "Weekday H:MM AM/PM" in London time. */
function toLabel(isoUtc: string): string {
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
  return `${weekday} ${time.replace("am", "AM").replace("pm", "PM")}`;
}

// ---------------------------------------------------------------------------
// In-memory mock (used only when Supabase env vars are absent)
// ---------------------------------------------------------------------------

const MOCK_SLOTS: CheckAvailabilityResult["slots"] = [
  {
    slot_id: "mock-slot-1",
    starts_at: "2026-06-13T09:00:00Z",
    label: "Saturday 10:00 AM",
  },
  {
    slot_id: "mock-slot-2",
    starts_at: "2026-06-13T13:00:00Z",
    label: "Saturday 2:00 PM",
  },
  {
    slot_id: "mock-slot-3",
    starts_at: "2026-06-15T09:00:00Z",
    label: "Monday 10:00 AM",
  },
];

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const businessId = getBusinessId(searchParams);

  if (!hasSupabaseEnv) {
    const payload: CheckAvailabilityResult = { slots: MOCK_SLOTS };
    return Response.json(payload);
  }

  // --- REAL SUPABASE PATH ---
  try {
    const supabase = createServiceClient();

    let baseQuery = supabase
      .from("slots")
      .select("id, starts_at")
      .eq("business_id", businessId)
      .eq("is_booked", false)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(3);

    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        const dayStart = new Date(parsed);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
        baseQuery = baseQuery
          .gte("starts_at", dayStart.toISOString())
          .lt("starts_at", dayEnd.toISOString());
      }
    }

    const { data, error } = await baseQuery;

    if (error) {
      console.error("[availability] Supabase error:", error);
      return Response.json({ error: "Database error" }, { status: 500 });
    }

    const rows = (data ?? []) as Pick<Slot, "id" | "starts_at">[];

    const slots = rows.map((row) => ({
      slot_id: row.id,
      starts_at: row.starts_at,
      label: toLabel(row.starts_at),
    }));

    const payload: CheckAvailabilityResult = { slots };
    return Response.json(payload);
  } catch (err) {
    console.error("[availability] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
