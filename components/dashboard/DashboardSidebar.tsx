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
        borderColor: "var(--fd-border, oklch(86% 0.004 264))",
      }}
      aria-label="Dashboard navigation"
    >
      {/* Business identity */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5 border-b"
        style={{ borderColor: "var(--fd-border, oklch(86% 0.004 264))" }}
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
            className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 text-[11px] font-bold shadow-[0_1px_3px_oklch(0%_0_0_/_0.12)]"
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
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] text-left transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-1"
              style={
                isActive
                  ? {
                      background:
                        "color-mix(in oklch, var(--fd-accent, #0070f3) 10%, transparent)",
                      color: "var(--fd-accent, #0070f3)",
                    }
                  : {
                      background: "transparent",
                      color: "oklch(42% 0.005 264)",
                    }
              }
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "oklch(97% 0.002 264)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon
                size={15}
                aria-hidden="true"
                style={isActive ? { color: "var(--fd-accent, #0070f3)" } : { color: "oklch(52% 0.005 264)" }}
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
                          background: "oklch(88% 0.004 264)",
                          color: "oklch(34% 0.005 264)",
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
        style={{ borderColor: "var(--fd-border, oklch(86% 0.004 264))" }}
      >
        <p
          className="text-[10px] font-medium uppercase tracking-wide"
          style={{ color: "oklch(58% 0.005 264)" }}
        >
          Powered by Frontdesk
        </p>
      </div>
    </aside>
  );
}
