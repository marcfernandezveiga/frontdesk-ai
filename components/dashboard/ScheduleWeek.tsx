"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, User } from "lucide-react";
import type { ScheduleWeekProps, ScheduleSlot } from "./ScheduleWeekTypes";

export type { ScheduleWeekProps, ScheduleSlot } from "./ScheduleWeekTypes";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Time rows: every 30 minutes from 07:00 to 22:30
function buildTimeRows(): { hour: number; minute: number; label: string }[] {
  const rows = [];
  for (let h = 7; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue;
      rows.push({
        hour: h,
        minute: m,
        label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      });
    }
  }
  return rows;
}

const TIME_ROWS = buildTimeRows();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "YYYY-MM-DD" into a Date at local midnight. */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as "Mon 9 Jun" */
function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Format a Date range as "2–8 Jun 2025" */
function formatWeekLabel(weekStart: string): string {
  const start = parseLocalDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sDay = start.getDate();
  const eDay = end.getDate();
  const month = end.toLocaleDateString("en-GB", { month: "short" });
  const year = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${sDay}–${eDay} ${month} ${year}`;
  }
  const sMonth = start.toLocaleDateString("en-GB", { month: "short" });
  return `${sDay} ${sMonth} – ${eDay} ${month} ${year}`;
}

/**
 * Given weekStart (Monday), return 7 Date objects Mon..Sun.
 */
function weekDays(weekStart: string): Date[] {
  const start = parseLocalDate(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 * Group slots by day-index (0=Mon..6=Sun) and by time-row index.
 * Returns a Map keyed by `${dayIndex}:${rowIndex}`.
 */
function buildSlotMap(
  slots: ScheduleSlot[],
  days: Date[]
): Map<string, ScheduleSlot> {
  const map = new Map<string, ScheduleSlot>();
  for (const slot of slots) {
    const dt = new Date(slot.startsAt);
    const dayIdx = days.findIndex(
      (d) =>
        d.getFullYear() === dt.getFullYear() &&
        d.getMonth() === dt.getMonth() &&
        d.getDate() === dt.getDate()
    );
    if (dayIdx === -1) continue;
    const rowIdx = TIME_ROWS.findIndex(
      (r) => r.hour === dt.getHours() && r.minute === dt.getMinutes()
    );
    if (rowIdx === -1) continue;
    map.set(`${dayIdx}:${rowIdx}`, slot);
  }
  return map;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="flex flex-col gap-2 px-4 py-6" aria-busy="true" aria-label="Loading schedule">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2 h-8">
          <div className="w-12 flex-shrink-0 h-full rounded-[4px] bg-[oklch(94%_0.003_264)]" />
          {Array.from({ length: 7 }).map((_, j) => (
            <div
              key={j}
              className="flex-1 h-full rounded-[4px] bg-[oklch(94%_0.003_264)]"
              style={{
                opacity: 0.4 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyWeek() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center">
        <CalendarDays size={18} className="text-[oklch(60%_0.006_264)]" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[oklch(40%_0.005_264)]">No slots this week</p>
        <p className="text-xs text-[oklch(60%_0.006_264)] max-w-[26ch] leading-relaxed">
          No bookable slots were generated for this period.
        </p>
      </div>
    </div>
  );
}

// ─── Slot cell ────────────────────────────────────────────────────────────────

function SlotCell({
  slot,
  isActive,
  onClick,
}: {
  slot: ScheduleSlot;
  isActive: boolean;
  onClick: () => void;
}) {
  if (slot.isBooked) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={
          slot.appointment
            ? `${slot.appointment.callerName} — ${slot.appointment.reason}`
            : "Booked"
        }
        className={`w-full h-full rounded-[4px] px-1.5 overflow-hidden transition-all duration-150 outline-none cursor-pointer text-left ${
          isActive
            ? "ring-2 ring-[oklch(48%_0.2_264)] ring-offset-1"
            : ""
        }`}
        style={{
          background: "color-mix(in oklch, oklch(48% 0.2 264) 12%, white)",
          border: "1px solid color-mix(in oklch, oklch(48% 0.2 264) 30%, transparent)",
        }}
      >
        <div className="flex items-center gap-1 min-w-0">
          <User
            size={9}
            className="flex-shrink-0"
            style={{ color: "oklch(48% 0.2 264)" }}
            aria-hidden="true"
          />
          {slot.appointment && (
            <span
              className="text-[10px] font-medium truncate leading-tight"
              style={{ color: "oklch(38% 0.18 264)" }}
            >
              {slot.appointment.callerName}
            </span>
          )}
        </div>
      </button>
    );
  }

  // Available
  return (
    <div
      className="w-full h-full rounded-[4px]"
      style={{
        background: "oklch(96.5% 0.003 264)",
        border: "1px solid oklch(90% 0.003 264)",
      }}
      aria-label="Available"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ScheduleWeek({
  slots,
  weekStart,
  loading = false,
  onPrevWeek,
  onNextWeek,
}: ScheduleWeekProps) {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const slotMap = useMemo(() => buildSlotMap(slots, days), [slots, days]);
  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);

  // Check if any slot exists in the visible time range
  const hasAnySlot = slots.length > 0;

  // Compute which rows have at least one slot (to avoid rendering a wall of empty rows)
  const activeRowIndices = useMemo(() => {
    const set = new Set<number>();
    for (const key of slotMap.keys()) {
      const rowIdx = parseInt(key.split(":")[1], 10);
      set.add(rowIdx);
    }
    return set;
  }, [slotMap]);

  // Determine visible rows: those with a slot, plus one row above/below for context
  const visibleRowIndices = useMemo(() => {
    if (!hasAnySlot) return new Set<number>();
    const sorted = Array.from(activeRowIndices).sort((a, b) => a - b);
    const min = Math.max(0, sorted[0] - 1);
    const max = Math.min(TIME_ROWS.length - 1, sorted[sorted.length - 1] + 1);
    const set = new Set<number>();
    for (let i = min; i <= max; i++) set.add(i);
    return set;
  }, [activeRowIndices, hasAnySlot]);

  const visibleRows = useMemo(
    () =>
      hasAnySlot
        ? TIME_ROWS.filter((_, i) => visibleRowIndices.has(i))
        : [],
    [hasAnySlot, visibleRowIndices]
  );

  return (
    <div className="flex flex-col bg-white rounded-[8px] border border-[oklch(88%_0.004_264)] overflow-hidden">
      {/* Header: week nav + label */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(88%_0.004_264)] bg-[oklch(98.5%_0.002_264)]">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-[oklch(55%_0.006_264)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[oklch(9%_0_0)] tabular-nums">
            {weekLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label="Previous week"
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[oklch(55%_0.006_264)] hover:text-[oklch(9%_0_0)] hover:bg-[oklch(94%_0.003_264)] transition-colors duration-150 outline-none cursor-pointer"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            aria-label="Next week"
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[oklch(55%_0.006_264)] hover:text-[oklch(9%_0_0)] hover:bg-[oklch(94%_0.003_264)] transition-colors duration-150 outline-none cursor-pointer"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : !hasAnySlot ? (
        <EmptyWeek />
      ) : (
        <div className="overflow-auto" style={{ maxHeight: "480px" }}>
          {/* Day column headers */}
          <div
            className="grid sticky top-0 bg-white z-10 border-b border-[oklch(88%_0.004_264)]"
            style={{ gridTemplateColumns: "3rem repeat(7, 1fr)" }}
          >
            {/* Time gutter spacer */}
            <div aria-hidden="true" />
            {days.map((day, i) => {
              const today = isToday(day);
              return (
                <div
                  key={i}
                  className={`px-1 py-2.5 text-center border-l border-[oklch(92%_0.003_264)] ${
                    i === 0 ? "border-l-0" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block leading-none mb-1 ${
                      today
                        ? "text-[oklch(48%_0.2_264)]"
                        : "text-[oklch(40%_0.005_264)]"
                    }`}
                  >
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className={`text-[10px] leading-none ${
                      today
                        ? "text-[oklch(48%_0.2_264)]"
                        : "text-[oklch(60%_0.006_264)]"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          <div role="grid" aria-label={`Schedule for week of ${weekLabel}`}>
            {visibleRows.map((row) => {
              const rowOriginalIdx = TIME_ROWS.indexOf(row);
              return (
                <div
                  key={row.label}
                  role="row"
                  className="grid hover:bg-[oklch(98.5%_0.002_264)] transition-colors duration-100"
                  style={{ gridTemplateColumns: "3rem repeat(7, 1fr)" }}
                >
                  {/* Time label */}
                  <div
                    className="flex items-center justify-end pr-2.5 py-0.5"
                    aria-hidden="true"
                  >
                    <span
                      className={`text-[10px] font-mono tabular-nums ${
                        row.minute === 0
                          ? "text-[oklch(50%_0.005_264)]"
                          : "text-[oklch(70%_0.005_264)]"
                      }`}
                    >
                      {row.minute === 0 ? row.label : ""}
                    </span>
                  </div>

                  {/* Slot cells */}
                  {days.map((_, dayIdx) => {
                    const key = `${dayIdx}:${rowOriginalIdx}`;
                    const slot = slotMap.get(key);
                    return (
                      <div
                        key={dayIdx}
                        role="gridcell"
                        aria-label={
                          slot
                            ? slot.isBooked
                              ? `${row.label} ${DAY_LABELS[dayIdx]} — booked by ${slot.appointment?.callerName ?? "unknown"}`
                              : `${row.label} ${DAY_LABELS[dayIdx]} — available`
                            : `${row.label} ${DAY_LABELS[dayIdx]} — no slot`
                        }
                        className={`px-0.5 py-0.5 border-l border-[oklch(92%_0.003_264)] h-8 ${
                          dayIdx === 0 ? "border-l-0" : ""
                        }`}
                      >
                        {slot ? (
                          <SlotCell
                            slot={slot}
                            isActive={activeSlotId === slot.id}
                            onClick={() =>
                              setActiveSlotId((prev) =>
                                prev === slot.id ? null : slot.id
                              )
                            }
                          />
                        ) : (
                          /* No slot — empty cell */
                          <div className="w-full h-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && hasAnySlot && (
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[oklch(92%_0.003_264)] bg-[oklch(98.5%_0.002_264)]">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[2px]"
              style={{
                background: "oklch(96.5% 0.003 264)",
                border: "1px solid oklch(90% 0.003 264)",
              }}
              aria-hidden="true"
            />
            <span className="text-xs text-[oklch(55%_0.006_264)]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[2px]"
              style={{
                background: "color-mix(in oklch, oklch(48% 0.2 264) 12%, white)",
                border: "1px solid color-mix(in oklch, oklch(48% 0.2 264) 30%, transparent)",
              }}
              aria-hidden="true"
            />
            <span className="text-xs text-[oklch(55%_0.006_264)]">Booked</span>
          </div>
        </div>
      )}
    </div>
  );
}
