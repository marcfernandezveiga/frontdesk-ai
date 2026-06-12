import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[oklch(9%_0_0)] text-[oklch(100%_0_0)]
    border border-[oklch(9%_0_0)]
    hover:bg-[oklch(20%_0_0)] hover:border-[oklch(20%_0_0)]
    focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2
    disabled:bg-[oklch(88%_0.004_264)] disabled:text-[oklch(60%_0.006_264)] disabled:border-[oklch(88%_0.004_264)] disabled:cursor-not-allowed
  `,
  secondary: `
    bg-transparent text-[oklch(9%_0_0)]
    border border-[oklch(88%_0.004_264)]
    hover:bg-[oklch(97.5%_0.002_264)] hover:border-[oklch(78%_0.005_264)]
    focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2
    disabled:text-[oklch(60%_0.006_264)] disabled:border-[oklch(88%_0.004_264)] disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-[oklch(40%_0.005_264)]
    border border-transparent
    hover:bg-[oklch(97.5%_0.002_264)] hover:text-[oklch(9%_0_0)]
    focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.2_264)] focus-visible:ring-offset-2
    disabled:text-[oklch(60%_0.006_264)] disabled:cursor-not-allowed
  `,
  destructive: `
    bg-[oklch(57%_0.22_25)] text-white
    border border-[oklch(57%_0.22_25)]
    hover:bg-[oklch(50%_0.22_25)]
    focus-visible:ring-2 focus-visible:ring-[oklch(57%_0.22_25)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  "h-8  px-3  text-sm  gap-1.5 rounded-[6px]",
  md:  "h-9  px-4  text-sm  gap-2   rounded-[6px]",
  lg:  "h-10 px-5  text-sm  gap-2   rounded-[6px]",
  xl:  "h-14 px-8  text-base gap-2.5 rounded-[6px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, children, className = "", disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-150
        outline-none cursor-pointer select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full opacity-70"
          style={{ animation: "spinner 0.7s linear infinite" }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});
