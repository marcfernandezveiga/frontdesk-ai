/**
 * Pure slot-generation utilities. No IO. Safe to import in both the browser
 * (onboarding preview) and on the server (seeding).
 */

import type { Schedule, DaySchedule } from "./tenant";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GeneratedSlot {
  startsAtUtc: string; // ISO 8601
  durationMin: number;
}

export interface GenerateSlotsOpts {
  /** How many calendar days ahead to generate. Default 14. */
  days?: number;
  /** Skip slots that start before this moment. Default: now. */
  after?: Date;
}

// ---------------------------------------------------------------------------
// TZ helpers (same approach as the original app/api/businesses/route.ts)
// ---------------------------------------------------------------------------

/**
 * Return the UTC offset in milliseconds for `tz` at the given `date`.
 * Positive = timezone is ahead of UTC (e.g. BST is +3_600_000).
 */
function getTzOffsetMs(tz: string, date: Date): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const localStr = date.toLocaleString("en-US", { timeZone: tz });
  return new Date(localStr).getTime() - new Date(utcStr).getTime();
}

/**
 * Convert a local "YYYY-MM-DD" + "HH:MM" in the given timezone to a UTC Date.
 */
function localToUtc(localDate: string, localTime: string, tz: string): Date {
  // Parse as if it were UTC, then shift by the tz offset at that nominal moment.
  const nominal = new Date(`${localDate}T${localTime}:00`);
  const offset = getTzOffsetMs(tz, nominal);
  return new Date(nominal.getTime() - offset);
}

// ---------------------------------------------------------------------------
// generateSlots
// ---------------------------------------------------------------------------

/**
 * For each of the next `days` calendar days in `timezone`, look up the
 * weekday's DaySchedule. If enabled, step through EACH shift from start to
 * end by slotDurationMin and emit a slot (cursor + duration <= shiftEnd).
 * Slots before `after` (default: now) are skipped.
 * Returns an array of { startsAtUtc, durationMin }.
 */
export function generateSlots(
  schedule: Schedule,
  timezone: string,
  opts: GenerateSlotsOpts = {}
): GeneratedSlot[] {
  const days = opts.days ?? 14;
  const after = opts.after ?? new Date();
  const { slotDurationMin, week } = schedule;

  const slots: GeneratedSlot[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    // Advance from today by d days
    const cursor = new Date(now);
    cursor.setDate(cursor.getDate() + d);

    // Determine the local calendar date and weekday in the business timezone
    const localDateStr = cursor.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
    const localDow = new Date(
      cursor.toLocaleString("en-US", { timeZone: timezone })
    ).getDay(); // 0=Sun

    const day: DaySchedule | undefined = week[localDow];
    if (!day || !day.enabled || day.shifts.length === 0) continue;

    for (const shift of day.shifts) {
      const [startH, startM] = shift.start.split(":").map(Number);
      const [endH, endM] = shift.end.split(":").map(Number);

      let curMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      while (curMin + slotDurationMin <= endMin) {
        const h = Math.floor(curMin / 60);
        const m = curMin % 60;
        const localTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

        const slotUtc = localToUtc(localDateStr, localTime, timezone);

        if (slotUtc > after) {
          slots.push({
            startsAtUtc: slotUtc.toISOString(),
            durationMin: slotDurationMin,
          });
        }

        curMin += slotDurationMin;
      }
    }
  }

  return slots;
}

// ---------------------------------------------------------------------------
// countSlotsPerWeek
// ---------------------------------------------------------------------------

/**
 * Count the total bookable slots in one standard week for the given schedule.
 * Used by the onboarding preview to show "about N slots per week".
 */
export function countSlotsPerWeek(schedule: Schedule): number {
  const { slotDurationMin, week } = schedule;
  let total = 0;

  for (let dow = 0; dow <= 6; dow++) {
    const day: DaySchedule | undefined = week[dow];
    if (!day || !day.enabled) continue;

    for (const shift of day.shifts) {
      const [startH, startM] = shift.start.split(":").map(Number);
      const [endH, endM] = shift.end.split(":").map(Number);
      const shiftMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (shiftMinutes > 0) {
        total += Math.floor(shiftMinutes / slotDurationMin);
      }
    }
  }

  return total;
}
