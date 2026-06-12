"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CallerIdleProps {
  clinicName: string;
  onStartCall?: () => void;
}

export function CallerIdle({ clinicName, onStartCall }: CallerIdleProps) {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      {/* Trust mark */}
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-[oklch(60%_0.006_264)] uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[oklch(53%_0.16_145)]" aria-hidden="true" />
        AI Receptionist
      </div>

      {/* Headline */}
      <div className="flex flex-col gap-3">
        <h1
          className="text-4xl font-semibold tracking-[-0.03em] leading-tight text-[oklch(9%_0_0)]"
          style={{ textWrap: "balance" }}
        >
          {clinicName}
        </h1>
        <p className="text-base text-[oklch(40%_0.005_264)] max-w-[28ch] leading-relaxed">
          Book an appointment instantly — our AI receptionist is available around the clock.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <Button
          size="xl"
          onClick={onStartCall}
          className="gap-3 min-w-[220px]"
          aria-label="Start a voice call with the clinic"
        >
          <Phone size={20} strokeWidth={2} aria-hidden="true" />
          Call the clinic
        </Button>
        <p className="text-xs text-[oklch(60%_0.006_264)]">
          Microphone required. Works in Chrome and Safari.
        </p>
      </div>

      {/* Trust footer */}
      <div className="flex items-center gap-6 text-xs text-[oklch(60%_0.006_264)]">
        <span>No hold time</span>
        <span aria-hidden="true" className="w-px h-3 bg-[oklch(88%_0.004_264)]" />
        <span>Available 24/7</span>
        <span aria-hidden="true" className="w-px h-3 bg-[oklch(88%_0.004_264)]" />
        <span>Books in seconds</span>
      </div>
    </div>
  );
}
