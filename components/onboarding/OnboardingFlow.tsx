"use client";

import { OnboardingInput } from "./OnboardingInput";
import { OnboardingExtracting } from "./OnboardingExtracting";
import { OnboardingPreview } from "./OnboardingPreview";
import { OnboardingPublished } from "./OnboardingPublished";
import type { OnboardingFlowProps } from "./OnboardingTypes";

/**
 * OnboardingFlow: top-level container.
 *
 * Presentational: all state and callbacks come from props.
 * Wave 2 wires these to real API calls in app/onboard/page.tsx.
 * Wave 1 uses the mock driver in OnboardingMockDriver.tsx.
 *
 * Layout: centered single-column container with a fixed Frontdesk header.
 */
export function OnboardingFlow({
  step,
  inputProps,
  extractingProps,
  previewProps,
  publishedProps,
}: OnboardingFlowProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[oklch(88%_0.004_264)] sticky top-0 bg-white z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[4px] bg-[oklch(9%_0_0)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none" aria-hidden="true">
              FD
            </span>
          </div>
          <span className="text-sm font-semibold text-[oklch(9%_0_0)]">Frontdesk</span>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1.5" aria-label="Setup steps">
          {(["input", "extracting", "preview", "published"] as const).map((s, i) => (
            <span
              key={s}
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{
                background:
                  s === step
                    ? "oklch(9% 0 0)"
                    : (["input", "extracting", "preview", "published"].indexOf(step) > i
                      ? "oklch(48% 0.2 264)"
                      : "oklch(88% 0.004 264)"),
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 justify-center px-6 py-12 lg:py-16" id="main-content">
        <div
          className={
            step === "preview"
              ? "w-full max-w-5xl"
              : "w-full max-w-lg"
          }
        >
          {step === "input" && <OnboardingInput {...inputProps} />}
          {step === "extracting" && <OnboardingExtracting {...extractingProps} />}
          {step === "preview" && <OnboardingPreview {...previewProps} />}
          {step === "published" && <OnboardingPublished {...publishedProps} />}
        </div>
      </main>
    </div>
  );
}
