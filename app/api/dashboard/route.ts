/**
 * GET /api/dashboard
 *
 * Returns a snapshot of all dashboard data in one round-trip.
 * The client polls this every 1500 ms.
 *
 * Shape:
 * {
 *   appointments: Appointment[]          – ordered newest first
 *   callLogs:     CallLog[]              – all logs for the business
 *   slots:        AvailabilitySlotDTO[]  – upcoming open slots (up to 6)
 * }
 *
 * Falls back to in-memory mock data when Supabase env vars are absent.
 */

import { BUSINESS_ID } from "@/lib/types";
import type { Appointment, CallLog, Slot } from "@/lib/types";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

// ─── DTO ─────────────────────────────────────────────────────────────────────

export interface AvailabilitySlotDTO {
  slot: Slot;
  label: string;
}

export interface DashboardPayload {
  appointments: Appointment[];
  callLogs: CallLog[];
  slots: AvailabilitySlotDTO[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LONDON_TZ = "Europe/London";

function toLabel(isoUtc: string): string {
  const d = new Date(isoUtc);
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-GB", { timeZone: LONDON_TZ });
  const slotStr = d.toLocaleDateString("en-GB", { timeZone: LONDON_TZ });
  const prefix = todayStr === slotStr ? "Today" : d.toLocaleDateString("en-GB", {
    timeZone: LONDON_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: LONDON_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${prefix} ${time.replace("am", "AM").replace("pm", "PM")}`;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appt-1",
    business_id: "marina-physio",
    slot_id: "slot-1",
    caller_name: "Sarah Chen",
    reason: "Lower back pain, recurring issue",
    starts_at: "2026-06-12T10:00:00Z",
    status: "booked",
    created_at: "2026-06-12T09:45:00Z",
  },
  {
    id: "appt-2",
    business_id: "marina-physio",
    slot_id: "slot-2",
    caller_name: "James Okafor",
    reason: "Post-surgery shoulder rehabilitation",
    starts_at: "2026-06-12T11:30:00Z",
    status: "booked",
    created_at: "2026-06-12T11:10:00Z",
  },
  {
    id: "appt-3",
    business_id: "marina-physio",
    slot_id: "slot-3",
    caller_name: "Priya Nair",
    reason: "Sports injury — left knee",
    starts_at: "2026-06-12T14:00:00Z",
    status: "booked",
    created_at: "2026-06-12T13:40:00Z",
  },
];

const MOCK_CALL_LOGS: CallLog[] = [
  {
    id: "log-1",
    business_id: "marina-physio",
    appointment_id: "appt-1",
    summary: "Caller has had lower back pain for 3 weeks and wants an urgent appointment.",
    transcript: `[Agent] Good morning, Marina Physio — how can I help you today?\n\n[Caller] Hi, I've been having quite bad lower back pain for the past three weeks.\n\n[Agent] Of course, I'm sorry to hear that. I'll check what's available. Can I take your name?\n\n[Caller] Sure, it's Sarah Chen.\n\n[Agent] Thank you, Sarah. You're booked for today at 10:00 AM with Marina Physio.`,
    created_at: "2026-06-12T09:46:00Z",
  },
  {
    id: "log-2",
    business_id: "marina-physio",
    appointment_id: "appt-2",
    summary: "Patient needs ongoing shoulder rehab sessions after rotator cuff surgery.",
    transcript: `[Agent] Marina Physio, how can I help?\n\n[Caller] Hi, I had rotator cuff surgery six weeks ago and need physio.\n\n[Agent] Of course. What's your name?\n\n[Caller] James Okafor.\n\n[Agent] Booked for today at 11:30 AM. We look forward to seeing you, James.`,
    created_at: "2026-06-12T11:12:00Z",
  },
];

const MOCK_SLOTS: AvailabilitySlotDTO[] = [
  {
    slot: {
      id: "slot-5",
      business_id: "marina-physio",
      starts_at: "2026-06-12T16:00:00Z",
      duration_min: 45,
      is_booked: false,
    },
    label: "Today 4:00 PM",
  },
  {
    slot: {
      id: "slot-6",
      business_id: "marina-physio",
      starts_at: "2026-06-12T17:00:00Z",
      duration_min: 45,
      is_booked: false,
    },
    label: "Today 5:00 PM",
  },
  {
    slot: {
      id: "slot-7",
      business_id: "marina-physio",
      starts_at: "2026-06-12T17:45:00Z",
      duration_min: 30,
      is_booked: false,
    },
    label: "Today 5:45 PM",
  },
];

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  if (!hasSupabaseEnv) {
    const payload: DashboardPayload = {
      appointments: MOCK_APPOINTMENTS,
      callLogs: MOCK_CALL_LOGS,
      slots: MOCK_SLOTS,
    };
    return Response.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const [appointmentsRes, callLogsRes, slotsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("business_id", BUSINESS_ID)
        .order("starts_at", { ascending: false })
        .limit(50),
      supabase
        .from("call_logs")
        .select("*")
        .eq("business_id", BUSINESS_ID)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("slots")
        .select("*")
        .eq("business_id", BUSINESS_ID)
        .eq("is_booked", false)
        .gt("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(6),
    ]);

    const appointments = (appointmentsRes.data ?? []) as Appointment[];
    const callLogs = (callLogsRes.data ?? []) as CallLog[];
    const rawSlots = (slotsRes.data ?? []) as Slot[];

    const slots: AvailabilitySlotDTO[] = rawSlots.map((s) => ({
      slot: s,
      label: toLabel(s.starts_at),
    }));

    const payload: DashboardPayload = { appointments, callLogs, slots };
    return Response.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[dashboard] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
