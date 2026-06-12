"use client";

interface CallerConnectingProps {
  onCancel?: () => void;
}

export function CallerConnecting({ onCancel }: CallerConnectingProps) {
  return (
    <div
      className="flex flex-col items-center gap-8 text-center"
      style={{ animation: "status-fade-in 200ms cubic-bezier(0.0, 0, 0.2, 1)" }}
    >
      {/* Spinner orb */}
      <div className="relative w-24 h-24 flex items-center justify-center" aria-label="Connecting" role="status">
        {/* Outer ring */}
        <span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: "var(--fd-border)" }}
          aria-hidden="true"
        />
        {/* Second pulsing ring */}
        <span
          className="absolute inset-[-6px] rounded-full border"
          style={{
            borderColor: "color-mix(in oklch, var(--fd-accent) 15%, transparent)",
            animation: "pulse-ring 2s ease-out infinite",
          }}
          aria-hidden="true"
        />
        {/* Spinning arc */}
        <span
          className="absolute inset-[3px] rounded-full border-[2.5px] border-transparent"
          style={{
            borderTopColor: "var(--fd-accent)",
            animation: "spinner 0.85s linear infinite",
          }}
          aria-hidden="true"
        />
        {/* Inner circle */}
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "color-mix(in oklch, var(--fd-accent) 10%, var(--fd-bg))" }}
          aria-hidden="true"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--fd-accent)" }}
          />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold tracking-tight" style={{ color: "var(--fd-fg)" }}>
          Connecting
        </p>
        <p className="text-sm" style={{ color: "var(--fd-muted)" }}>
          Requesting microphone and reaching the agent&hellip;
        </p>
      </div>

      <button
        onClick={onCancel}
        className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-[6px] border transition-all duration-150 outline-none cursor-pointer hover:bg-[oklch(97.5%_0.002_264)] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2"
        style={{
          color: "var(--fd-muted)",
          borderColor: "var(--fd-border)",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
