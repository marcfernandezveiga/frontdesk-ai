"use client";

/**
 * /: public landing page.
 *
 * One value line, CTA to /onboard, example link to /c/marina-physio.
 * Spare and confident. No decoration.
 *
 * The old caller behavior (/ drove the ElevenLabs session directly) has been
 * replaced by multi-tenant routing. Existing deployed links to / will hit this
 * page; a redirect to /c/marina-physio is handled in the routing layer (wave 2).
 * For now this page is the entry point for new businesses.
 */

import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-[oklch(86%_0.004_264)]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[4px] bg-[oklch(9%_0_0)] flex items-center justify-center transition-transform duration-150 hover:scale-105">
            <span className="text-[10px] font-bold text-white leading-none" aria-hidden="true">
              FD
            </span>
          </div>
          <span className="text-sm font-semibold text-[oklch(9%_0_0)]">Frontdesk</span>
        </div>
        <Link
          href="/c/marina-physio"
          className="text-xs font-medium text-[oklch(52%_0.006_264)] hover:text-[oklch(20%_0_0)] transition-colors duration-150 cursor-pointer"
        >
          See a live example
        </Link>
      </header>

      {/* Hero */}
      <main
        className="flex flex-1 items-center justify-center px-6 py-20"
        id="main-content"
        style={{ animation: "fd-slide-up 320ms cubic-bezier(0.0, 0, 0.2, 1) both" }}
      >
        <div className="w-full max-w-lg text-center">
          {/* Value line */}
          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.1] text-[oklch(7%_0_0)] mb-5"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            An AI receptionist for your business, ready in 20 seconds
          </h1>

          <p
            className="text-base text-[oklch(34%_0.005_264)] leading-relaxed mb-10 max-w-[44ch] mx-auto"
          >
            Paste your website URL. We read your brand, write your greeting, and give you a shareable call link your customers can use right now.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboard"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-7 text-sm font-medium rounded-[6px] bg-[oklch(9%_0_0)] text-white transition-all duration-150 hover:bg-[oklch(18%_0_0)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2 cursor-pointer shadow-[0_1px_3px_oklch(0%_0_0_/_0.18)]"
            >
              Set up your receptionist
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link
              href="/c/marina-physio"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 text-sm font-medium rounded-[6px] border border-[oklch(82%_0.004_264)] text-[oklch(14%_0_0)] bg-white transition-all duration-150 hover:bg-[oklch(97.5%_0.002_264)] hover:border-[oklch(68%_0.005_264)] hover:shadow-[0_1px_4px_oklch(0%_0_0_/_0.08)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2 cursor-pointer"
            >
              <Phone size={14} aria-hidden="true" />
              See a live example
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-8 flex justify-center">
        <p className="text-xs text-[oklch(52%_0.006_264)]">
          Frontdesk · AI receptionists for local businesses
        </p>
      </footer>
    </div>
  );
}
