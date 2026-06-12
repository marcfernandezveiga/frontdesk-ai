"use client";

/**
 * /b/[slug]: business-owner dashboard.
 *
 * Left-sidebar layout: Calendar / Appointments.
 * Polls /api/dashboard every 1500 ms for live data.
 * Wraps the whole shell in themeToCssVars so every component
 * inherits the business brand via CSS custom properties.
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarCheck, PhoneIncoming, FileText } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { DashboardTab } from "@/components/dashboard/DashboardSidebar";
import { ScheduleWeek } from "@/components/dashboard/ScheduleWeek";
import { AppointmentCard, AppointmentCardSkeleton } from "@/components/dashboard/AppointmentCard";
import { TranscriptPanel } from "@/components/dashboard/TranscriptPanel";
import { themeToCssVars } from "@/lib/tenant";
import type { TenantConfig } from "@/lib/tenant";
import type { Appointment, CallLog, LiveCall } from "@/lib/types";
import type { DashboardPayload } from "@/app/api/dashboard/route";
import type { ScheduleSlot } from "@/components/dashboard/ScheduleWeekTypes";

const POLL_INTERVAL_MS = 1500;

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Appointments panel ───────────────────────────────────────────────────────

function AppointmentsPanel({
  appointments,
  callLogs,
  loading,
}: {
  appointments: Appointment[];
  callLogs: CallLog[];
  loading: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    () => null
  );

  useEffect(() => {
    if (selectedId === null && appointments.length > 0) {
      setSelectedId(appointments[0].id);
    }
  }, [appointments, selectedId]);

  const selectedAppointment = appointments.find((a) => a.id === selectedId) ?? null;
  const selectedCallLog = callLogs.find((l) => l.appointment_id === selectedId) ?? null;

  return (
    <div className="flex flex-1 min-h-0 h-full">
      {/* List */}
      <aside
        className="w-[340px] flex-shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ borderColor: "var(--fd-border, #eaeaea)" }}
        aria-label="Appointments"
      >
        <div
          className="sticky top-0 z-10 px-4 pt-4 pb-3 border-b flex items-center justify-between"
          style={{
            background: "var(--fd-bg, #ffffff)",
            borderColor: "var(--fd-border, #eaeaea)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={13} className="text-[oklch(55%_0.006_264)]" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fd-muted, #666666)" }}>
              Bookings
            </h2>
          </div>
          {!loading && (
            <span className="text-xs" style={{ color: "var(--fd-muted, #666666)" }}>
              {appointments.length} total
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3" role="list" aria-label="Appointment list">
          {loading ? (
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : appointments.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={18} className="text-[oklch(60%_0.006_264)]" />}
              title="No appointments yet"
              body="Appointments booked through Frontdesk will appear here."
            />
          ) : (
            appointments.map((appt) => {
              const log = callLogs.find((l) => l.appointment_id === appt.id);
              return (
                <div key={appt.id} role="listitem">
                  <AppointmentCard
                    appointment={appt}
                    callLog={log}
                    isActive={selectedId === appt.id}
                    onClick={() => setSelectedId(appt.id)}
                  />
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Detail panel */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: "var(--fd-bg, #ffffff)" }}
        aria-label="Appointment transcript"
      >
        {selectedAppointment && (
          <div
            className="flex items-center gap-3 px-6 pt-5 pb-4 border-b flex-shrink-0"
            style={{ borderColor: "var(--fd-border, #eaeaea)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[oklch(94%_0.003_264)]"
              aria-hidden="true"
            >
              <span className="text-xs font-semibold text-[oklch(40%_0.005_264)]">
                {selectedAppointment.caller_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-semibold" style={{ color: "var(--fd-fg, #0a0a0a)" }}>
                {selectedAppointment.caller_name}
              </span>
              <span className="text-xs truncate" style={{ color: "var(--fd-muted, #666666)" }}>
                {selectedAppointment.reason}
              </span>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <TranscriptPanel
            callLog={selectedCallLog}
            loading={loading && !!selectedId}
          />
        </div>
      </main>
    </div>
  );
}

// ─── Shared empty state ───────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[oklch(40%_0.005_264)]">{title}</p>
        <p className="text-xs text-[oklch(60%_0.006_264)] max-w-[24ch] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({
  activeCallCount,
  tabLabel,
}: {
  activeCallCount: number;
  tabLabel: string;
}) {
  return (
    <header
      className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
      style={{
        background: "var(--fd-bg, #ffffff)",
        borderColor: "var(--fd-border, #eaeaea)",
      }}
    >
      <h1 className="text-sm font-semibold" style={{ color: "var(--fd-fg, #0a0a0a)" }}>
        {tabLabel}
      </h1>
      {activeCallCount > 0 && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
          style={{
            background: "oklch(57% 0.22 25 / 0.08)",
            borderColor: "oklch(57% 0.22 25 / 0.2)",
            color: "oklch(44% 0.22 25)",
          }}
          role="status"
          aria-live="polite"
          aria-label={`${activeCallCount} active call${activeCallCount !== 1 ? "s" : ""} in progress`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[oklch(57%_0.22_25)]"
            style={{ animation: "live-pulse 1.5s ease-in-out infinite" }}
            aria-hidden="true"
          />
          {activeCallCount > 1 ? `${activeCallCount} live` : "Live"}
        </div>
      )}
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TenantDashboardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("calendar");

  // Schedule week state
  const [weekStart, setWeekStart] = useState<string>(() => getMonday(new Date()));
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Fetch tenant once
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/businesses/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const cfg: TenantConfig = await res.json();
        setTenant(cfg);
      })
      .catch(() => undefined);
  }, [slug]);

  const fetchDashboard = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(
        `/api/dashboard?business=${encodeURIComponent(slug)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json: DashboardPayload = await res.json();
      setData(json);
    } catch {
      // Keep stale data
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchScheduleWeek = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(
        `/api/schedule-week?business=${encodeURIComponent(slug)}&weekStart=${weekStart}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json: { slots: ScheduleSlot[] } = await res.json();
      setScheduleSlots(json.slots ?? []);
    } catch {
      // Keep stale data
    } finally {
      setScheduleLoading(false);
    }
  }, [slug, weekStart]);

  useEffect(() => {
    fetchDashboard();
    const id = setInterval(fetchDashboard, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  useEffect(() => {
    setScheduleLoading(true);
    fetchScheduleWeek();
    const id = setInterval(fetchScheduleWeek, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchScheduleWeek]);

  const appointments: Appointment[] = data?.appointments ?? [];
  const callLogs: CallLog[] = data?.callLogs ?? [];
  const liveCalls: LiveCall[] = data?.liveCalls ?? [];
  const activeCallCount = liveCalls.filter(
    (c) => c.status === "ringing" || c.status === "live"
  ).length;

  const cssVars = tenant ? (themeToCssVars(tenant.theme) as React.CSSProperties) : {};

  const TAB_LABELS: Record<DashboardTab, string> = {
    calendar: "Calendar",
    appointments: "Appointments",
  };

  return (
    <div
      className="flex h-dvh overflow-hidden"
      style={{
        ...cssVars,
        background: "var(--fd-bg, #ffffff)",
        fontFamily: "var(--fd-font-sans, ui-sans-serif, system-ui, sans-serif)",
      }}
    >
      {/* Left sidebar */}
      <DashboardSidebar
        tenant={tenant}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        appointmentCount={appointments.length}
        activeCallCount={activeCallCount}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar activeCallCount={activeCallCount} tabLabel={TAB_LABELS[activeTab]} />

        {activeTab === "calendar" && (
          <div
            className="flex flex-col flex-1 min-h-0 overflow-hidden p-4"
            style={{ background: "oklch(97.5% 0.002 264)" }}
          >
            <ScheduleWeek
              slots={scheduleSlots}
              weekStart={weekStart}
              loading={scheduleLoading}
              onPrevWeek={() => setWeekStart((w) => shiftDate(w, -7))}
              onNextWeek={() => setWeekStart((w) => shiftDate(w, 7))}
            />
          </div>
        )}

        {activeTab === "appointments" && (
          <AppointmentsPanel
            appointments={appointments}
            callLogs={callLogs}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
