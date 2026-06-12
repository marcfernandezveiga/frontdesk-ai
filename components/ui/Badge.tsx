import type { AppointmentStatus } from "@/lib/types";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "live" | "status";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[oklch(53%_0.16_145_/_0.1)] text-[oklch(40%_0.16_145)]",
  warning: "bg-[oklch(68%_0.18_65_/_0.1)]  text-[oklch(50%_0.18_65)]",
  error:   "bg-[oklch(57%_0.22_25_/_0.1)]  text-[oklch(44%_0.22_25)]",
  neutral: "bg-[oklch(94%_0.003_264)]       text-[oklch(40%_0.005_264)]",
  live:    "bg-[oklch(57%_0.22_25_/_0.1)]  text-[oklch(44%_0.22_25)]",
  status:  "bg-[oklch(48%_0.2_264_/_0.1)]  text-[oklch(38%_0.2_264)]",
};

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        text-xs font-medium leading-none tracking-wide
        rounded-full whitespace-nowrap
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "booked") {
    return <Badge variant="success">Booked</Badge>;
  }
  return <Badge variant="neutral">Cancelled</Badge>;
}
