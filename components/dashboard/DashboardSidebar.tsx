"use client";

import Image from "next/image";
import { CalendarDays, CalendarCheck } from "lucide-react";
import type { TenantConfig } from "@/lib/tenant";

export type DashboardTab = "calendar" | "appointments";

const NAV_ITEMS: { id: DashboardTab; label: string; Icon: React.ElementType }[] = [
  { id: "calendar", label: "Calendar", Icon: CalendarDays },
  { id: "appointments", label: "Appointments", Icon: CalendarCheck },
];

interface DashboardSidebarProps {
  tenant: TenantConfig | null;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  appointmentCount?: number;
  activeCallCount?: number;
}

export function DashboardSidebar({
  tenant,
  activeTab,
  onTabChange,
  appointmentCount = 0,
}: DashboardSidebarProps) {
  const businessName = tenant?.name ?? "Dashboard";
  const logoUrl = tenant?.theme?.logoUrl;

  return (
    <aside
      className="flex flex-col w-56 flex-shrink-0 h-full border-r overflow-y-auto"
      style={{
        background: "var(--fd-bg, #ffffff)",
        borderColor: "var(--fd-border, #eaeaea)",
      }}
      aria-label="Dashboard navigation"
    >
      {/* Business identity */}
      <div
        className="flex items-center gap-2.5 px-4 py-4 border-b"
        style={{ borderColor: "var(--fd-border, #eaeaea)" }}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={businessName}
            width={28}
            height={28}
            className="rounded-[6px] object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
            style={{
              background: "var(--fd-accent, #0070f3)",
              color: "var(--fd-accent-fg, #ffffff)",
            }}
            aria-hidden="true"
          >
            {businessName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p
            className="text-[13px] font-semibold truncate leading-tight"
            style={{ color: "var(--fd-fg, #0a0a0a)" }}
          >
            {businessName}
          </p>
          <p
            className="text-[11px] truncate leading-tight mt-0.5"
            style={{ color: "var(--fd-muted, #666666)" }}
          >
            Frontdesk
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1" aria-label="Primary">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const badge = id === "appointments" ? appointmentCount : undefined;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] text-left transition-all duration-150 outline-none cursor-pointer"
              style={
                isActive
                  ? {
                      background:
                        "color-mix(in oklch, var(--fd-accent, #0070f3) 10%, transparent)",
                      color: "var(--fd-accent, #0070f3)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--fd-muted, #666666)",
                    }
              }
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={15}
                aria-hidden="true"
                style={isActive ? { color: "var(--fd-accent, #0070f3)" } : undefined}
              />
              <span className="text-[13px] font-medium flex-1 truncate">{label}</span>

              {/* Badge */}
              {typeof badge === "number" && badge > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-semibold"
                  style={
                    isActive
                      ? {
                          background: "var(--fd-accent, #0070f3)",
                          color: "var(--fd-accent-fg, #ffffff)",
                        }
                      : {
                          background: "oklch(90% 0.003 264)",
                          color: "oklch(40% 0.005 264)",
                        }
                  }
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: "var(--fd-border, #eaeaea)" }}
      >
        <p
          className="text-[10px] font-medium uppercase tracking-wide"
          style={{ color: "var(--fd-muted, #666666)" }}
        >
          Powered by Frontdesk
        </p>
      </div>
    </aside>
  );
}
