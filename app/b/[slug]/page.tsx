"use client";

/**
 * /b/[slug]: tenant dashboard.
 *
 * Polls GET /api/dashboard?business=<slug> every 1500 ms and drives DashboardPage.
 * Light tenant theming via themeToCssVars on the outer wrapper.
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { ScheduleWeek } from "@/components/dashboard/ScheduleWeek";
import { themeToCssVars } from "@/lib/tenant";
import type { TenantConfig } from "@/lib/tenant";
import type { Appointment, CallLog, LiveCall } from "@/lib/types";
import type { AvailabilitySlot } from "@/components/dashboard/DashboardTypes";
import type { DashboardPayload } from "@/app/api/dashboard/route";
import type { ScheduleSlot } from "@/components/dashboard/ScheduleWeekTypes";

const POLL_INTERVAL_MS = 1500;

/** Return the ISO date string (YYYY-MM-DD) for the Monday of the week containing `date`. */
function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD date string by `days` days. */
function shiftDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function TenantDashboardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Schedule week state
  const [weekStart, setWeekStart] = useState<string>(() => getMonday(new Date()));
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Fetch tenant config once
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/businesses/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const cfg: TenantConfig = await res.json();
        setTenant(cfg);
      })
      .catch(() => {
        // Non-fatal; dashboard still works without branding
      });
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
      setSelectedAppointmentId((prev) => {
        if (prev !== null) return prev;
        return json.appointments[0]?.id ?? null;
      });
    } catch {
      // Keep showing stale data
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
      // Keep showing stale data
    } finally {
      setScheduleLoading(false);
    }
  }, [slug, weekStart]);

  useEffect(() => {
    fetchDashboard();
    const id = setInterval(fetchDashboard, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  // Fetch schedule week on mount, on weekStart change, and on the same poll cadence
  useEffect(() => {
    setScheduleLoading(true);
    fetchScheduleWeek();
    const id = setInterval(fetchScheduleWeek, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchScheduleWeek]);

  const availabilitySlots: AvailabilitySlot[] = (data?.slots ?? []).map((dto) => ({
    slot: dto.slot,
    label: dto.label,
  }));

  const appointments: Appointment[] = data?.appointments ?? [];
  const callLogs: CallLog[] = data?.callLogs ?? [];
  const liveCalls: LiveCall[] = data?.liveCalls ?? [];
  const activeCallCount = liveCalls.filter((c) => c.status === "ringing" || c.status === "live").length;

  const businessName = tenant?.name ?? slug ?? "Dashboard";

  const cssVars = tenant ? (themeToCssVars(tenant.theme) as React.CSSProperties) : {};

  return (
    <div style={cssVars}>
      <DashboardPage
        header={{
          clinicName: businessName,
          hasActiveCall: activeCallCount > 0,
          activeCallCount,
        }}
        appointments={appointments}
        callLogs={callLogs}
        liveCalls={liveCalls}
        availabilitySlots={availabilitySlots}
        selectedAppointmentId={selectedAppointmentId}
        onSelectAppointment={setSelectedAppointmentId}
        loading={loading}
      />
      <div className="px-4 pb-8 pt-4 max-w-5xl mx-auto">
        <ScheduleWeek
          slots={scheduleSlots}
          weekStart={weekStart}
          loading={scheduleLoading}
          onPrevWeek={() => setWeekStart((w) => shiftDate(w, -7))}
          onNextWeek={() => setWeekStart((w) => shiftDate(w, 7))}
        />
      </div>
    </div>
  );
}
