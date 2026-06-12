"use client";

import { useEffect, useState } from "react";
import { CalendarX, FileText, PhoneIncoming } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { AvailabilityStrip } from "./AvailabilityStrip";
import { AppointmentCard, AppointmentCardSkeleton } from "./AppointmentCard";
import { TranscriptPanel } from "./TranscriptPanel";
import type { DashboardPageProps } from "./DashboardTypes";
import type { CallLog } from "@/lib/types";

export type { DashboardPageProps } from "./DashboardTypes";
export type { AvailabilityStripProps, DashboardHeaderProps, AppointmentCardProps, TranscriptPanelProps } from "./DashboardTypes";

export function DashboardPage({
  header,
  appointments,
  callLogs,
  liveCalls,
  availabilitySlots,
  selectedAppointmentId,
  onSelectAppointment,
  loading = false,
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<"appointments" | "conversations">("appointments");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Find the call log for the selected appointment
  const selectedAppointment = appointments.find(
    (a) => a.id === selectedAppointmentId
  ) ?? null;
  const selectedCallLog: CallLog | null =
    callLogs.find((l) => l.appointment_id === selectedAppointmentId) ?? null;
  const selectedLiveCall = liveCalls.find((c) => c.id === selectedConversationId) ?? null;
  const selectedConversationLog =
    callLogs.find((l) => `log-${l.id}` === selectedConversationId) ?? null;
  const panelLiveCall = activeTab === "conversations" ? selectedLiveCall : null;
  const panelCallLog =
    activeTab === "conversations" ? selectedConversationLog : selectedCallLog;
  const activeCallCount = liveCalls.filter((c) => c.status === "ringing" || c.status === "live").length;

  useEffect(() => {
    if (activeTab !== "conversations") return;
    if (selectedConversationId) return;
    if (liveCalls[0]) {
      setSelectedConversationId(liveCalls[0].id);
      return;
    }
    if (callLogs[0]) {
      setSelectedConversationId(`log-${callLogs[0].id}`);
    }
  }, [activeTab, selectedConversationId, liveCalls, callLogs]);

  return (
    <div className="flex flex-col h-dvh bg-[oklch(97.5%_0.002_264)]">
      {/* Sticky header */}
      <DashboardHeader
        {...header}
        hasActiveCall={header.hasActiveCall || activeCallCount > 0}
        activeCallCount={header.activeCallCount || activeCallCount}
      />

      {/* Availability strip */}
      <AvailabilityStrip slots={availabilitySlots} loading={loading} />

      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: Appointments list ── */}
        <aside
          className="w-[360px] flex-shrink-0 flex flex-col border-r border-[oklch(88%_0.004_264)] bg-white overflow-y-auto"
          aria-label="Appointments"
        >
          {/* Section heading */}
          <div className="px-4 pt-4 pb-3 border-b border-[oklch(88%_0.004_264)] sticky top-0 bg-white z-10">
            <div className="grid grid-cols-2 gap-1 rounded-[8px] bg-[oklch(96%_0.003_264)] p-1">
              <button
                onClick={() => setActiveTab("appointments")}
                className="h-8 rounded-[6px] text-xs font-semibold transition-colors"
                style={{
                  background: activeTab === "appointments" ? "white" : "transparent",
                  color: activeTab === "appointments" ? "oklch(9% 0 0)" : "oklch(45% 0.006 264)",
                  boxShadow: activeTab === "appointments" ? "0 1px 4px oklch(0% 0 0 / 0.08)" : "none",
                }}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab("conversations")}
                className="h-8 rounded-[6px] text-xs font-semibold transition-colors"
                style={{
                  background: activeTab === "conversations" ? "white" : "transparent",
                  color: activeTab === "conversations" ? "oklch(9% 0 0)" : "oklch(45% 0.006 264)",
                  boxShadow: activeTab === "conversations" ? "0 1px 4px oklch(0% 0 0 / 0.08)" : "none",
                }}
              >
                Conversations
              </button>
            </div>
            <div className="flex items-center justify-between pt-3">
              <h2 className="text-xs font-semibold text-[oklch(40%_0.005_264)] uppercase tracking-wide">
                {activeTab === "appointments" ? "Bookings" : "Phone calls"}
              </h2>
              {!loading && (
                <span className="text-xs text-[oklch(60%_0.006_264)]">
                  {activeTab === "appointments"
                    ? `${appointments.length} total`
                    : `${liveCalls.length + callLogs.length} total`}
                </span>
              )}
            </div>
          </div>

          {/* List */}
          <div
            className="flex flex-col gap-2 p-3"
            role="list"
            aria-label={activeTab === "appointments" ? "Appointment list" : "Conversation list"}
          >
            {loading ? (
              <>
                <AppointmentCardSkeleton />
                <AppointmentCardSkeleton />
                <AppointmentCardSkeleton />
              </>
            ) : activeTab === "appointments" ? (
              appointments.length === 0 ? (
                <EmptyAppointments />
              ) : (
                appointments.map((appt) => {
                  const log = callLogs.find((l) => l.appointment_id === appt.id);
                  return (
                    <div key={appt.id} role="listitem">
                      <AppointmentCard
                        appointment={appt}
                        callLog={log}
                        isActive={selectedAppointmentId === appt.id}
                        onClick={() => onSelectAppointment?.(appt.id)}
                      />
                    </div>
                  );
                })
              )
            ) : liveCalls.length + callLogs.length === 0 ? (
              <EmptyConversations />
            ) : (
              <>
                {liveCalls.map((call) => (
                  <ConversationCard
                    key={call.id}
                    title={call.caller_name ?? call.caller_phone ?? "Incoming caller"}
                    subtitle={call.status === "booked" ? "Booking confirmed" : "Live phone call"}
                    transcript={call.transcript}
                    isLive={call.status === "ringing" || call.status === "live"}
                    isActive={selectedConversationId === call.id}
                    onClick={() => setSelectedConversationId(call.id)}
                  />
                ))}
                {callLogs.map((log) => (
                  <ConversationCard
                    key={log.id}
                    title={appointmentNameForLog(log.appointment_id, appointments)}
                    subtitle={formatConversationTime(log.created_at)}
                    transcript={log.summary ?? log.transcript}
                    isActive={selectedConversationId === `log-${log.id}`}
                    onClick={() => setSelectedConversationId(`log-${log.id}`)}
                  />
                ))}
              </>
            )}
          </div>
        </aside>

        {/* ── Right: Transcript panel ── */}
        <main
          className="flex-1 flex flex-col bg-white overflow-hidden"
          aria-label="Call transcript"
          id="transcript-panel"
        >
          {activeTab === "appointments" && selectedAppointment && (
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[oklch(88%_0.004_264)]">
              <div
                className="w-7 h-7 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-xs font-semibold text-[oklch(40%_0.005_264)]">
                  {selectedAppointment.caller_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-[oklch(9%_0_0)]">
                  {selectedAppointment.caller_name}
                </span>
                <span className="text-xs text-[oklch(60%_0.006_264)] truncate">
                  {selectedAppointment.reason}
                </span>
              </div>
            </div>
          )}
          {activeTab === "conversations" && (panelLiveCall || panelCallLog) && (
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[oklch(88%_0.004_264)]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: panelLiveCall
                    ? "color-mix(in oklch, var(--fd-accent, oklch(48% 0.2 264)) 10%, white)"
                    : "oklch(94% 0.003 264)",
                  color: panelLiveCall ? "var(--fd-accent, oklch(48% 0.2 264))" : "oklch(40% 0.005 264)",
                }}
                aria-hidden="true"
              >
                {panelLiveCall ? <PhoneIncoming size={15} /> : <FileText size={15} />}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-[oklch(9%_0_0)]">
                  {panelLiveCall
                    ? panelLiveCall.caller_name ?? panelLiveCall.caller_phone ?? "Incoming caller"
                    : appointmentNameForLog(panelCallLog?.appointment_id ?? null, appointments)}
                </span>
                <span className="text-xs text-[oklch(60%_0.006_264)] truncate">
                  {panelLiveCall ? "Live STT transcript" : "Completed call transcript"}
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <TranscriptPanel
              callLog={panelCallLog}
              liveCall={panelLiveCall}
              loading={loading && (activeTab === "appointments" ? !!selectedAppointmentId : !!selectedConversationId)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function appointmentNameForLog(appointmentId: string | null, appointments: DashboardPageProps["appointments"]) {
  if (!appointmentId) return "Phone caller";
  return appointments.find((a) => a.id === appointmentId)?.caller_name ?? "Phone caller";
}

function formatConversationTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function ConversationCard({
  title,
  subtitle,
  transcript,
  isLive = false,
  isActive = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  transcript: string;
  isLive?: boolean;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-4 rounded-[8px] border transition-all duration-150 outline-none"
      style={
        isActive
          ? {
              background: "color-mix(in oklch, var(--fd-accent, oklch(48% 0.2 264)) 7%, white)",
              borderColor: "color-mix(in oklch, var(--fd-accent, oklch(48% 0.2 264)) 30%, transparent)",
            }
          : {
              background: "white",
              borderColor: "oklch(88% 0.004 264)",
            }
      }
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: isLive
              ? "color-mix(in oklch, var(--fd-accent, oklch(48% 0.2 264)) 10%, white)"
              : "oklch(94% 0.003 264)",
            color: isLive ? "var(--fd-accent, oklch(48% 0.2 264))" : "oklch(45% 0.006 264)",
          }}
        >
          {isLive ? <PhoneIncoming size={14} aria-hidden="true" /> : <FileText size={14} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[oklch(9%_0_0)] truncate">{title}</p>
            {isLive && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium"
                style={{ color: "var(--fd-accent, oklch(48% 0.2 264))" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "var(--fd-accent, oklch(48% 0.2 264))",
                    animation: "live-pulse 1.5s ease-in-out infinite",
                  }}
                />
                Live
              </span>
            )}
          </div>
          <p className="text-xs text-[oklch(60%_0.006_264)] mt-0.5">{subtitle}</p>
          <p className="text-xs text-[oklch(45%_0.006_264)] mt-2 line-clamp-2 leading-relaxed">
            {transcript || "Waiting for speech..."}
          </p>
        </div>
      </div>
    </button>
  );
}

function EmptyAppointments() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center">
        <CalendarX
          size={18}
          className="text-[oklch(60%_0.006_264)]"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[oklch(40%_0.005_264)]">
          No appointments yet
        </p>
        <p className="text-xs text-[oklch(60%_0.006_264)] max-w-[22ch] leading-relaxed">
          Appointments booked through Frontdesk will appear here.
        </p>
      </div>
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center">
        <PhoneIncoming
          size={18}
          className="text-[oklch(60%_0.006_264)]"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[oklch(40%_0.005_264)]">
          No calls yet
        </p>
        <p className="text-xs text-[oklch(60%_0.006_264)] max-w-[24ch] leading-relaxed">
          Incoming phone calls and transcripts will appear here.
        </p>
      </div>
    </div>
  );
}
