"use client";

import { CallerIdle } from "./CallerIdle";
import { CallerConnecting } from "./CallerConnecting";
import { CallerLive } from "./CallerLive";
import { CallerConfirmed } from "./CallerConfirmed";
import { CallerEnded } from "./CallerEnded";
import type { CallerPageProps } from "./CallState";

export type { CallerPageProps } from "./CallState";
export type { CallState, SpeakerMode } from "./CallState";

/**
 * CallerPage: the public caller surface.
 *
 * Styled via CSS variables so any tenant theme can override the brand look.
 * The variables are set on a wrapper element by the tenant page via
 * themeToCssVars(). The default values (Vercel look) live in globals.css :root.
 *
 * Wave 2 wiring props:
 *   callState        - drive from ElevenLabs session status
 *   speakerMode      - "listening" | "speaking"
 *   liveCaption      - streamed agent transcript text
 *   confirmationText - POST /api/book confirmation string
 *   appointment      - booking detail object
 *   errorMessage     - surface on ended state without booking
 *   onStartCall      - user presses "Call"
 *   onEndCall        - user presses end-call
 *   onReset          - user presses "Call again"
 *
 *   tenant           - optional TenantConfig for branded copy (name, tagline)
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
  tenant,
}: CallerPageProps) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--fd-bg)", color: "var(--fd-fg)", fontFamily: "var(--fd-font-sans)" }}
    >
      {/* Minimal header */}
      <header
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: "1px solid var(--fd-border)" }}
      >
        <div className="flex items-center gap-2.5">
          {/* Logo: use tenant logo if available, else FD monogram */}
          {tenant?.theme.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={tenant.theme.logoUrl}
              alt={tenant.name}
              className="h-6 w-auto object-contain"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-[4px] flex items-center justify-center"
              style={{ background: "var(--fd-fg)" }}
            >
              <span
                className="text-[10px] font-bold leading-none"
                style={{ color: "var(--fd-bg)" }}
                aria-hidden="true"
              >
                FD
              </span>
            </div>
          )}
          <span
            className="text-sm font-medium"
            style={{ color: "var(--fd-fg)" }}
          >
            {tenant?.name ?? "Frontdesk"}
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: "var(--fd-muted)" }}
        >
          AI Receptionist
        </span>
      </header>

      {/* Main content area */}
      <main
        className="flex flex-1 items-center justify-center px-6 py-16"
        id="main-content"
      >
        <div className="w-full max-w-sm">
          {callState === "idle" && (
            <CallerIdle
              clinicName={tenant?.name ?? "Frontdesk"}
              tagline={tenant?.tagline}
              tenant={tenant}
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
        <p className="text-xs" style={{ color: "var(--fd-muted)" }}>
          Powered by{" "}
          <span
            className="font-medium"
            style={{ color: "var(--fd-fg)", opacity: 0.6 }}
          >
            Frontdesk
          </span>
        </p>
      </footer>
    </div>
  );
}
