"use client";

import { CalendarDays } from "lucide-react";
import type { AvailabilityStripProps } from "./DashboardTypes";

function SkeletonPill() {
  return (
    <div
      className="h-8 w-28 rounded-[4px] bg-[oklch(94%_0.003_264)] animate-pulse"
      aria-hidden="true"
    />
  );
}

export function AvailabilityStrip({ slots, loading = false }: AvailabilityStripProps) {
  return (
    <section
      aria-labelledby="availability-heading"
      className="px-6 py-4 border-b border-[oklch(88%_0.004_264)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays
          size={14}
          className="text-[oklch(60%_0.006_264)]"
          aria-hidden="true"
        />
        <h2
          id="availability-heading"
          className="text-xs font-semibold text-[oklch(40%_0.005_264)] tracking-wide uppercase"
        >
          Open slots today
        </h2>
      </div>

      <div className="flex flex-wrap gap-2" role="list" aria-label="Available appointment slots">
        {loading ? (
          <>
            <SkeletonPill />
            <SkeletonPill />
            <SkeletonPill />
          </>
        ) : slots.length === 0 ? (
          <p className="text-sm text-[oklch(60%_0.006_264)]">
            No open slots remaining today.
          </p>
        ) : (
          slots.map(({ slot, label }) => (
            <div
              key={slot.id}
              role="listitem"
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium
                border transition-colors duration-150
                ${
                  slot.is_booked
                    ? "bg-[oklch(94%_0.003_264)] border-[oklch(88%_0.004_264)] text-[oklch(60%_0.006_264)] line-through"
                    : "bg-[oklch(48%_0.2_264_/_0.06)] border-[oklch(48%_0.2_264_/_0.2)] text-[oklch(38%_0.2_264)]"
                }
              `}
            >
              {!slot.is_booked && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[oklch(48%_0.2_264)]"
                  aria-hidden="true"
                />
              )}
              {label}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
