"use client";

import { CalendarX } from "lucide-react";
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
  availabilitySlots,
  selectedAppointmentId,
  onSelectAppointment,
  loading = false,
}: DashboardPageProps) {
  // Find the call log for the selected appointment
  const selectedAppointment = appointments.find(
    (a) => a.id === selectedAppointmentId
  ) ?? null;
  const selectedCallLog: CallLog | null =
    callLogs.find((l) => l.appointment_id === selectedAppointmentId) ?? null;

  return (
    <div className="flex flex-col h-dvh bg-[oklch(97.5%_0.002_264)]">
      {/* Sticky header */}
      <DashboardHeader {...header} />

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
          <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-[oklch(88%_0.004_264)] sticky top-0 bg-white z-10">
            <h2 className="text-xs font-semibold text-[oklch(40%_0.005_264)] uppercase tracking-wide">
              Appointments
            </h2>
            {!loading && (
              <span className="text-xs text-[oklch(60%_0.006_264)]">
                {appointments.length} total
              </span>
            )}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 p-3" role="list" aria-label="Appointment list">
            {loading ? (
              <>
                <AppointmentCardSkeleton />
                <AppointmentCardSkeleton />
                <AppointmentCardSkeleton />
              </>
            ) : appointments.length === 0 ? (
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
            )}
          </div>
        </aside>

        {/* ── Right: Transcript panel ── */}
        <main
          className="flex-1 flex flex-col bg-white overflow-hidden"
          aria-label="Call transcript"
          id="transcript-panel"
        >
          {selectedAppointment && (
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

          <div className="flex-1 overflow-hidden">
            <TranscriptPanel
              callLog={selectedCallLog}
              loading={loading && !!selectedAppointmentId}
            />
          </div>
        </main>
      </div>
    </div>
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
