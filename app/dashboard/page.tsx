/**
 * Owner dashboard — /dashboard
 *
 * Wave 1: fully styled with mock data.
 * Wave 2: replace mock data with polled Supabase queries + Auth0 guard.
 *
 * Prop interface: see components/dashboard/DashboardPage.tsx → DashboardPageProps
 */

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import type { Appointment, CallLog } from "@/lib/types";
import type { AvailabilitySlot } from "@/components/dashboard/DashboardTypes";

// ─── Mock data ────────────────────────────────────────────────────────────────
//
// Everything below is replaced by wave 2 with real Supabase queries.
// Dates are relative to 2026-06-12 (hackathon day).

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
  {
    id: "appt-4",
    business_id: "marina-physio",
    slot_id: "slot-4",
    caller_name: "Tom Whitfield",
    reason: "Follow-up after initial assessment",
    starts_at: "2026-06-12T15:30:00Z",
    status: "cancelled",
    created_at: "2026-06-12T14:00:00Z",
  },
];

const MOCK_CALL_LOGS: CallLog[] = [
  {
    id: "log-1",
    business_id: "marina-physio",
    appointment_id: "appt-1",
    summary: "Caller has had lower back pain for 3 weeks and wants an urgent appointment.",
    transcript: `[Agent] Good morning, Marina Physio — how can I help you today?

[Caller] Hi, I've been having quite bad lower back pain for the past three weeks. It gets worse when I sit for long periods. I was wondering if I could book an appointment.

[Agent] Of course, I'm sorry to hear that. I'll check what's available. Can I take your name?

[Caller] Sure, it's Sarah Chen.

[Agent] Thank you, Sarah. I have a slot available this morning at 10 AM — would that work for you?

[Caller] That's perfect actually, yes please.

[Agent] Wonderful. I've booked you in for today, Thursday 12 June at 10:00 AM with Marina Physio. Is there anything else I can help with?

[Caller] No, that's brilliant. Thank you so much.

[Agent] You're welcome. We'll see you shortly, Sarah. Take care!`,
    created_at: "2026-06-12T09:46:00Z",
  },
  {
    id: "log-2",
    business_id: "marina-physio",
    appointment_id: "appt-2",
    summary: "Patient needs ongoing shoulder rehab sessions after rotator cuff surgery.",
    transcript: `[Agent] Marina Physio, how can I help?

[Caller] Hi there. I had rotator cuff surgery about six weeks ago and my surgeon has referred me to physio. I need to set up some sessions.

[Agent] Of course, we can definitely help with that. What's your name?

[Caller] James Okafor.

[Agent] Thanks James. I have availability today at 11:30 AM — shall I book that for you?

[Caller] Yes, 11:30 works well.

[Agent] Done! Booked for today at 11:30 AM. We look forward to seeing you, James.`,
    created_at: "2026-06-12T11:12:00Z",
  },
  {
    id: "log-3",
    business_id: "marina-physio",
    appointment_id: "appt-3",
    summary: "Runner with a left knee injury sustained during a 10K race last weekend.",
    transcript: `[Agent] Good afternoon, Marina Physio. How can I assist?

[Caller] Hi, I hurt my left knee during a race last weekend. It's been swollen and painful to walk on.

[Agent] Oh, that sounds uncomfortable. Let's get you seen. Can I take your name?

[Caller] Priya Nair.

[Agent] Thanks Priya. I can get you in today at 2 PM. Does that work?

[Caller] Yes, perfect.

[Agent] Great, you're all booked in for 2 PM today. We'll take a look at that knee for you.`,
    created_at: "2026-06-12T13:42:00Z",
  },
];

const MOCK_AVAILABILITY: AvailabilitySlot[] = [
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPageRoute() {
  return (
    <DashboardPage
      header={{
        clinicName: "Marina Physio",
        hasActiveCall: true,
        activeCallCount: 1,
      }}
      appointments={MOCK_APPOINTMENTS}
      callLogs={MOCK_CALL_LOGS}
      availabilitySlots={MOCK_AVAILABILITY}
      selectedAppointmentId="appt-1"
      loading={false}
    />
  );
}
