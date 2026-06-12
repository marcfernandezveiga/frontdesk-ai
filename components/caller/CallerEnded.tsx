"use client";

import { PhoneOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
      <div className="w-16 h-16 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center">
        <PhoneOff
          size={28}
          strokeWidth={1.5}
          className="text-[oklch(40%_0.005_264)]"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-[oklch(9%_0_0)]">
          Call ended
        </h2>
        <p className="text-sm text-[oklch(40%_0.005_264)] max-w-[28ch] leading-relaxed">
          {errorMessage ||
            "No appointment was booked during this call. Call again if you'd like to schedule."}
        </p>
      </div>

      <Button variant="secondary" size="sm" onClick={onReset} className="gap-2">
        <RefreshCw size={14} aria-hidden="true" />
        Call again
      </Button>
    </div>
  );
}
