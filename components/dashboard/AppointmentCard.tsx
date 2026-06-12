"use client";

import { ChevronRight, Clock, User, MessageSquare } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/ui/Badge";
import type { AppointmentCardProps } from "./DashboardTypes";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) return "Today";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function AppointmentCard({
  appointment,
  callLog,
  isActive = false,
  onClick,
}: AppointmentCardProps) {
  const time = formatTime(appointment.starts_at);
  const date = formatDate(appointment.starts_at);
  const hasTranscript = !!callLog?.transcript;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-4 rounded-[6px] border
        transition-all duration-150 outline-none group
        focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-1
        ${
          isActive
            ? "bg-[oklch(48%_0.2_264_/_0.06)] border-[oklch(48%_0.2_264_/_0.3)]"
            : "bg-white border-[oklch(88%_0.004_264)] hover:border-[oklch(78%_0.005_264)] hover:bg-[oklch(98.5%_0.002_264)]"
        }
      `}
      aria-pressed={isActive}
      aria-label={`Appointment: ${appointment.caller_name}, ${date} at ${time}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[oklch(94%_0.003_264)] flex items-center justify-center flex-shrink-0 mt-0.5"
          aria-hidden="true"
        >
          <span className="text-xs font-semibold text-[oklch(40%_0.005_264)]">
            {appointment.caller_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-[oklch(9%_0_0)] truncate">
                {appointment.caller_name}
              </span>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <ChevronRight
              size={14}
              className={`
                flex-shrink-0 transition-colors duration-150
                ${isActive ? "text-[oklch(48%_0.2_264)]" : "text-[oklch(78%_0.005_264)] group-hover:text-[oklch(60%_0.006_264)]"}
              `}
              aria-hidden="true"
            />
          </div>

          {/* Reason */}
          <p className="text-sm text-[oklch(40%_0.005_264)] truncate mb-2">
            {appointment.reason}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-[oklch(60%_0.006_264)]">
              <Clock size={11} aria-hidden="true" />
              {date} · {time}
            </span>
            {hasTranscript && (
              <span className="inline-flex items-center gap-1 text-xs text-[oklch(48%_0.2_264)]">
                <MessageSquare size={11} aria-hidden="true" />
                Transcript
              </span>
            )}
          </div>

          {/* AI summary — shown inline when not expanded */}
          {callLog?.summary && !isActive && (
            <p className="mt-2 text-xs text-[oklch(50%_0.006_264)] italic leading-relaxed line-clamp-2">
              &ldquo;{callLog.summary}&rdquo;
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton state ───────────────────────────────────────────────────────────

export function AppointmentCardSkeleton() {
  return (
    <div
      className="w-full px-4 py-4 rounded-[6px] border border-[oklch(88%_0.004_264)] bg-white"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[oklch(94%_0.003_264)] animate-pulse flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-[oklch(94%_0.003_264)] animate-pulse rounded-[3px]" />
            <div className="h-4 w-14 bg-[oklch(94%_0.003_264)] animate-pulse rounded-full" />
          </div>
          <div className="h-3.5 w-40 bg-[oklch(94%_0.003_264)] animate-pulse rounded-[3px]" />
          <div className="h-3 w-32 bg-[oklch(94%_0.003_264)] animate-pulse rounded-[3px]" />
        </div>
      </div>
    </div>
  );
}
