"use client";

import type { DashboardHeaderProps } from "./DashboardTypes";

export function DashboardHeader({
  clinicName,
  hasActiveCall = false,
  activeCallCount = 0,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-[oklch(86%_0.004_264)] bg-white sticky top-0 z-30 shadow-[0_1px_0_oklch(86%_0.004_264)]">
      <div className="flex items-center gap-3">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-[4px] flex items-center justify-center"
            style={{ background: "var(--fd-fg, oklch(9% 0 0))" }}
          >
            <span
              className="text-[10px] font-bold leading-none"
              style={{ color: "var(--fd-bg, #ffffff)" }}
              aria-hidden="true"
            >
              FD
            </span>
          </div>
          <span className="text-sm font-semibold text-[oklch(7%_0_0)]">Frontdesk</span>
        </div>
        {/* Separator */}
        <span className="w-px h-4 bg-[oklch(82%_0.004_264)]" aria-hidden="true" />
        {/* Clinic name */}
        <span className="text-sm font-medium text-[oklch(34%_0.005_264)]">{clinicName}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Live indicator */}
        {hasActiveCall && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(52%_0.22_25_/_0.08)] border border-[oklch(52%_0.22_25_/_0.22)]"
            role="status"
            aria-live="polite"
            aria-label={`${activeCallCount} active call${activeCallCount !== 1 ? "s" : ""} in progress`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[oklch(52%_0.22_25)]"
              style={{ animation: "live-pulse 1.5s ease-in-out infinite" }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-[oklch(38%_0.22_25)]">
              {activeCallCount > 1 ? `${activeCallCount} live` : "Live"}
            </span>
          </div>
        )}

        {/* Dashboard label */}
        <nav aria-label="Primary navigation">
          <span className="text-xs font-semibold text-[oklch(34%_0.005_264)] px-2.5 py-1 bg-[oklch(97%_0.002_264)] rounded-[4px] border border-[oklch(84%_0.004_264)]">
            Dashboard
          </span>
        </nav>
      </div>
    </header>
  );
}
