"use client";

import { PhoneOff } from "lucide-react";
import { Waveform } from "./Waveform";
import type { SpeakerMode } from "./CallState";

interface CallerLiveProps {
  speakerMode: SpeakerMode;
  liveCaption?: string;
  onEndCall?: () => void;
}

export function CallerLive({ speakerMode, liveCaption, onEndCall }: CallerLiveProps) {
  const speakerLabel = speakerMode === "speaking" ? "Agent speaking" : "Listening";
  const speakerSub =
    speakerMode === "speaking"
      ? "The receptionist is responding"
      : "Speak now. The agent is listening.";

  return (
    <div
      className="flex flex-col items-center gap-10 text-center"
      style={{ animation: "status-fade-in 200ms cubic-bezier(0.0, 0, 0.2, 1)" }}
    >
      {/* Status pill */}
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300"
        style={
          speakerMode === "speaking"
            ? {
                background: "color-mix(in oklch, var(--fd-accent) 10%, transparent)",
                borderColor: "color-mix(in oklch, var(--fd-accent) 30%, transparent)",
                color: "var(--fd-accent)",
              }
            : {
                background: "oklch(95% 0.016 145 / 0.35)",
                borderColor: "oklch(48% 0.16 145 / 0.3)",
                color: "oklch(36% 0.14 145)",
              }
        }
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
          style={{
            background: speakerMode === "speaking" ? "var(--fd-accent)" : "oklch(48% 0.16 145)",
            animation:
              speakerMode === "speaking"
                ? "live-pulse 1.2s ease-in-out infinite"
                : "live-pulse 2s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        {speakerLabel}
      </div>

      {/* Waveform orb */}
      <Waveform speakerMode={speakerMode} isActive={true} />

      {/* Sub-label */}
      <p
        className="text-sm font-medium transition-all duration-300"
        style={{ color: "var(--fd-muted)" }}
        aria-live="polite"
      >
        {speakerSub}
      </p>

      {/* Live captions */}
      <div
        className="w-full max-w-sm min-h-[4rem] flex items-center justify-center px-2"
        aria-live="polite"
        aria-label="Live captions"
      >
        {liveCaption ? (
          <p
            className="text-sm leading-relaxed font-medium"
            style={{ color: "var(--fd-fg)", textWrap: "pretty" } as React.CSSProperties}
          >
            &ldquo;{liveCaption}&rdquo;
          </p>
        ) : (
          <p className="text-xs italic" style={{ color: "color-mix(in oklch, var(--fd-muted) 70%, transparent)" }}>
            Captions will appear here
          </p>
        )}
      </div>

      {/* End call — premium tactile button */}
      <button
        onClick={onEndCall}
        className="flex items-center justify-center w-16 h-16 rounded-full text-white transition-all duration-150 outline-none cursor-pointer hover:brightness-90 active:scale-[0.93] focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.22_25)] focus-visible:ring-offset-2 shadow-[0_4px_16px_oklch(52%_0.22_25_/_0.4),0_1px_4px_oklch(0%_0_0_/_0.18)]"
        style={{
          background: "oklch(52% 0.22 25)",
        }}
        aria-label="End call"
        title="End call"
      >
        <PhoneOff size={22} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  );
}
