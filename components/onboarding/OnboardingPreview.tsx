"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { CallerPage } from "@/components/caller/CallerPage";
import { themeToCssVars } from "@/lib/tenant";
import type { OnboardingPreviewProps } from "./OnboardingTypes";

// ─── Editable field ───────────────────────────────────────────────────────────

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  multiline = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const sharedClass =
    "w-full px-3 text-sm border border-[oklch(88%_0.004_264)] rounded-[6px] bg-white text-[oklch(9%_0_0)] placeholder:text-[oklch(60%_0.006_264)] outline-none transition-colors duration-150 focus-visible:border-[oklch(48%_0.2_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264_/_0.15)]";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[oklch(40%_0.005_264)]">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${sharedClass} py-2.5 resize-none`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${sharedClass} h-9`}
        />
      )}
      {hint && (
        <p className="text-xs text-[oklch(60%_0.006_264)]">{hint}</p>
      )}
    </div>
  );
}

// ─── Services editor ──────────────────────────────────────────────────────────

function ServicesEditor({
  services,
  onServiceChange,
  onServiceAdd,
  onServiceRemove,
}: {
  services: { name: string }[];
  onServiceChange: (i: number, name: string) => void;
  onServiceAdd: () => void;
  onServiceRemove: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[oklch(40%_0.005_264)]">Services</span>
      <div className="flex flex-col gap-1.5">
        {services.map((svc, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={svc.name}
              onChange={(e) => onServiceChange(i, e.target.value)}
              placeholder="Service name"
              aria-label={`Service ${i + 1}`}
              className="flex-1 h-8 px-3 text-sm border border-[oklch(88%_0.004_264)] rounded-[6px] bg-white text-[oklch(9%_0_0)] placeholder:text-[oklch(60%_0.006_264)] outline-none transition-colors duration-150 focus-visible:border-[oklch(48%_0.2_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264_/_0.15)]"
            />
            {services.length > 1 && (
              <button
                onClick={() => onServiceRemove(i)}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[oklch(60%_0.006_264)] hover:text-[oklch(44%_0.22_25)] hover:bg-[oklch(57%_0.22_25_/_0.06)] transition-colors duration-150 outline-none cursor-pointer"
                aria-label={`Remove service ${i + 1}`}
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
      {services.length < 8 && (
        <button
          onClick={onServiceAdd}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(48%_0.2_264)] hover:text-[oklch(38%_0.2_264)] transition-colors duration-150 outline-none cursor-pointer self-start"
        >
          <Plus size={13} aria-hidden="true" />
          Add service
        </button>
      )}
    </div>
  );
}

// ─── Main preview component ───────────────────────────────────────────────────

export function OnboardingPreview({
  draft,
  onNameChange,
  onTaglineChange,
  onGreetingChange,
  onServiceChange,
  onServiceAdd,
  onServiceRemove,
  publishing = false,
  onPublish,
  onBack,
}: OnboardingPreviewProps) {
  const [showBrandDetails, setShowBrandDetails] = useState(false);

  // Build inline CSS vars for the preview pane from the draft theme
  const themeVars = themeToCssVars(draft.theme);

  // Inject web font if the tenant has one
  const fontLinkHref = draft.theme.fontUrl;

  return (
    <div
      className="w-full"
      style={{ animation: "fd-brand-reveal 380ms cubic-bezier(0.0, 0, 0.2, 1) both" }}
    >
      {/* Font injection for preview */}
      {fontLinkHref && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontLinkHref} />
      )}

      {/* Two-pane layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Left: edit fields ── */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">

          {/* Back + headline */}
          <div className="flex flex-col gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs text-[oklch(60%_0.006_264)] hover:text-[oklch(40%_0.005_264)] transition-colors duration-150 outline-none cursor-pointer self-start"
              >
                <ArrowLeft size={13} aria-hidden="true" />
                Start over
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[oklch(48%_0.2_264)]" aria-hidden="true" />
                <span className="text-xs font-medium text-[oklch(48%_0.2_264)]">
                  Brand extracted
                </span>
              </div>
              <h2
                className="text-xl font-semibold tracking-tight text-[oklch(9%_0_0)]"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Review your receptionist
              </h2>
              <p className="text-sm text-[oklch(40%_0.005_264)] mt-1.5 leading-relaxed">
                We pulled your brand from the site. Review the details below, edit anything, then publish.
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            <Field
              id="preview-name"
              label="Business name"
              value={draft.name}
              onChange={onNameChange}
              placeholder="Your business name"
            />
            <Field
              id="preview-tagline"
              label="Tagline (shown on caller page)"
              value={draft.tagline ?? ""}
              onChange={onTaglineChange}
              placeholder="A short line about what you do"
            />
            <Field
              id="preview-greeting"
              label="Agent greeting"
              value={draft.greeting}
              onChange={onGreetingChange}
              multiline
              hint="The first thing the AI says when someone calls."
              placeholder="Hi, you've reached…"
            />
            <ServicesEditor
              services={draft.services}
              onServiceChange={onServiceChange}
              onServiceAdd={onServiceAdd}
              onServiceRemove={onServiceRemove}
            />
          </div>

          {/* Brand details toggle */}
          <div className="border-t border-[oklch(88%_0.004_264)] pt-4">
            <button
              onClick={() => setShowBrandDetails((v) => !v)}
              className="flex items-center gap-2 text-xs font-medium text-[oklch(40%_0.005_264)] hover:text-[oklch(9%_0_0)] transition-colors duration-150 outline-none cursor-pointer"
            >
              {showBrandDetails ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
              Brand colors &amp; font
            </button>
            {showBrandDetails && (
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Extracted brand colors">
                {[
                  { label: "Background", value: draft.theme.bg },
                  { label: "Text", value: draft.theme.fg },
                  { label: "Accent", value: draft.theme.accent },
                  { label: "Muted", value: draft.theme.muted },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] border border-[oklch(88%_0.004_264)] bg-[oklch(98.5%_0.002_264)]">
                    <span
                      className="w-3 h-3 rounded-full border border-[oklch(88%_0.004_264)] flex-shrink-0"
                      style={{ background: value }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-[oklch(40%_0.005_264)]">{label}</span>
                    <span className="text-xs text-[oklch(60%_0.006_264)] font-mono">{value}</span>
                  </div>
                ))}
                {draft.theme.fontSans && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] border border-[oklch(88%_0.004_264)] bg-[oklch(98.5%_0.002_264)]">
                    <span className="text-xs text-[oklch(40%_0.005_264)]">Font</span>
                    <span className="text-xs text-[oklch(60%_0.006_264)] font-mono truncate max-w-[120px]">{draft.theme.fontSans}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Publish button */}
          <button
            onClick={onPublish}
            disabled={publishing || !draft.name.trim()}
            className="inline-flex items-center justify-center gap-2.5 h-12 px-6 text-sm font-medium rounded-[6px] bg-[oklch(9%_0_0)] text-white border border-[oklch(9%_0_0)] transition-all duration-150 outline-none cursor-pointer select-none hover:bg-[oklch(20%_0_0)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {publishing ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full opacity-70"
                  style={{ animation: "spinner 0.7s linear infinite" }}
                  aria-hidden="true"
                />
                Publishing&hellip;
              </>
            ) : (
              "Publish receptionist"
            )}
          </button>
        </div>

        {/* ── Right: live branded preview ── */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-[oklch(60%_0.006_264)]">Live preview</span>
            {/* Subtle brand badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
              style={{
                background: `color-mix(in srgb, ${draft.theme.accent} 10%, transparent)`,
                borderColor: `color-mix(in srgb, ${draft.theme.accent} 25%, transparent)`,
                color: draft.theme.accent,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: draft.theme.accent }}
                aria-hidden="true"
              />
              {draft.name || "Your brand"}
            </span>
          </div>

          {/* Preview frame */}
          <div
            className="relative rounded-[12px] border border-[oklch(88%_0.004_264)] overflow-hidden shadow-[0_4px_24px_oklch(0%_0_0_/_0.06)]"
            style={{
              /* Apply tenant theme vars scoped to this element */
              ...themeVars,
            }}
          >
            {/* Browser chrome mockup */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[oklch(88%_0.004_264)] bg-[oklch(98.5%_0.002_264)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(88%_0.004_264)]" aria-hidden="true" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(88%_0.004_264)]" aria-hidden="true" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(88%_0.004_264)]" aria-hidden="true" />
              <div className="flex-1 mx-2 h-5 flex items-center px-3 rounded-[4px] bg-white border border-[oklch(88%_0.004_264)]">
                <span className="text-[10px] text-[oklch(60%_0.006_264)] truncate">
                  frontdesk.ai/c/{draft.slug || "your-business"}
                </span>
              </div>
            </div>

            {/* Scaled CallerPage preview, max-height keeps it screen-contained */}
            <div
              className="relative overflow-hidden"
              style={{ maxHeight: "600px" }}
              aria-label={`Preview of ${draft.name || "your"} caller page`}
              role="region"
            >
              {/* Scale wrapper makes the full CallerPage fit in the preview pane */}
              <div
                style={{
                  transform: "scale(0.75)",
                  transformOrigin: "top center",
                  marginBottom: "-25%",
                }}
              >
                <CallerPage
                  callState="idle"
                  tenant={draft}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-[oklch(60%_0.006_264)] mt-2.5 text-center">
            This is exactly what callers will see.
          </p>
        </div>
      </div>
    </div>
  );
}
