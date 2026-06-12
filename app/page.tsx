"use client";

/**
 * Public caller page — /
 *
 * Drives CallerPage from an ElevenLabs useConversation session.
 * Must be a Client Component because it uses browser APIs (mic, WebRTC).
 *
 * Session strategy:
 *  1. Try GET /api/elevenlabs/token → use returned token as conversationToken (WebRTC).
 *  2. If the route returns non-2xx (no keys set), fall back to public agentId session.
 *  3. If NEXT_PUBLIC_ELEVENLABS_AGENT_ID is also missing, show a friendly no-key notice.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { CallerPage } from "@/components/caller/CallerPage";
import type { CallState, SpeakerMode } from "@/components/caller/CallState";
import type { CheckAvailabilityResult, BookAppointmentResult } from "@/lib/types";

// ─── Inner component (must be inside ConversationProvider) ────────────────────

function CallerInner() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "";

  const [callState, setCallState] = useState<CallState>("idle");
  const [speakerMode, setSpeakerMode] = useState<SpeakerMode>("listening");
  const [liveCaption, setLiveCaption] = useState<string | undefined>(undefined);
  const [confirmationText, setConfirmationText] = useState<string | undefined>(undefined);
  const [appointment, setAppointment] = useState<
    { callerName: string; reason: string; startsAt: string; duration: number } | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  // Accumulate transcript lines for POST /api/call-log on session end
  const transcriptRef = useRef<string[]>([]);
  const appointmentIdRef = useRef<string | undefined>(undefined);

  const conversation = useConversation({
    onConnect: () => {
      setCallState("live");
    },
    onDisconnect: () => {
      // If we haven't confirmed a booking, move to "ended"
      setCallState((prev) =>
        prev === "confirmed" ? "confirmed" : "ended"
      );
    },
    onError: (message) => {
      setErrorMessage(typeof message === "string" ? message : "Connection error.");
      setCallState("ended");
    },
    onModeChange: ({ mode }) => {
      setSpeakerMode(mode === "speaking" ? "speaking" : "listening");
    },
    onMessage: (event) => {
      // Accumulate transcript lines
      if ("message" in event && typeof event.message === "string") {
        const role = "source" in event ? (event.source === "user" ? "Caller" : "Agent") : "Agent";
        transcriptRef.current.push(`[${role}] ${event.message}`);
        // Show agent speech as live caption
        if (role === "Agent") {
          setLiveCaption(event.message);
        }
      }
    },
    clientTools: {
      check_availability: async (params: Record<string, unknown>) => {
        const date = typeof params.date === "string" ? params.date : undefined;
        const url = date
          ? `/api/availability?date=${encodeURIComponent(date)}`
          : "/api/availability";
        const res = await fetch(url);
        const data: CheckAvailabilityResult = await res.json();
        return JSON.stringify(data);
      },
      book_appointment: async (params: Record<string, unknown>) => {
        const slot_id = String(params.slot_id ?? "");
        const caller_name = String(params.caller_name ?? "");
        const reason = String(params.reason ?? "");

        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot_id, caller_name, reason }),
        });
        const data: BookAppointmentResult = await res.json();

        if (data.ok && data.appointment_id) {
          appointmentIdRef.current = data.appointment_id;
          // Drive UI into confirmed state
          setConfirmationText(data.confirmation);
          setAppointment({
            callerName: caller_name,
            reason,
            startsAt: data.starts_at ?? new Date().toISOString(),
            duration: 30,
          });
          setCallState("confirmed");
        }

        return JSON.stringify(data);
      },
    },
  });

  // Once a booking is confirmed, let the agent deliver its closing line, then
  // hang up automatically so it doesn't keep listening forever.
  useEffect(() => {
    if (callState !== "confirmed") return;
    const t = setTimeout(() => {
      conversation.endSession();
    }, 4500);
    return () => clearTimeout(t);
  }, [callState, conversation]);

  // Post transcript to /api/call-log when session ends
  useEffect(() => {
    if (callState === "ended" || callState === "confirmed") {
      const transcript = transcriptRef.current.join("\n\n");
      if (!transcript) return;
      fetch("/api/call-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          appointment_id: appointmentIdRef.current ?? null,
        }),
      }).catch((err) => console.warn("[call-log] Failed to post transcript:", err));
    }
  }, [callState]);

  const handleStartCall = useCallback(async () => {
    setCallState("connecting");
    setLiveCaption(undefined);
    setErrorMessage(undefined);
    setConfirmationText(undefined);
    setAppointment(undefined);
    transcriptRef.current = [];
    appointmentIdRef.current = undefined;

    try {
      // Attempt to get a signed conversation token from our server route
      const tokenRes = await fetch("/api/elevenlabs/token");
      if (tokenRes.ok) {
        const { token } = await tokenRes.json() as { token: string };
        conversation.startSession({ conversationToken: token });
        return;
      }
    } catch {
      // Fall through to agentId fallback
    }

    // Fallback: public session by agentId
    if (!agentId) {
      setErrorMessage("No ElevenLabs agent configured. Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID.");
      setCallState("ended");
      return;
    }
    conversation.startSession({ agentId });
  }, [conversation, agentId]);

  const handleEndCall = useCallback(() => {
    conversation.endSession();
  }, [conversation]);

  const handleReset = useCallback(() => {
    conversation.endSession();
    setCallState("idle");
    setLiveCaption(undefined);
    setErrorMessage(undefined);
    setConfirmationText(undefined);
    setAppointment(undefined);
    transcriptRef.current = [];
    appointmentIdRef.current = undefined;
  }, [conversation]);

  return (
    <CallerPage
      callState={callState}
      speakerMode={speakerMode}
      liveCaption={liveCaption}
      confirmationText={confirmationText}
      appointment={appointment}
      errorMessage={errorMessage}
      onStartCall={handleStartCall}
      onEndCall={handleEndCall}
      onReset={handleReset}
    />
  );
}

// ─── Page (wraps in ConversationProvider) ─────────────────────────────────────

export default function Home() {
  return (
    <ConversationProvider>
      <CallerInner />
    </ConversationProvider>
  );
}
