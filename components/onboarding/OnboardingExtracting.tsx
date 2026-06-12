"use client";

import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import type { OnboardingExtractingProps } from "./OnboardingTypes";

export function OnboardingExtracting({
  url,
  phases,
  progress,
  error,
  onCancel,
}: OnboardingExtractingProps) {
  const displayUrl = (() => {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return u.hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div
      className="w-full max-w-md mx-auto"
      style={{ animation: "fd-step-in 280ms ease-out both" }}
    >
      {/* Scanning animation block */}
      <div
        className="relative overflow-hidden rounded-[8px] border border-[oklch(88%_0.004_264)] mb-8"
        style={{ background: "oklch(98.5% 0.002 264)" }}
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-[2px] bg-[oklch(48%_0.2_264)]"
          style={{
            width: `${Math.round(progress * 100)}%`,
            transition: "width 600ms cubic-bezier(0.0, 0, 0.2, 1)",
          }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Extraction progress"
        />

        {/* Scan lines show that we are reading the site */}
        {!error && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-[8px]"
            aria-hidden="true"
          >
            <div
              className="absolute inset-x-0 h-10"
              style={{
                background: "linear-gradient(to bottom, transparent, oklch(48% 0.2 264 / 0.06), transparent)",
                animation: "fd-scan-line 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>
        )}

        {/* Site identity block */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div
            className="w-9 h-9 rounded-[6px] bg-[oklch(88%_0.004_264)] flex items-center justify-center flex-shrink-0 overflow-hidden"
            aria-hidden="true"
          >
            {/* favicon placeholder */}
            <span className="text-xs font-semibold text-[oklch(40%_0.005_264)] uppercase">
              {displayUrl.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-[oklch(9%_0_0)] truncate">
              {displayUrl}
            </span>
            <span className="text-xs text-[oklch(60%_0.006_264)]">
              Analyzing site&hellip;
            </span>
          </div>
        </div>
      </div>

      {/* Phase checklist */}
      <div className="flex flex-col gap-0.5 mb-8" role="list" aria-label="Extraction steps">
        {phases.map((phase, i) => {
          const isActive = !phase.done && phases.slice(0, i).every((p) => p.done);
          return (
            <div
              key={i}
              role="listitem"
              className="flex items-center gap-3 px-3 py-2 rounded-[6px] transition-all duration-300"
              style={{
                opacity: phase.done || isActive ? 1 : 0.45,
                background: isActive ? "oklch(97% 0.002 264)" : "transparent",
              }}
            >
              {phase.done ? (
                <CheckCircle2
                  size={16}
                  className="flex-shrink-0 text-[oklch(44%_0.16_145)]"
                  aria-hidden="true"
                />
              ) : isActive ? (
                /* Animated dots */
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <span className="flex items-end gap-[3px]">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="block w-[3px] h-[3px] rounded-full bg-[oklch(44%_0.2_264)]"
                        style={{
                          animation: `fd-dot-bounce 1.2s ease-in-out ${j * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                </span>
              ) : (
                <Circle
                  size={16}
                  className="flex-shrink-0 text-[oklch(84%_0.004_264)]"
                  aria-hidden="true"
                />
              )}
              <span
                className="text-sm"
                style={{
                  color: phase.done
                    ? "oklch(7% 0 0)"
                    : isActive
                    ? "oklch(10% 0 0)"
                    : "oklch(54% 0.005 264)",
                  fontWeight: isActive ? 600 : phase.done ? 500 : undefined,
                }}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-[6px] bg-[oklch(57%_0.22_25_/_0.06)] border border-[oklch(57%_0.22_25_/_0.2)] mb-6"
          role="alert"
        >
          <AlertCircle
            size={15}
            className="flex-shrink-0 mt-0.5 text-[oklch(44%_0.22_25)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[oklch(44%_0.22_25)] leading-relaxed">
            {error}
          </p>
        </div>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-[oklch(60%_0.006_264)] hover:text-[oklch(40%_0.005_264)] transition-colors duration-150 outline-none cursor-pointer"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
