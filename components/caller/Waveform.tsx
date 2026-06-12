"use client";

import type { SpeakerMode } from "./CallState";

interface WaveformProps {
  speakerMode: SpeakerMode;
  isActive: boolean;
}

const BAR_COUNT = 12;

// Static height multipliers — designed to look natural at rest
const BAR_HEIGHTS = [0.3, 0.6, 0.9, 0.5, 0.8, 1.0, 0.7, 0.9, 0.4, 0.7, 0.5, 0.3];

export function Waveform({ speakerMode, isActive }: WaveformProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      role="img"
      aria-label={
        speakerMode === "speaking"
          ? "Agent is speaking"
          : "Listening to you"
      }
    >
      {/* Pulse ring — only when agent is speaking */}
      {speakerMode === "speaking" && isActive && (
        <>
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--fd-accent) 15%, transparent)",
              animation: "pulse-ring 1.5s ease-out infinite",
            }}
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--fd-accent) 10%, transparent)",
              animation: "pulse-ring 1.5s ease-out 0.5s infinite",
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Orb container */}
      <div
        className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: speakerMode === "speaking" ? "var(--fd-accent)" : "var(--fd-fg)",
          animation: isActive ? "orb-breathe 2s ease-in-out infinite" : "none",
          transition: "background 300ms ease-out",
        }}
      >
        {/* Waveform bars */}
        <div className="flex items-center gap-[3px]" aria-hidden="true">
          {BAR_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className="block w-[3px] rounded-full"
              style={{
                height: `${Math.round(h * 28)}px`,
                backgroundColor: "rgba(255,255,255,0.9)",
                transformOrigin: "center",
                animation: isActive
                  ? `waveform-bar ${0.6 + (i % 4) * 0.15}s ease-in-out ${i * 0.06}s infinite`
                  : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
