import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "liquid-pill inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#c96442_0%,#e0916e_100%)] text-white shadow-[0_18px_38px_-22px_rgba(201,100,66,0.65)] hover:brightness-[1.03] active:scale-[0.99]",
  secondary:
    "border border-white/80 bg-white/78 text-ink-800 hover:bg-white active:scale-[0.99]",
  ghost: "text-ink-700 hover:bg-white/70 hover:text-ink-900",
  danger:
    "bg-[linear-gradient(135deg,#b53d2e_0%,#d45d49_100%)] text-white shadow-[0_18px_38px_-24px_rgba(181,61,46,0.55)] hover:brightness-[1.03]",
  outline: "border border-clay-200 bg-clay-50/70 text-clay-700 hover:bg-clay-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
});
