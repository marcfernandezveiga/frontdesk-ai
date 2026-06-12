/**
 * Dashboard prop interfaces for wave 2 wiring.
 *
 * All data is mock-driven in wave 1. Wave 2 replaces mock data with
 * polled Supabase queries (GET /api/availability, direct Supabase reads).
 */

import type { Appointment, CallLog, LiveCall, Slot } from "@/lib/types";

// ─── Availability strip ──────────────────────────────────────────────────────

export interface AvailabilitySlot {
  slot: Slot;
  /** Human-readable label, e.g. "Thu 2:00 PM" */
  label: string;
}

export interface AvailabilityStripProps {
  /**
   * Today's open slots, up to 6. Empty array = no availability today.
   */
  slots: AvailabilitySlot[];
  /**
   * Whether slots are currently being fetched (skeleton state).
   */
  loading?: boolean;
}

// ─── Appointment card ─────────────────────────────────────────────────────────

export interface AppointmentCardProps {
  appointment: Appointment;
  /**
   * Call log linked to this appointment, if any.
   * Used to show summary and allow expanding transcript.
   */
  callLog?: CallLog;
  /**
   * Whether this card is currently selected / expanded.
   */
  isActive?: boolean;
  onClick?: () => void;
}

// ─── Transcript panel ─────────────────────────────────────────────────────────

export interface TranscriptPanelProps {
  callLog: CallLog | null;
  liveCall?: LiveCall | null;
  /**
   * Loading state while fetching transcript for a selected appointment.
   */
  loading?: boolean;
}

// ─── Dashboard header ─────────────────────────────────────────────────────────

export interface DashboardHeaderProps {
  clinicName: string;
  /**
   * Whether to show the "Live" indicator (at least one active call in progress).
   */
  hasActiveCall?: boolean;
  /**
   * Number of active live calls (0 is fine, just hides the badge).
   */
  activeCallCount?: number;
}

// ─── Full dashboard page ──────────────────────────────────────────────────────

export interface DashboardPageProps {
  header: DashboardHeaderProps;
  appointments: Appointment[];
  callLogs: CallLog[];
  liveCalls: LiveCall[];
  availabilitySlots: AvailabilitySlot[];
  /**
   * ID of the currently selected appointment in the transcript panel.
   * Wave 2 manages this via useState; wave 1 provides a default from mock.
   */
  selectedAppointmentId?: string | null;
  onSelectAppointment?: (id: string) => void;
  loading?: boolean;
}
