"use client";

interface CallerConnectingProps {
  onCancel?: () => void;
}

export function CallerConnecting({ onCancel }: CallerConnectingProps) {
  return (
    <div
      className="flex flex-col items-center gap-8 text-center"
      style={{ animation: "status-fade-in 200ms ease-out" }}
    >
      {/* Spinner orb */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer ring */}
        <span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: "var(--fd-border)" }}
          aria-hidden="true"
        />
        {/* Spinning arc */}
        <span
          className="absolute inset-[3px] rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--fd-accent)",
            animation: "spinner 0.9s linear infinite",
          }}
          aria-hidden="true"
        />
        {/* Inner dot */}
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--fd-accent)" }}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg font-medium tracking-tight" style={{ color: "var(--fd-fg)" }}>
          Connecting
        </p>
        <p className="text-sm" style={{ color: "var(--fd-muted)" }}>
          Requesting microphone and reaching the agent&hellip;
        </p>
      </div>

      <button
        onClick={onCancel}
        className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-[6px] transition-colors duration-150 outline-none cursor-pointer"
        style={{ color: "var(--fd-muted)" }}
      >
        Cancel
      </button>
    </div>
  );
}
