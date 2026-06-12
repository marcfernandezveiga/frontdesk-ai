/**
 * Types for the ScheduleWeek component (wave 2 wires to GET /api/schedule-week).
 */

// ─── Slot ─────────────────────────────────────────────────────────────────────

export interface ScheduleSlot {
  /** Database row id */
  id: string;
  /** ISO-8601 datetime string in the business's local timezone context */
  startsAt: string;
  /** Length of the booking in minutes */
  durationMin: number;
  isBooked: boolean;
  appointment?: {
    callerName: string;
    reason: string;
  };
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface ScheduleWeekProps {
  /**
   * All slots (booked and open) for the displayed 7-day window.
   * Wave 2 fetches these from GET /api/schedule-week?business=&weekStart=
   */
  slots: ScheduleSlot[];
  /**
   * ISO date string (YYYY-MM-DD) for the Monday that anchors the displayed week.
   * Wave 2 manages this via useState, initialized to the current Monday.
   */
  weekStart: string;
  /** Whether slots are being fetched (shows skeleton state). */
  loading?: boolean;
  /** Navigate to the previous week. Wave 2 decrements weekStart by 7 days. */
  onPrevWeek: () => void;
  /** Navigate to the next week. Wave 2 increments weekStart by 7 days. */
  onNextWeek: () => void;
}
