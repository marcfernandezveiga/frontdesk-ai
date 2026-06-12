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
      style={{ animation: "status-fade-in 200ms ease-out" }}
    >
      {/* Status pill */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-300"
        style={
          speakerMode === "speaking"
            ? {
                background: "color-mix(in oklch, var(--fd-accent) 10%, transparent)",
                borderColor: "color-mix(in oklch, var(--fd-accent) 25%, transparent)",
                color: "var(--fd-accent)",
              }
            : {
                background: "var(--fd-bg)",
                borderColor: "var(--fd-border)",
                color: "var(--fd-muted)",
              }
        }
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
          style={{
            background: speakerMode === "speaking" ? "var(--fd-accent)" : "oklch(53% 0.16 145)",
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
        className="text-sm transition-opacity duration-200"
        style={{ color: "var(--fd-muted)" }}
        aria-live="polite"
      >
        {speakerSub}
      </p>

      {/* Live captions */}
      <div
        className="w-full max-w-sm min-h-[4rem] flex items-center justify-center"
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
          <p className="text-sm italic" style={{ color: "var(--fd-muted)" }}>
            Captions will appear here
          </p>
        )}
      </div>

      {/* End call */}
      <button
        onClick={onEndCall}
        className="flex items-center justify-center w-14 h-14 rounded-full text-white transition-colors duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: "oklch(57% 0.22 25)",
        }}
        aria-label="End call"
        title="End call"
      >
        <PhoneOff size={22} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
