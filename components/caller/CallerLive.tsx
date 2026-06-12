"use client";

import { PhoneOff } from "lucide-react";
import { Waveform } from "./Waveform";
import { Button } from "@/components/ui/Button";
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
      : "Speak now — the agent is listening";

  return (
    <div
      className="flex flex-col items-center gap-10 text-center"
      style={{ animation: "status-fade-in 200ms ease-out" }}
    >
      {/* Status pill */}
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          border transition-colors duration-300
          ${
            speakerMode === "speaking"
              ? "bg-[oklch(48%_0.2_264_/_0.08)] border-[oklch(48%_0.2_264_/_0.2)] text-[oklch(38%_0.2_264)]"
              : "bg-[oklch(97.5%_0.002_264)] border-[oklch(88%_0.004_264)] text-[oklch(40%_0.005_264)]"
          }
        `}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={`
            w-1.5 h-1.5 rounded-full transition-colors duration-300
            ${speakerMode === "speaking" ? "bg-[oklch(48%_0.2_264)]" : "bg-[oklch(53%_0.16_145)]"}
          `}
          style={{
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
        className="text-sm text-[oklch(40%_0.005_264)] transition-opacity duration-200"
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
            className="text-sm leading-relaxed text-[oklch(20%_0.003_264)] font-medium"
            style={{ textWrap: "pretty" }}
          >
            &ldquo;{liveCaption}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-[oklch(60%_0.006_264)] italic">
            Captions will appear here
          </p>
        )}
      </div>

      {/* End call */}
      <button
        onClick={onEndCall}
        className="
          flex items-center justify-center w-14 h-14 rounded-full
          bg-[oklch(57%_0.22_25)] text-white
          hover:bg-[oklch(50%_0.22_25)]
          focus-visible:ring-2 focus-visible:ring-[oklch(57%_0.22_25)] focus-visible:ring-offset-2
          transition-colors duration-150 outline-none cursor-pointer
        "
        aria-label="End call"
        title="End call"
      >
        <PhoneOff size={22} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
