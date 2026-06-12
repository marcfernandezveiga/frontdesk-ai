"use client";

import { Phone } from "lucide-react";
import type { TenantConfig } from "@/lib/tenant";

interface CallerIdleProps {
  clinicName: string;
  tagline?: string;
  tenant?: TenantConfig;
  onStartCall?: () => void;
}

export function CallerIdle({ clinicName, tagline, tenant, onStartCall }: CallerIdleProps) {
  const heroUrl = tenant?.theme.heroUrl;
  const logoUrl = tenant?.theme.logoUrl;
  const services = tenant?.services.slice(0, 4) ?? [];

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div
        className="w-full overflow-hidden border shadow-[0_18px_50px_oklch(0%_0_0_/_0.12)]"
        style={{
          borderColor: "var(--fd-border)",
          borderRadius: "calc(var(--fd-radius) + 8px)",
          background: "var(--fd-bg)",
        }}
      >
        <div
          className="relative h-40 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--fd-accent) 30%, var(--fd-bg)), color-mix(in oklch, var(--fd-accent) 65%, var(--fd-fg)))",
          }}
        >
          {heroUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={heroUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, oklch(0% 0 0 / 0.08), oklch(0% 0 0 / 0.58))",
            }}
            aria-hidden="true"
          />
          <div className="absolute left-5 bottom-5 flex items-center gap-3 text-left">
            <div
              className="h-12 w-12 rounded-[14px] border bg-white flex items-center justify-center overflow-hidden shadow-[0_8px_24px_oklch(0%_0_0_/_0.18)]"
              style={{ borderColor: "oklch(100% 0 0 / 0.42)" }}
            >
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : (
                <span className="text-sm font-bold" style={{ color: "var(--fd-accent)" }}>
                  {clinicName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/75">AI phone receptionist</p>
              <p className="text-lg font-semibold text-white truncate">{clinicName}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-5">
          <div className="flex flex-col gap-2">
            <h1
              className="text-3xl font-semibold tracking-[-0.025em] leading-tight"
              style={{ color: "var(--fd-fg)", textWrap: "balance" } as React.CSSProperties}
            >
              {clinicName}
            </h1>
            <p
              className="text-base max-w-[30ch] leading-relaxed font-medium"
              style={{ color: "color-mix(in oklch, var(--fd-fg) 72%, var(--fd-muted))" }}
            >
              {tagline ?? "Book an appointment by phone. The AI receptionist answers right away."}
            </p>
          </div>

          {services.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {services.map((service) => (
                <span
                  key={service.name}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{
                    color: "var(--fd-accent)",
                    borderColor: "color-mix(in oklch, var(--fd-accent) 24%, transparent)",
                    background: "color-mix(in oklch, var(--fd-accent) 8%, var(--fd-bg))",
                  }}
                >
                  {service.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStartCall}
          className="inline-flex items-center justify-center gap-3 min-w-[220px] h-14 px-8 text-base font-medium rounded-[var(--fd-radius)] transition-all duration-150 outline-none cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: "var(--fd-accent)",
            color: "var(--fd-accent-fg)",
            borderRadius: "var(--fd-radius)",
          }}
          aria-label="Start a voice call"
        >
          <Phone size={20} strokeWidth={2} aria-hidden="true" />
          Call the phone line
        </button>
        <p className="text-xs font-medium" style={{ color: "var(--fd-muted)" }}>
          Demo line: +44 20 7946 0148
        </p>
      </div>

      {/* Trust footer */}
      <div className="flex items-center gap-6 text-xs" style={{ color: "var(--fd-muted)" }}>
        <span>No hold time</span>
        <span
          aria-hidden="true"
          className="w-px h-3"
          style={{ background: "var(--fd-border)" }}
        />
        <span>Available 24/7</span>
        <span
          aria-hidden="true"
          className="w-px h-3"
          style={{ background: "var(--fd-border)" }}
        />
        <span>Books in seconds</span>
      </div>
    </div>
  );
}
