"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Check, ExternalLink, LayoutDashboard } from "lucide-react";
import type { OnboardingPublishedProps } from "./OnboardingTypes";

export function OnboardingPublished({
  slug,
  businessName,
  onStartOver,
}: OnboardingPublishedProps) {
  const [copiedCall, setCopiedCall] = useState(false);

  const callUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}`;
  const dashboardUrl = `/b/${slug}`;

  async function copyCallUrl() {
    try {
      await navigator.clipboard.writeText(callUrl);
      setCopiedCall(true);
      setTimeout(() => setCopiedCall(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div
      className="w-full max-w-md mx-auto text-center"
      style={{ animation: "fd-step-in 320ms ease-out both" }}
    >
      {/* Success mark */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_0_6px_oklch(44%_0.16_145_/_0.1)]"
          style={{
            background: "oklch(44% 0.16 145 / 0.12)",
            animation: "fd-confirm-pop 400ms cubic-bezier(0.0, 0, 0.2, 1) both",
          }}
        >
          <CheckCircle2
            size={28}
            className="text-[oklch(34%_0.16_145)]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2
            className="text-2xl font-semibold tracking-tight text-[oklch(7%_0_0)]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {businessName} is live
          </h2>
          <p className="text-sm text-[oklch(34%_0.005_264)] leading-relaxed max-w-[36ch] mx-auto">
            Share the link below with your customers. When they open it, they can call your AI receptionist directly.
          </p>
        </div>
      </div>

      {/* Call link */}
      <div className="flex flex-col gap-3 mb-8">
        <div
          className="flex items-center gap-0 border border-[oklch(88%_0.004_264)] rounded-[6px] overflow-hidden bg-white"
        >
          <div className="flex-1 px-4 py-3 text-left">
            <p className="text-[10px] font-medium text-[oklch(60%_0.006_264)] uppercase tracking-wide mb-0.5">
              Caller link
            </p>
            <p className="text-sm text-[oklch(9%_0_0)] font-medium truncate">
              /c/{slug}
            </p>
          </div>
          <button
            onClick={copyCallUrl}
            className="flex items-center gap-2 h-full px-4 py-3 border-l border-[oklch(84%_0.004_264)] text-sm font-medium text-[oklch(34%_0.005_264)] hover:bg-[oklch(97.5%_0.002_264)] hover:text-[oklch(7%_0_0)] transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[oklch(48%_0.2_264)]"
            aria-label="Copy caller link"
          >
            {copiedCall ? (
              <>
                <Check size={14} className="text-[oklch(53%_0.16_145)]" aria-hidden="true" />
                <span className="text-[oklch(53%_0.16_145)]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Link buttons */}
        <div className="flex gap-2">
          <a
            href={`/c/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-[6px] border border-[oklch(84%_0.004_264)] text-[oklch(7%_0_0)] bg-white hover:bg-[oklch(97.5%_0.002_264)] hover:border-[oklch(68%_0.005_264)] transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-1 active:scale-[0.98]"
          >
            <ExternalLink size={14} aria-hidden="true" />
            Open caller page
          </a>
          <a
            href={dashboardUrl}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-[6px] border border-[oklch(84%_0.004_264)] text-[oklch(7%_0_0)] bg-white hover:bg-[oklch(97.5%_0.002_264)] hover:border-[oklch(68%_0.005_264)] transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-1 active:scale-[0.98]"
          >
            <LayoutDashboard size={14} aria-hidden="true" />
            Dashboard
          </a>
        </div>
      </div>

      {/* What's next */}
      <div className="border-t border-[oklch(88%_0.004_264)] pt-6 flex flex-col gap-4">
        <p className="text-xs font-medium text-[oklch(40%_0.005_264)] uppercase tracking-wide">
          What to do next
        </p>
        <ul className="text-sm text-[oklch(40%_0.005_264)] space-y-2 text-left">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-[oklch(94%_0.003_264)] text-[10px] font-semibold text-[oklch(40%_0.005_264)] mt-0.5">1</span>
            <span>Share <strong className="text-[oklch(9%_0_0)]">/c/{slug}</strong> in your email signature, Google listing, or website.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-[oklch(94%_0.003_264)] text-[10px] font-semibold text-[oklch(40%_0.005_264)] mt-0.5">2</span>
            <span>Check the dashboard for new bookings and call transcripts.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-[oklch(94%_0.003_264)] text-[10px] font-semibold text-[oklch(40%_0.005_264)] mt-0.5">3</span>
            <span>Test it yourself: open the caller link and try booking an appointment.</span>
          </li>
        </ul>
      </div>

      {onStartOver && (
        <button
          onClick={onStartOver}
          className="mt-8 text-sm text-[oklch(60%_0.006_264)] hover:text-[oklch(40%_0.005_264)] transition-colors duration-150 outline-none cursor-pointer"
        >
          Set up another business
        </button>
      )}
    </div>
  );
}
