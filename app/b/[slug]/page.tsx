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
import { themeToCssVars } from "@/lib/tenant";
import type { TenantConfig } from "@/lib/tenant";
import type { Appointment, CallLog, LiveCall } from "@/lib/types";
import type { AvailabilitySlot } from "@/components/dashboard/DashboardTypes";
import type { DashboardPayload } from "@/app/api/dashboard/route";

const POLL_INTERVAL_MS = 1500;

export default function TenantDashboardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDashboard();
    const id = setInterval(fetchDashboard, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDashboard]);

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
    </div>
  );
}
