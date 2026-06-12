// Shared domain types: the contract both backend and frontend build against.

export const BUSINESS_ID = "marina-physio";
export const BUSINESS_NAME = "Marina Physio";

export type AppointmentStatus = "booked" | "cancelled";

export interface Slot {
  id: string;
  business_id: string;
  // ISO 8601 start time, e.g. "2026-06-12T14:00:00Z"
  starts_at: string;
  duration_min: number;
  is_booked: boolean;
}

export interface Appointment {
  id: string;
  business_id: string;
  slot_id: string;
  caller_name: string;
  reason: string;
  starts_at: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface CallLog {
  id: string;
  business_id: string;
  // Full conversation transcript text.
  transcript: string;
  // One-line AI summary of what the caller wanted (via Vercel AI Gateway).
  summary: string | null;
  // Linked appointment if the call resulted in a booking.
  appointment_id: string | null;
  created_at: string;
}

export type LiveCallStatus = "ringing" | "live" | "booked" | "ended";

export interface LiveCall {
  id: string;
  business_id: string;
  caller_name: string | null;
  caller_phone: string | null;
  status: LiveCallStatus;
  transcript: string;
  current_speaker: "caller" | "agent" | null;
  appointment_id: string | null;
  started_at: string;
  updated_at: string;
  ended_at: string | null;
}

// ---- ElevenLabs client-tool payloads (browser → our API, same-origin) ----

export interface CheckAvailabilityArgs {
  // Natural day reference the agent extracts, e.g. "thursday" or "2026-06-13".
  date?: string;
}
export interface CheckAvailabilityResult {
  slots: { slot_id: string; starts_at: string; label: string }[];
}

export interface BookAppointmentArgs {
  slot_id: string;
  caller_name: string;
  reason: string;
}
export interface BookAppointmentResult {
  ok: boolean;
  appointment_id?: string;
  confirmation?: string; // human-readable line the agent reads back
  starts_at?: string; // ISO start time of the booked slot (for the UI card)
  error?: string;
}
