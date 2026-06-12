"use client";

import { Button } from "@/components/ui/Button";

interface CallerConnectingProps {
  onCancel?: () => void;
}

export function CallerConnecting({ onCancel }: CallerConnectingProps) {
  return (
    <div
      className="flex flex-col items-center gap-8 text-center"
      style={{ animation: "status-fade-in 200ms ease-out" }}
    >
      {/* Spinner orb */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer ring */}
        <span
          className="absolute inset-0 rounded-full border-2 border-[oklch(88%_0.004_264)]"
          aria-hidden="true"
        />
        {/* Spinning arc */}
        <span
          className="absolute inset-[3px] rounded-full border-2 border-transparent border-t-[oklch(9%_0_0)]"
          style={{ animation: "spinner 0.9s linear infinite" }}
          aria-hidden="true"
        />
        {/* Inner dot */}
        <span
          className="w-2 h-2 rounded-full bg-[oklch(9%_0_0)]"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg font-medium text-[oklch(9%_0_0)] tracking-tight">
          Connecting
        </p>
        <p className="text-sm text-[oklch(40%_0.005_264)]">
          Requesting microphone and reaching the agent&hellip;
        </p>
      </div>

      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
