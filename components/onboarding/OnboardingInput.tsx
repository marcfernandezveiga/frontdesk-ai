"use client";

import { Globe, ArrowRight, AlertCircle } from "lucide-react";
import type { OnboardingInputProps } from "./OnboardingTypes";

export function OnboardingInput({
  url,
  onUrlChange,
  description,
  onDescriptionChange,
  loading = false,
  error,
  onSubmit,
}: OnboardingInputProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <div
      className="w-full max-w-lg mx-auto"
      style={{ animation: "fd-step-in 280ms ease-out both" }}
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[oklch(7%_0_0)] mb-3" style={{ textWrap: "balance" } as React.CSSProperties}>
          Set up your receptionist
        </h1>
        <p className="text-base text-[oklch(34%_0.005_264)] leading-relaxed max-w-[44ch]">
          Paste your business website and a one-line description. We read your site, pull your brand, and build a ready-to-share caller page in about 20 seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* URL field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="onboard-url"
            className="text-sm font-medium text-[oklch(9%_0_0)]"
          >
            Website URL
          </label>
          <div className="relative">
            <Globe
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(60%_0.006_264)]"
              aria-hidden="true"
            />
            <input
              id="onboard-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://your-business.com"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              disabled={loading}
              required
              className="w-full h-11 pl-10 pr-4 text-sm border border-[oklch(84%_0.004_264)] rounded-[6px] bg-white text-[oklch(7%_0_0)] placeholder:text-[oklch(56%_0.005_264)] outline-none transition-all duration-150 focus-visible:border-[oklch(48%_0.2_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264_/_0.15)] hover:border-[oklch(72%_0.005_264)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Description field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="onboard-desc"
            className="text-sm font-medium text-[oklch(9%_0_0)]"
          >
            One-line description
          </label>
          <input
            id="onboard-desc"
            type="text"
            placeholder="e.g. Solo physiotherapy clinic in North London"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={loading}
            required
            maxLength={200}
            className="w-full h-11 px-4 text-sm border border-[oklch(84%_0.004_264)] rounded-[6px] bg-white text-[oklch(7%_0_0)] placeholder:text-[oklch(56%_0.005_264)] outline-none transition-all duration-150 focus-visible:border-[oklch(48%_0.2_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264_/_0.15)] hover:border-[oklch(72%_0.005_264)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-[oklch(60%_0.006_264)]">
            This helps us write accurate services and the agent greeting.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-[6px] bg-[oklch(57%_0.22_25_/_0.06)] border border-[oklch(57%_0.22_25_/_0.2)]"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !url.trim() || !description.trim()}
          className="inline-flex items-center justify-center gap-2.5 h-12 px-6 text-sm font-semibold rounded-[6px] bg-[oklch(9%_0_0)] text-white border border-[oklch(9%_0_0)] transition-all duration-150 outline-none cursor-pointer select-none hover:bg-[oklch(18%_0_0)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2 shadow-[0_1px_3px_oklch(0%_0_0_/_0.18)]"
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full opacity-70"
                style={{ animation: "spinner 0.7s linear infinite" }}
                aria-hidden="true"
              />
              Building&hellip;
            </>
          ) : (
            <>
              Build my receptionist
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
