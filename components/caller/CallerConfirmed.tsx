"use client";

import { CheckCircle, Calendar, Clock, User, RefreshCw } from "lucide-react";

interface AppointmentDetail {
  callerName: string;
  reason: string;
  startsAt: string; // ISO 8601
  duration: number; // minutes
}

interface CallerConfirmedProps {
  confirmationText?: string;
  appointment?: AppointmentDetail;
  onReset?: () => void;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

export function CallerConfirmed({
  confirmationText,
  appointment,
  onReset,
}: CallerConfirmedProps) {
  const formatted = appointment ? formatDateTime(appointment.startsAt) : null;

  return (
    <div
      className="flex flex-col items-center gap-8 text-center"
      style={{ animation: "status-fade-in 250ms cubic-bezier(0.0, 0, 0.2, 1)" }}
    >
      {/* Success icon */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_0_6px_oklch(48%_0.16_145_/_0.08)]"
          style={{
            background: "oklch(48% 0.16 145 / 0.12)",
            animation: "fd-confirm-pop 400ms cubic-bezier(0.0, 0, 0.2, 1) both",
          }}
        >
          <CheckCircle
            size={32}
            strokeWidth={1.75}
            style={{ color: "oklch(36% 0.16 145)" }}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--fd-fg)" }}
          >
            Appointment booked
          </h2>
          {confirmationText && (
            <p
              className="text-sm max-w-[30ch] leading-relaxed"
              style={{ color: "var(--fd-muted)" }}
            >
              {confirmationText}
            </p>
          )}
        </div>
      </div>

      {/* Appointment card */}
      {appointment && formatted && (
        <div
          className="w-full max-w-xs rounded-[8px] p-5 text-left"
          style={{
            border: "1px solid oklch(82% 0.004 264)",
            background: "oklch(99% 0.002 264)",
            boxShadow: "0 1px 4px oklch(0% 0 0 / 0.05)",
            animation: "fd-slide-up 320ms 80ms cubic-bezier(0.0, 0, 0.2, 1) both",
          }}
        >
          <div className="flex flex-col gap-3">
            <Row
              icon={<User size={14} aria-hidden="true" />}
              label="Patient"
              value={appointment.callerName}
            />
            <Divider />
            <Row
              icon={<Calendar size={14} aria-hidden="true" />}
              label="Date"
              value={formatted.date}
            />
            <Divider />
            <Row
              icon={<Clock size={14} aria-hidden="true" />}
              label="Time"
              value={`${formatted.time} · ${appointment.duration} min`}
            />
            {appointment.reason && (
              <>
                <Divider />
                <Row
                  icon={
                    <span className="w-3.5 h-3.5 flex items-center justify-center" aria-hidden="true">
                      ✦
                    </span>
                  }
                  label="Reason"
                  value={appointment.reason}
                />
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 h-8 px-3.5 text-sm font-medium rounded-[6px] border transition-all duration-150 outline-none cursor-pointer hover:bg-[oklch(97.5%_0.002_264)] hover:border-[oklch(74%_0.006_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2"
        style={{
          color: "var(--fd-fg)",
          borderColor: "var(--fd-border)",
          background: "transparent",
        }}
      >
        <RefreshCw size={14} aria-hidden="true" />
        Call again
      </button>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex-shrink-0"
        style={{ color: "var(--fd-muted)" }}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--fd-muted)" }}
        >
          {label}
        </span>
        <span
          className="text-sm font-medium leading-snug"
          style={{ color: "var(--fd-fg)" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <hr style={{ borderColor: "var(--fd-border)" }} />;
}
