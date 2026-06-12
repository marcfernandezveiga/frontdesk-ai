"use client";

import { BUSINESS_NAME } from "@/lib/types";
import { CallerIdle } from "./CallerIdle";
import { CallerConnecting } from "./CallerConnecting";
import { CallerLive } from "./CallerLive";
import { CallerConfirmed } from "./CallerConfirmed";
import { CallerEnded } from "./CallerEnded";
import type { CallerPageProps } from "./CallState";

export type { CallerPageProps } from "./CallState";
export type { CallState, SpeakerMode } from "./CallState";

/**
 * CallerPage — the public caller surface.
 *
 * Prop interface for wave 2 wiring:
 *   callState        required  — drive from ElevenLabs session status
 *   speakerMode      optional  — "listening" | "speaking"
 *   liveCaption      optional  — streamed agent transcript text
 *   confirmationText optional  — POST /api/book confirmation string
 *   appointment      optional  — booking detail object
 *   errorMessage     optional  — surface on ended state without booking
 *   onStartCall      optional  — called when user presses "Call the clinic"
 *   onEndCall        optional  — called when user presses end-call button
 *   onReset          optional  — called when user presses "Call again"
 */
export function CallerPage({
  callState = "idle",
  speakerMode = "listening",
  liveCaption,
  confirmationText,
  appointment,
  errorMessage,
  onStartCall,
  onEndCall,
  onReset,
}: CallerPageProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-[oklch(88%_0.004_264)]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[4px] bg-[oklch(9%_0_0)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none" aria-hidden="true">
              FD
            </span>
          </div>
          <span className="text-sm font-medium text-[oklch(9%_0_0)]">Frontdesk</span>
        </div>
        <span className="text-xs text-[oklch(60%_0.006_264)]">{BUSINESS_NAME}</span>
      </header>

      {/* Main content area */}
      <main
        className="flex flex-1 items-center justify-center px-6 py-16"
        id="main-content"
      >
        <div className="w-full max-w-sm">
          {callState === "idle" && (
            <CallerIdle
              clinicName={BUSINESS_NAME}
              onStartCall={onStartCall}
            />
          )}
          {callState === "connecting" && (
            <CallerConnecting onCancel={onReset} />
          )}
          {callState === "live" && (
            <CallerLive
              speakerMode={speakerMode}
              liveCaption={liveCaption}
              onEndCall={onEndCall}
            />
          )}
          {callState === "confirmed" && (
            <CallerConfirmed
              confirmationText={confirmationText}
              appointment={appointment}
              onReset={onReset}
            />
          )}
          {callState === "ended" && (
            <CallerEnded
              errorMessage={errorMessage}
              onReset={onReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-6 flex justify-center">
        <p className="text-xs text-[oklch(60%_0.006_264)]">
          Powered by{" "}
          <span className="text-[oklch(40%_0.005_264)] font-medium">Frontdesk AI</span>
        </p>
      </footer>
    </div>
  );
}
