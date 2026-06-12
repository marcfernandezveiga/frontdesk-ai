"use client";

import { CheckCircle, Calendar, Clock, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
        <div className="w-16 h-16 rounded-full bg-[oklch(53%_0.16_145_/_0.1)] flex items-center justify-center">
          <CheckCircle
            size={32}
            strokeWidth={1.5}
            className="text-[oklch(40%_0.16_145)]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-[oklch(9%_0_0)]">
            Appointment booked
          </h2>
          {confirmationText && (
            <p className="text-sm text-[oklch(40%_0.005_264)] max-w-[30ch] leading-relaxed">
              {confirmationText}
            </p>
          )}
        </div>
      </div>

      {/* Appointment card */}
      {appointment && formatted && (
        <div className="w-full max-w-xs border border-[oklch(88%_0.004_264)] rounded-[8px] p-5 text-left bg-[oklch(98.5%_0.002_264)]">
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
                    <span
                      className="w-3.5 h-3.5 flex items-center justify-center text-[oklch(40%_0.005_264)]"
                      aria-hidden="true"
                    >
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

      <Button variant="secondary" size="sm" onClick={onReset} className="gap-2">
        <RefreshCw size={14} aria-hidden="true" />
        Call again
      </Button>
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
      <span className="mt-0.5 text-[oklch(60%_0.006_264)] flex-shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-[oklch(60%_0.006_264)] font-medium">{label}</span>
        <span className="text-sm text-[oklch(9%_0_0)] font-medium leading-snug">
          {value}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-[oklch(88%_0.004_264)]" />;
}
