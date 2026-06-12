"use client";

import { Phone } from "lucide-react";

interface CallerIdleProps {
  clinicName: string;
  tagline?: string;
  onStartCall?: () => void;
}

export function CallerIdle({ clinicName, tagline, onStartCall }: CallerIdleProps) {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      {/* Trust mark */}
      <div
        className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
        style={{ color: "var(--fd-muted)" }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(53% 0.16 145)" }}
          aria-hidden="true"
        />
        AI Receptionist
      </div>

      {/* Headline */}
      <div className="flex flex-col gap-3">
        <h1
          className="text-4xl font-semibold tracking-[-0.03em] leading-tight"
          style={{ color: "var(--fd-fg)", textWrap: "balance" } as React.CSSProperties}
        >
          {clinicName}
        </h1>
        <p
          className="text-base max-w-[28ch] leading-relaxed"
          style={{ color: "var(--fd-muted)" }}
        >
          {tagline ?? "Book an appointment instantly. The AI receptionist is available around the clock."}
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStartCall}
          className="inline-flex items-center justify-center gap-3 min-w-[220px] h-14 px-8 text-base font-medium rounded-[var(--fd-radius)] transition-all duration-150 outline-none cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: "var(--fd-accent)",
            color: "var(--fd-accent-fg)",
            borderRadius: "var(--fd-radius)",
          }}
          aria-label="Start a voice call"
        >
          <Phone size={20} strokeWidth={2} aria-hidden="true" />
          Call now
        </button>
        <p className="text-xs" style={{ color: "var(--fd-muted)" }}>
          Microphone required. Works in Chrome and Safari.
        </p>
      </div>

      {/* Trust footer */}
      <div className="flex items-center gap-6 text-xs" style={{ color: "var(--fd-muted)" }}>
        <span>No hold time</span>
        <span
          aria-hidden="true"
          className="w-px h-3"
          style={{ background: "var(--fd-border)" }}
        />
        <span>Available 24/7</span>
        <span
          aria-hidden="true"
          className="w-px h-3"
          style={{ background: "var(--fd-border)" }}
        />
        <span>Books in seconds</span>
      </div>
    </div>
  );
}
