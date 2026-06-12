"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { ScheduleWeekProps, ScheduleSlot } from "./ScheduleWeekTypes";

export type { ScheduleWeekProps, ScheduleSlot } from "./ScheduleWeekTypes";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Total hours in the axis: 00:00 to 24:00 */
const TOTAL_HOURS = 24;

/** Height in pixels for one hour row */
const HOUR_HEIGHT_PX = 56;

const TOTAL_HEIGHT_PX = TOTAL_HOURS * HOUR_HEIGHT_PX;

/** Width of the left time gutter */
const GUTTER_WIDTH = 52;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

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

function weekDays(weekStart: string): Date[] {
  const start = parseLocalDate(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/** Returns top offset in px for a given time within the 24-hour axis */
function timeToTop(hours: number, minutes: number): number {
  return (hours + minutes / 60) * HOUR_HEIGHT_PX;
}

/** Returns height in px for a given duration in minutes */
function durationToHeight(durationMin: number): number {
  return (durationMin / 60) * HOUR_HEIGHT_PX;
}

interface SlotWithPosition {
  slot: ScheduleSlot;
  dayIdx: number;
  top: number;
  height: number;
}

function buildPositionedSlots(slots: ScheduleSlot[], days: Date[]): SlotWithPosition[] {
  const result: SlotWithPosition[] = [];
  for (const slot of slots) {
    const dt = new Date(slot.startsAt);
    const dayIdx = days.findIndex(
      (d) =>
        d.getFullYear() === dt.getFullYear() &&
        d.getMonth() === dt.getMonth() &&
        d.getDate() === dt.getDate()
    );
    if (dayIdx === -1) continue;
    const top = timeToTop(dt.getHours(), dt.getMinutes());
    const height = Math.max(durationToHeight(slot.durationMin), 20);
    result.push({ slot, dayIdx, top, height });
  }
  return result;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCalendar() {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden" aria-busy="true" aria-label="Loading calendar">
      {/* Gutter */}
      <div style={{ width: GUTTER_WIDTH, flexShrink: 0 }} />
      {/* Columns */}
      <div className="flex flex-1 gap-1 px-2 py-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="rounded-[4px] bg-[oklch(94%_0.003_264)]"
                style={{
                  height: HOUR_HEIGHT_PX * 0.8,
                  opacity: 0.3 + (j % 3) * 0.2,
                  marginTop: j === 0 ? HOUR_HEIGHT_PX * (2 + i * 0.3) : 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyWeek() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 flex-1 py-16 px-4 text-center">
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

// ─── Slot block ───────────────────────────────────────────────────────────────

function SlotBlock({ slot, height }: { slot: ScheduleSlot; height: number }) {
  const isBooked = slot.isBooked;
  const showName = height >= 28 && isBooked && slot.appointment;

  return (
    <div
      className="absolute inset-x-[2px] rounded-[4px] overflow-hidden transition-opacity duration-100 hover:opacity-90"
      style={{
        height,
        background: isBooked
          ? "color-mix(in oklch, var(--fd-accent, #0070f3) 14%, white)"
          : "oklch(96.5% 0.003 264)",
        border: isBooked
          ? "1px solid color-mix(in oklch, var(--fd-accent, #0070f3) 35%, transparent)"
          : "1px solid oklch(89% 0.003 264)",
      }}
      aria-label={
        isBooked
          ? `Booked: ${slot.appointment?.callerName ?? "unknown"}`
          : "Available"
      }
    >
      {showName && (
        <p
          className="px-1.5 pt-0.5 text-[10px] font-medium leading-tight truncate"
          style={{ color: "var(--fd-accent, #0070f3)" }}
        >
          {slot.appointment!.callerName}
        </p>
      )}
    </div>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolledWeekRef = useRef<string | null>(null);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);
  const positionedSlots = useMemo(
    () => buildPositionedSlots(slots, days),
    [slots, days]
  );

  const hasAnySlot = slots.length > 0;

  // Auto-scroll to the first slot of the day, but only ONCE per week. The
  // dashboard refetches every 1.5s; without this guard each poll would yank the
  // scroll position back and fight the user's own scrolling.
  useEffect(() => {
    if (loading || !scrollRef.current) return;
    if (scrolledWeekRef.current === weekStart) return;
    scrolledWeekRef.current = weekStart;
    let scrollTarget: number;
    if (hasAnySlot) {
      const firstSlot = positionedSlots.reduce((min, s) => (s.top < min ? s.top : min), Infinity);
      scrollTarget = Math.max(0, firstSlot - HOUR_HEIGHT_PX);
    } else {
      scrollTarget = timeToTop(8, 0);
    }
    scrollRef.current.scrollTop = scrollTarget;
  }, [loading, hasAnySlot, positionedSlots, weekStart]);

  // Build per-day slot lists for O(1) column rendering
  const slotsByDay = useMemo(() => {
    const map = new Map<number, SlotWithPosition[]>();
    for (const ps of positionedSlots) {
      const arr = map.get(ps.dayIdx) ?? [];
      arr.push(ps);
      map.set(ps.dayIdx, arr);
    }
    return map;
  }, [positionedSlots]);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);

  return (
    <div
      className="flex flex-col bg-white rounded-[8px] border border-[oklch(88%_0.004_264)] overflow-hidden"
      style={{ minHeight: 0, flex: 1 }}
    >
      {/* Header: week nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(88%_0.004_264)] bg-[oklch(98.5%_0.002_264)] flex-shrink-0">
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

      {/* Day column headers (sticky) */}
      <div
        className="flex flex-shrink-0 border-b border-[oklch(88%_0.004_264)] bg-white"
        style={{ paddingLeft: GUTTER_WIDTH }}
      >
        {days.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className="flex-1 px-1 py-2 text-center border-l border-[oklch(92%_0.003_264)] first:border-l-0"
            >
              <span
                className={`text-xs font-semibold block leading-none mb-0.5 ${
                  today ? "text-[oklch(48%_0.2_264)]" : "text-[oklch(40%_0.005_264)]"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
              <span
                className={`text-[10px] leading-none ${
                  today ? "text-[oklch(48%_0.2_264)]" : "text-[oklch(60%_0.006_264)]"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable body */}
      {loading ? (
        <SkeletonCalendar />
      ) : !hasAnySlot ? (
        <EmptyWeek />
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        >
          <div className="flex" style={{ height: TOTAL_HEIGHT_PX, minHeight: TOTAL_HEIGHT_PX }}>
            {/* Time gutter */}
            <div
              className="flex-shrink-0 relative select-none"
              style={{ width: GUTTER_WIDTH }}
              aria-hidden="true"
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute right-0 flex items-start justify-end pr-2"
                  style={{ top: h * HOUR_HEIGHT_PX, height: HOUR_HEIGHT_PX }}
                >
                  <span className="text-[10px] font-mono tabular-nums text-[oklch(60%_0.005_264)] -mt-[5px]">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((_, dayIdx) => {
              const daySlots = slotsByDay.get(dayIdx) ?? [];
              return (
                <div
                  key={dayIdx}
                  className="flex-1 relative border-l border-[oklch(92%_0.003_264)]"
                  style={{ height: TOTAL_HEIGHT_PX }}
                >
                  {/* Hour grid lines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-[oklch(92%_0.003_264)]"
                      style={{ top: h * HOUR_HEIGHT_PX }}
                      aria-hidden="true"
                    />
                  ))}

                  {/* Slot blocks */}
                  {daySlots.map(({ slot, top, height }) => (
                    <div
                      key={slot.id}
                      className="absolute left-0 right-0"
                      style={{ top, height }}
                    >
                      <SlotBlock slot={slot} height={height} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && hasAnySlot && (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[oklch(92%_0.003_264)] bg-[oklch(98.5%_0.002_264)] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[2px]"
              style={{
                background: "oklch(96.5% 0.003 264)",
                border: "1px solid oklch(89% 0.003 264)",
              }}
              aria-hidden="true"
            />
            <span className="text-xs text-[oklch(55%_0.006_264)]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[2px]"
              style={{
                background: "color-mix(in oklch, var(--fd-accent, #0070f3) 14%, white)",
                border: "1px solid color-mix(in oklch, var(--fd-accent, #0070f3) 35%, transparent)",
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
