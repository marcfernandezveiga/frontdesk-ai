"use client";

/**
 * /c/[slug] — branded caller page for a tenant.
 *
 * Fetches GET /api/businesses/[slug] to get TenantConfig, then drives a full
 * ElevenLabs ConvAI session with per-tenant prompt + greeting overrides.
 * All booking API calls are scoped to the tenant slug via ?business=<slug>.
 *
 * Session strategy:
 *  1. GET /api/elevenlabs/token -> use conversationToken with per-tenant overrides.
 *  2. If token route fails, fall back to agentId-only session (no overrides).
 *  3. If neither is available, show a config error in "ended" state.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { CallerPage } from "@/components/caller/CallerPage";
import { themeToCssVars } from "@/lib/tenant";
import type { CallState, SpeakerMode } from "@/components/caller/CallState";
import type { TenantConfig } from "@/lib/tenant";
import type { CheckAvailabilityResult, BookAppointmentResult } from "@/lib/types";

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildReceptionistPrompt(tenant: TenantConfig): string {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const hoursLines = Object.entries(tenant.hours)
    .map(([dayIdx, h]) => {
      if (!h) return null;
      return `${dayNames[Number(dayIdx)]}: ${h.open} to ${h.close}`;
    })
    .filter(Boolean)
    .join(", ");

  const servicesList = tenant.services.map((s) => s.name).join(", ");

  return [
    `You are a friendly, professional AI receptionist for ${tenant.name}.`,
    tenant.description ? `About the business: ${tenant.description}` : null,
    servicesList ? `Services offered: ${servicesList}.` : null,
    hoursLines ? `Opening hours: ${hoursLines}.` : null,
    "Your job is to help callers book appointments. Be warm but brief. Do not make up information not listed above.",
    "When a caller wants to book, use the check_availability tool to find open slots, then book_appointment to confirm.",
    "After confirming a booking, read back the appointment time clearly, thank the caller, and end the call.",
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── Inner component (must be inside ConversationProvider) ───────────────────

function CallerInner({ tenant }: { tenant: TenantConfig }) {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "";
  const slug = tenant.slug;

  const [callState, setCallState] = useState<CallState>("idle");
  const [speakerMode, setSpeakerMode] = useState<SpeakerMode>("listening");
  const [liveCaption, setLiveCaption] = useState<string | undefined>(undefined);
  const [confirmationText, setConfirmationText] = useState<string | undefined>(undefined);
  const [appointment, setAppointment] = useState<
    { callerName: string; reason: string; startsAt: string; duration: number } | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const transcriptRef = useRef<string[]>([]);
  const appointmentIdRef = useRef<string | undefined>(undefined);

  const conversation = useConversation({
    onConnect: () => {
      setCallState("live");
    },
    onDisconnect: () => {
      setCallState((prev) => (prev === "confirmed" ? "confirmed" : "ended"));
    },
    onError: (message) => {
      setErrorMessage(typeof message === "string" ? message : "Connection error.");
      setCallState("ended");
    },
    onModeChange: ({ mode }) => {
      setSpeakerMode(mode === "speaking" ? "speaking" : "listening");
    },
    onMessage: (event) => {
      if ("message" in event && typeof event.message === "string") {
        const role =
          "source" in event
            ? event.source === "user"
              ? "Caller"
              : "Agent"
            : "Agent";
        transcriptRef.current.push(`[${role}] ${event.message}`);
        if (role === "Agent") {
          setLiveCaption(event.message);
        }
      }
    },
    clientTools: {
      check_availability: async (params: Record<string, unknown>) => {
        const date = typeof params.date === "string" ? params.date : undefined;
        const qs = new URLSearchParams({ business: slug });
        if (date) qs.set("date", date);
        const res = await fetch(`/api/availability?${qs}`);
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
          body: JSON.stringify({ slot_id, caller_name, reason, business: slug }),
        });
        const data: BookAppointmentResult = await res.json();

        if (data.ok && data.appointment_id) {
          appointmentIdRef.current = data.appointment_id;
          setConfirmationText(data.confirmation);
          setAppointment({
            callerName: caller_name,
            reason,
            startsAt: data.starts_at ?? new Date().toISOString(),
            duration: tenant.slotDurationMin,
          });
          setCallState("confirmed");
        }

        return JSON.stringify(data);
      },
    },
  });

  // Auto-hang up a few seconds after a booking is confirmed so the agent
  // delivers its closing line before the session ends.
  useEffect(() => {
    if (callState !== "confirmed") return;
    const t = setTimeout(() => {
      conversation.endSession();
    }, 4500);
    return () => clearTimeout(t);
  }, [callState, conversation]);

  // Post transcript to /api/call-log when session ends
  useEffect(() => {
    if (callState !== "ended" && callState !== "confirmed") return;
    const transcript = transcriptRef.current.join("\n\n");
    if (!transcript) return;
    fetch(`/api/call-log?business=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        appointment_id: appointmentIdRef.current ?? null,
      }),
    }).catch((err) => console.warn("[call-log] Failed to post transcript:", err));
  }, [callState, slug]);

  const handleStartCall = useCallback(async () => {
    setCallState("connecting");
    setLiveCaption(undefined);
    setErrorMessage(undefined);
    setConfirmationText(undefined);
    setAppointment(undefined);
    transcriptRef.current = [];
    appointmentIdRef.current = undefined;

    const overrides = {
      agent: {
        prompt: { prompt: buildReceptionistPrompt(tenant) },
        firstMessage: tenant.greeting,
      },
    };

    try {
      const tokenRes = await fetch("/api/elevenlabs/token");
      if (tokenRes.ok) {
        const { token } = (await tokenRes.json()) as { token: string };
        conversation.startSession({ conversationToken: token, overrides });
        return;
      }
    } catch {
      // fall through
    }

    if (!agentId) {
      setErrorMessage("No ElevenLabs agent configured. Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID.");
      setCallState("ended");
      return;
    }
    // Fallback: agentId session without overrides (base prompt applies)
    conversation.startSession({ agentId });
  }, [conversation, agentId, tenant]);

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
      tenant={tenant}
    />
  );
}

// ─── Loading shell ───────────────────────────────────────────────────────────

function LoadingShell() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-white">
      <p className="text-sm text-[oklch(60%_0.006_264)]">Loading...</p>
    </div>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-white px-6">
      <p className="text-sm text-red-600 text-center max-w-xs">{message}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TenantCallerPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/businesses/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          setFetchError(`Business "${slug}" not found.`);
          return;
        }
        const data: TenantConfig = await res.json();
        setTenant(data);
      })
      .catch(() => setFetchError("Failed to load business data."));
  }, [slug]);

  if (fetchError) return <ErrorShell message={fetchError} />;
  if (!tenant) return <LoadingShell />;

  const cssVars = themeToCssVars(tenant.theme) as React.CSSProperties;

  return (
    <div style={cssVars}>
      {tenant.theme.fontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={tenant.theme.fontUrl} />
      )}
      <ConversationProvider>
        <CallerInner tenant={tenant} />
      </ConversationProvider>
    </div>
  );
}
