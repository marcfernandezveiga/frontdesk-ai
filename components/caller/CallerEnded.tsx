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
      style={{ animation: "status-fade-in 200ms ease-out" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "color-mix(in oklch, var(--fd-fg) 6%, var(--fd-bg) 94%)" }}
      >
        <PhoneOff
          size={28}
          strokeWidth={1.5}
          style={{ color: "var(--fd-muted)" }}
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
        className="inline-flex items-center justify-center gap-2 h-8 px-3 text-sm font-medium rounded-[6px] border transition-colors duration-150 outline-none cursor-pointer"
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
