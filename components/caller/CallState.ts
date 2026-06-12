/**
 * Call state machine for the Frontdesk caller page.
 * Wave 2 drives these states from the ElevenLabs useConversation hook.
 */

import type { TenantConfig } from "@/lib/tenant";

export type CallState =
  | "idle"        // Before the call. Big "Call" CTA.
  | "connecting"  // WebRTC session establishing. Mic permission, agent loading.
  | "live"        // Session active. Waveform, captions, speaking indicator.
  | "ended"       // Call finished. May or may not have a confirmation.
  | "confirmed";  // Call ended AND a booking was made. Show confirmation card.

export type SpeakerMode = "listening" | "speaking";

/**
 * Props wave 2 must supply to drive the caller page live.
 */
export interface CallerPageProps {
  /**
   * Current state of the call session.
   * Default: "idle"
   */
  callState: CallState;

  /**
   * Which party is currently active (for live state only).
   * "listening" = patient speaking, agent quiet.
   * "speaking"  = agent speaking, patient listening.
   */
  speakerMode?: SpeakerMode;

  /**
   * Live captions text, streamed as the agent speaks.
   * Shown only during "live" state.
   */
  liveCaption?: string;

  /**
   * Booking confirmation line returned from POST /api/book
   * e.g. "Confirmed. Thursday 2:00 PM at Marina Physio."
   * Shown in "confirmed" state.
   */
  confirmationText?: string;

  /**
   * If a booking was made, the appointment details for the summary card.
   */
  appointment?: {
    callerName: string;
    reason: string;
    startsAt: string; // ISO 8601
    duration: number; // minutes
  };

  /**
   * Error message to surface if the call failed.
   * Shown in "ended" state when no confirmation is present.
   */
  errorMessage?: string;

  /**
   * Callback: user pressed "Call" in idle state.
   */
  onStartCall?: () => void;

  /**
   * Callback: user pressed "End call" during live state.
   */
  onEndCall?: () => void;

  /**
   * Callback: user pressed "Call again" after ended/confirmed state.
   */
  onReset?: () => void;

  /**
   * Tenant configuration. When set, the caller page shows the tenant's
   * name, tagline, and logo. The parent component is responsible for applying
   * theme CSS variables via themeToCssVars() on a wrapper element.
   * Optional: omit to show the default Frontdesk look.
   */
  tenant?: TenantConfig;
}
