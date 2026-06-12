"use client";

import { PhoneIncoming, Sparkles, FileText } from "lucide-react";
import type { TranscriptPanelProps } from "./DashboardTypes";

export function TranscriptPanel({ callLog, liveCall, loading = false }: TranscriptPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="Loading transcript">
        <div className="h-5 w-32 bg-[oklch(94%_0.003_264)] animate-pulse rounded-[3px]" />
        <div className="h-12 w-full bg-[oklch(94%_0.003_264)] animate-pulse rounded-[6px]" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-3.5 bg-[oklch(94%_0.003_264)] animate-pulse rounded-[3px]"
              style={{ width: `${65 + (i % 3) * 12}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const transcript = liveCall?.transcript ?? callLog?.transcript;
  const summary = callLog?.summary;

  if (!transcript && !liveCall) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-[oklch(93%_0.003_264)] flex items-center justify-center">
          <FileText
            size={18}
            className="text-[oklch(50%_0.005_264)]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-[oklch(34%_0.005_264)]">
            No transcript selected
          </p>
          <p className="text-xs text-[oklch(50%_0.005_264)] max-w-[20ch] leading-relaxed">
            Select an appointment to view the call transcript.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-5 p-6 h-full overflow-y-auto"
      aria-label="Call transcript"
      style={{ animation: "fd-panel-in 180ms cubic-bezier(0.0, 0, 0.2, 1)" }}
    >
      {/* Live call state */}
      {liveCall && (
        <div
          className="flex gap-3 p-4 border rounded-[8px]"
          style={{
            background: "color-mix(in oklch, var(--fd-accent, oklch(48% 0.2 264)) 6%, white)",
            borderColor: "color-mix(in oklch, var(--fd-accent, oklch(48% 0.2 264)) 28%, transparent)",
          }}
          role="status"
          aria-label="Live phone call"
        >
          <PhoneIncoming
            size={15}
            style={{ color: "var(--fd-accent, oklch(48% 0.2 264))" }}
            className="flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1 min-w-0">
            <span
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--fd-accent, oklch(48% 0.2 264))" }}
            >
              {liveCall.status === "ringing"
                ? "Incoming phone call"
                : liveCall.status === "booked"
                  ? "Booking confirmed"
                  : "Live phone call"}
            </span>
            <p className="text-sm text-[oklch(14%_0.002_264)] leading-relaxed font-medium">
              {liveCall.caller_name ?? liveCall.caller_phone ?? "Unknown caller"}
              {liveCall.current_speaker ? `, ${liveCall.current_speaker} speaking` : ""}
            </p>
          </div>
        </div>
      )}

      {/* AI Summary */}
      {summary && (
        <div
          className="flex gap-3 p-4 bg-[oklch(48%_0.2_264_/_0.05)] border border-[oklch(48%_0.2_264_/_0.22)] rounded-[6px]"
          role="region"
          aria-label="AI summary"
        >
          <Sparkles
            size={14}
            className="text-[oklch(44%_0.2_264)] flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold text-[oklch(36%_0.2_264)] uppercase tracking-wide">
              AI Summary
            </span>
            <p className="text-sm text-[oklch(14%_0.002_264)] leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      )}

      {/* Transcript label */}
      <div className="flex items-center gap-2">
        <FileText
          size={13}
          className="text-[oklch(50%_0.005_264)]"
          aria-hidden="true"
        />
        <h3 className="text-xs font-semibold text-[oklch(34%_0.005_264)] uppercase tracking-wide">
          Full transcript
        </h3>
      </div>

      {/* Transcript body */}
      <div className="flex-1">
        <pre
          className="text-sm text-[oklch(14%_0.002_264)] leading-[1.75] font-[var(--font-mono)] whitespace-pre-wrap break-words"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {transcript || "Waiting for the first spoken words..."}
        </pre>
      </div>
    </div>
  );
}
