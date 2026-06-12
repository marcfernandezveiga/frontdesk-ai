"use client";

/**
 * Owner dashboard — /dashboard
 *
 * Auth0-gated in production. Dev-mode bypass when AUTH0_DOMAIN is absent.
 * Polls GET /api/dashboard every 1500 ms and drives DashboardPage.
 *
 * Auth guard: rendered at the component level by fetching the session
 * server-side via auth0.getSession() would require a Server Component; instead
 * we rely on the proxy.ts middleware to redirect to /auth/login for /dashboard.
 * In dev mode (no AUTH0_DOMAIN) the middleware passes through.
 */

import { useCallback, useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import type { Appointment, CallLog } from "@/lib/types";
import type { AvailabilitySlot } from "@/components/dashboard/DashboardTypes";
import type { DashboardPayload } from "@/app/api/dashboard/route";

const POLL_INTERVAL_MS = 1500;

export default function DashboardPageRoute() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) return;
      const json: DashboardPayload = await res.json();
      setData(json);
      // Auto-select the first appointment on first load
      setSelectedAppointmentId((prev) => {
        if (prev !== null) return prev;
        return json.appointments[0]?.id ?? null;
      });
    } catch {
      // Swallow — keep showing stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const id = setInterval(fetchDashboard, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  // Map API DTO slots to DashboardTypes.AvailabilitySlot
  const availabilitySlots: AvailabilitySlot[] = (data?.slots ?? []).map((dto) => ({
    slot: dto.slot,
    label: dto.label,
  }));

  const appointments: Appointment[] = data?.appointments ?? [];
  const callLogs: CallLog[] = data?.callLogs ?? [];

  return (
    <DashboardPage
      header={{
        clinicName: "Marina Physio",
        hasActiveCall: false,
        activeCallCount: 0,
      }}
      appointments={appointments}
      callLogs={callLogs}
      availabilitySlots={availabilitySlots}
      selectedAppointmentId={selectedAppointmentId}
      onSelectAppointment={setSelectedAppointmentId}
      loading={loading}
    />
  );
}
