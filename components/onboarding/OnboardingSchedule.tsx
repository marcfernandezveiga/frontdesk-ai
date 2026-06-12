"use client";

import { useState, useCallback, useId } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, Clock, Check } from "lucide-react";
import type { Schedule, DaySchedule, Shift } from "@/lib/tenant";
import { SCHEDULE_PRESETS } from "@/lib/tenant";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingScheduleProps {
  /** Current schedule value (controlled) */
  schedule: Schedule;
  onChange: (s: Schedule) => void;
  /** Approximate bookable slots per week — wave B computes via countSlotsPerWeek */
  slotsPerWeek?: number;
  /** Whether the continue action is in progress */
  publishing?: boolean;
  onBack?: () => void;
  onContinue: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: 1, short: "Mon", long: "Monday" },
  { key: 2, short: "Tue", long: "Tuesday" },
  { key: 3, short: "Wed", long: "Wednesday" },
  { key: 4, short: "Thu", long: "Thursday" },
  { key: 5, short: "Fri", long: "Friday" },
  { key: 6, short: "Sat", long: "Saturday" },
  { key: 0, short: "Sun", long: "Sunday" },
] as const;

const SLOT_DURATIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hr" },
];

const CUSTOM_DURATION_SENTINEL = -1;

// Shared input styles matching the onboarding design system
const INPUT_BASE =
  "border border-[oklch(88%_0.004_264)] rounded-[6px] bg-white text-[oklch(9%_0_0)] placeholder:text-[oklch(60%_0.006_264)] outline-none transition-colors duration-150 focus-visible:border-[oklch(48%_0.2_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264_/_0.15)]";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ShiftRow({
  shift,
  index,
  canRemove,
  onChange,
  onRemove,
  dayLabel,
}: {
  shift: Shift;
  index: number;
  canRemove: boolean;
  onChange: (s: Shift) => void;
  onRemove: () => void;
  dayLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={shift.start}
        onChange={(e) => onChange({ ...shift, start: e.target.value })}
        aria-label={`${dayLabel} shift ${index + 1} start time`}
        className={`h-8 w-[7.5rem] px-2.5 text-sm tabular-nums ${INPUT_BASE}`}
      />
      <span className="text-xs text-[oklch(60%_0.006_264)] select-none" aria-hidden="true">
        to
      </span>
      <input
        type="time"
        value={shift.end}
        onChange={(e) => onChange({ ...shift, end: e.target.value })}
        aria-label={`${dayLabel} shift ${index + 1} end time`}
        className={`h-8 w-[7.5rem] px-2.5 text-sm tabular-nums ${INPUT_BASE}`}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${dayLabel} shift ${index + 1}`}
          className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[oklch(60%_0.006_264)] hover:text-[oklch(44%_0.22_25)] hover:bg-[oklch(57%_0.22_25_/_0.06)] transition-colors duration-150 outline-none cursor-pointer flex-shrink-0"
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function DayRow({
  dayKey,
  label,
  day,
  onChange,
}: {
  dayKey: number;
  label: string;
  day: DaySchedule;
  onChange: (d: DaySchedule) => void;
}) {
  const id = useId();
  const toggleId = `${id}-toggle`;

  const handleToggle = () => {
    const enabled = !day.enabled;
    onChange({
      enabled,
      shifts:
        enabled && day.shifts.length === 0
          ? [{ start: "09:00", end: "17:00" }]
          : day.shifts,
    });
  };

  const updateShift = (i: number, s: Shift) => {
    const shifts = day.shifts.map((sh, idx) => (idx === i ? s : sh));
    onChange({ ...day, shifts });
  };

  const addShift = () => {
    const last = day.shifts[day.shifts.length - 1];
    // Default new shift starts 1 hr after previous end, or reasonable fallback
    const newStart = last?.end ?? "09:00";
    onChange({ ...day, shifts: [...day.shifts, { start: newStart, end: "23:00" }] });
  };

  const removeShift = (i: number) => {
    const shifts = day.shifts.filter((_, idx) => idx !== i);
    onChange({ ...day, shifts });
  };

  return (
    <div
      className={`rounded-[8px] border transition-colors duration-150 ${
        day.enabled
          ? "border-[oklch(88%_0.004_264)] bg-white"
          : "border-[oklch(92%_0.003_264)] bg-[oklch(97.5%_0.002_264)]"
      }`}
    >
      {/* Day header: toggle + label */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Custom toggle */}
        <button
          type="button"
          role="switch"
          id={toggleId}
          aria-checked={day.enabled}
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2 cursor-pointer ${
            day.enabled
              ? "bg-[oklch(9%_0_0)] border-[oklch(9%_0_0)]"
              : "bg-[oklch(88%_0.004_264)] border-[oklch(88%_0.004_264)]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_oklch(0%_0_0_/_0.2)] transition-transform duration-200 ${
              day.enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
            style={{ marginTop: "1.5px" }}
            aria-hidden="true"
          />
          <span className="sr-only">{day.enabled ? "Open" : "Closed"}</span>
        </button>

        <label
          htmlFor={toggleId}
          className={`text-sm font-medium select-none cursor-pointer w-8 flex-shrink-0 ${
            day.enabled ? "text-[oklch(9%_0_0)]" : "text-[oklch(55%_0.006_264)]"
          }`}
        >
          {label}
        </label>

        {!day.enabled && (
          <span className="text-xs text-[oklch(65%_0.006_264)]">Closed</span>
        )}
      </div>

      {/* Shifts */}
      {day.enabled && (
        <div className="px-4 pb-3 flex flex-col gap-2 border-t border-[oklch(92%_0.003_264)] pt-3">
          {day.shifts.map((shift, i) => (
            <ShiftRow
              key={i}
              shift={shift}
              index={i}
              canRemove={day.shifts.length > 1}
              onChange={(s) => updateShift(i, s)}
              onRemove={() => removeShift(i)}
              dayLabel={label}
            />
          ))}
          {day.shifts.length < 3 && (
            <button
              type="button"
              onClick={addShift}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(48%_0.2_264)] hover:text-[oklch(38%_0.2_264)] transition-colors duration-150 outline-none cursor-pointer self-start mt-0.5"
            >
              <Plus size={12} aria-hidden="true" />
              Add shift
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingSchedule({
  schedule,
  onChange,
  slotsPerWeek,
  publishing = false,
  onBack,
  onContinue,
}: OnboardingScheduleProps) {
  const uid = useId();
  const customDurationId = `${uid}-custom-duration`;

  // Track whether the active slot duration is a preset or custom
  const isPreset = SLOT_DURATIONS.some((d) => d.value === schedule.slotDurationMin);
  const [showCustomDuration, setShowCustomDuration] = useState(!isPreset);
  const [customDurationInput, setCustomDurationInput] = useState(
    !isPreset ? String(schedule.slotDurationMin) : ""
  );
  // Which preset is active (by id)
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Apply a preset
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = SCHEDULE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      setActivePresetId(presetId);
      onChange(preset.schedule);
      // Reset custom duration state to match preset's slot duration
      const presetIsStandard = SLOT_DURATIONS.some(
        (d) => d.value === preset.schedule.slotDurationMin
      );
      setShowCustomDuration(!presetIsStandard);
      setCustomDurationInput(
        !presetIsStandard ? String(preset.schedule.slotDurationMin) : ""
      );
    },
    [onChange]
  );

  // Update a single day
  const updateDay = useCallback(
    (dayKey: number, day: DaySchedule) => {
      setActivePresetId(null); // manual edit clears preset highlight
      onChange({
        ...schedule,
        week: { ...schedule.week, [dayKey]: day },
      });
    },
    [schedule, onChange]
  );

  // Update slot duration
  const setSlotDuration = (minutes: number) => {
    setActivePresetId(null);
    if (minutes === CUSTOM_DURATION_SENTINEL) {
      setShowCustomDuration(true);
      return;
    }
    setShowCustomDuration(false);
    setCustomDurationInput("");
    onChange({ ...schedule, slotDurationMin: minutes });
  };

  const handleCustomDuration = (raw: string) => {
    setCustomDurationInput(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 5 && n <= 480) {
      onChange({ ...schedule, slotDurationMin: n });
    }
  };

  return (
    <div
      className="w-full max-w-lg mx-auto"
      style={{ animation: "fd-step-in 280ms ease-out both" }}
    >
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-[oklch(60%_0.006_264)] hover:text-[oklch(40%_0.005_264)] transition-colors duration-150 outline-none cursor-pointer mb-4"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            Back
          </button>
        )}
        <h2
          className="text-2xl font-semibold tracking-[-0.02em] text-[oklch(7%_0_0)] mb-2"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          Set your hours
        </h2>
        <p className="text-sm text-[oklch(34%_0.005_264)] leading-relaxed">
          Pick a starting point below, then adjust any day. Callers can only book
          within these hours.
        </p>
      </div>

      {/* Preset chips */}
      <div className="mb-6">
        <p className="text-xs font-medium text-[oklch(40%_0.005_264)] mb-2.5">Quick start</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Schedule presets">
          {SCHEDULE_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] text-xs font-medium border transition-all duration-150 outline-none cursor-pointer ${
                  active
                    ? "bg-[oklch(9%_0_0)] border-[oklch(9%_0_0)] text-white"
                    : "bg-white border-[oklch(88%_0.004_264)] text-[oklch(40%_0.005_264)] hover:border-[oklch(70%_0.005_264)] hover:text-[oklch(9%_0_0)]"
                }`}
                aria-pressed={active}
              >
                {active && <Check size={11} aria-hidden="true" />}
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day rows */}
      <div className="flex flex-col gap-2 mb-6" role="group" aria-label="Weekly schedule">
        {DAYS.map(({ key, short, long }) => (
          <DayRow
            key={key}
            dayKey={key}
            label={short}
            day={schedule.week[key] ?? { enabled: false, shifts: [] }}
            onChange={(d) => updateDay(key, d)}
          />
        ))}
      </div>

      {/* Slot duration */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2.5">
          <Clock size={13} className="text-[oklch(55%_0.006_264)]" aria-hidden="true" />
          <p className="text-xs font-medium text-[oklch(40%_0.005_264)]">
            Booking length
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Booking length options">
          {SLOT_DURATIONS.map((d) => {
            const active = !showCustomDuration && schedule.slotDurationMin === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setSlotDuration(d.value)}
                aria-pressed={active}
                className={`h-8 px-3.5 rounded-[6px] text-xs font-medium border transition-all duration-150 outline-none cursor-pointer ${
                  active
                    ? "bg-[oklch(9%_0_0)] border-[oklch(9%_0_0)] text-white"
                    : "bg-white border-[oklch(88%_0.004_264)] text-[oklch(40%_0.005_264)] hover:border-[oklch(70%_0.005_264)] hover:text-[oklch(9%_0_0)]"
                }`}
              >
                {d.label}
              </button>
            );
          })}
          {/* Custom */}
          <button
            type="button"
            onClick={() => setSlotDuration(CUSTOM_DURATION_SENTINEL)}
            aria-pressed={showCustomDuration}
            className={`h-8 px-3.5 rounded-[6px] text-xs font-medium border transition-all duration-150 outline-none cursor-pointer ${
              showCustomDuration
                ? "bg-[oklch(9%_0_0)] border-[oklch(9%_0_0)] text-white"
                : "bg-white border-[oklch(88%_0.004_264)] text-[oklch(40%_0.005_264)] hover:border-[oklch(70%_0.005_264)] hover:text-[oklch(9%_0_0)]"
            }`}
          >
            Custom
          </button>
        </div>

        {showCustomDuration && (
          <div className="flex items-center gap-2 mt-3">
            <label htmlFor={customDurationId} className="text-xs text-[oklch(40%_0.005_264)]">
              Minutes per slot:
            </label>
            <input
              id={customDurationId}
              type="number"
              min={5}
              max={480}
              step={5}
              value={customDurationInput}
              onChange={(e) => handleCustomDuration(e.target.value)}
              placeholder="e.g. 20"
              className={`h-8 w-24 px-3 text-sm ${INPUT_BASE}`}
            />
          </div>
        )}
      </div>

      {/* Live slot count */}
      {slotsPerWeek !== undefined && (
        <div className="mb-8 flex items-center gap-2 px-4 py-3 rounded-[6px] bg-[oklch(97.5%_0.002_264)] border border-[oklch(88%_0.004_264)]">
          <span className="text-sm text-[oklch(40%_0.005_264)]">
            About{" "}
            <span className="font-semibold text-[oklch(9%_0_0)] tabular-nums">
              {slotsPerWeek}
            </span>{" "}
            bookable {slotsPerWeek === 1 ? "slot" : "slots"} per week
          </span>
        </div>
      )}

      {/* Continue */}
      <button
        type="button"
        onClick={onContinue}
        disabled={publishing}
        className="inline-flex items-center justify-center gap-2.5 h-12 w-full px-6 text-sm font-semibold rounded-[6px] bg-[oklch(9%_0_0)] text-white border border-[oklch(9%_0_0)] transition-all duration-150 outline-none cursor-pointer select-none hover:bg-[oklch(18%_0_0)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_1px_3px_oklch(0%_0_0_/_0.18)]"
      >
        {publishing ? (
          <>
            <span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full opacity-70"
              style={{ animation: "spinner 0.7s linear infinite" }}
              aria-hidden="true"
            />
            Saving&hellip;
          </>
        ) : (
          <>
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
