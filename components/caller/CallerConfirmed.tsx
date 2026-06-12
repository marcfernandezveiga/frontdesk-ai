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
      style={{ animation: "status-fade-in 250ms ease-out" }}
    >
      {/* Success icon */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "oklch(53% 0.16 145 / 0.1)" }}
        >
          <CheckCircle
            size={32}
            strokeWidth={1.5}
            style={{ color: "oklch(40% 0.16 145)" }}
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
            border: "1px solid var(--fd-border)",
            background: "color-mix(in oklch, var(--fd-bg) 95%, var(--fd-fg) 5%)",
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
        className="inline-flex items-center justify-center gap-2 h-8 px-3 text-sm font-medium rounded-[6px] border transition-colors duration-150 outline-none cursor-pointer"
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
