"use client";

import { PhoneOff, RefreshCw } from "lucide-react";

interface CallerEndedProps {
  errorMessage?: string;
  onReset?: () => void;
}

export function CallerEnded({ errorMessage, onReset }: CallerEndedProps) {
  return (
    <div
      className="flex flex-col items-center gap-8 text-center"
      style={{ animation: "status-fade-in 200ms cubic-bezier(0.0, 0, 0.2, 1)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_0_6px_oklch(0%_0_0_/_0.04)]"
        style={{ background: "color-mix(in oklch, var(--fd-fg) 7%, var(--fd-bg) 93%)" }}
      >
        <PhoneOff
          size={28}
          strokeWidth={1.75}
          style={{ color: "color-mix(in oklch, var(--fd-muted) 80%, var(--fd-fg))" }}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: "var(--fd-fg)" }}
        >
          Call ended
        </h2>
        <p
          className="text-sm max-w-[28ch] leading-relaxed"
          style={{ color: "var(--fd-muted)" }}
        >
          {errorMessage ??
            "No appointment was booked. Call again if you'd like to schedule."}
        </p>
      </div>

      <button
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 h-8 px-3.5 text-sm font-medium rounded-[6px] border transition-all duration-150 outline-none cursor-pointer hover:bg-[oklch(97.5%_0.002_264)] hover:border-[oklch(74%_0.006_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2"
        style={{
          color: "var(--fd-fg)",
          borderColor: "var(--fd-border)",
          background: "transparent",
        }}
      >
        <RefreshCw size={14} aria-hidden="true" />
        Call again
      </button>
    </div>
  );
}
