import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "clay" | "leaf" | "amber" | "rust" | "ink";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

const tones: Record<Tone, string> = {
  neutral: "bg-cream-200 text-ink-700 ring-cream-300",
  clay: "bg-clay-50 text-clay-700 ring-clay-100",
  leaf: "bg-leaf-50 text-leaf-600 ring-leaf-500/20",
  amber: "bg-amber-50 text-amber-600 ring-amber-500/30",
  rust: "bg-rust-50 text-rust-600 ring-rust-500/20",
  ink: "bg-ink-900 text-cream-50 ring-ink-800",
};

const dots: Record<Tone, string> = {
  neutral: "bg-ink-500",
  clay: "bg-clay-500",
  leaf: "bg-leaf-500",
  amber: "bg-amber-500",
  rust: "bg-rust-500",
  ink: "bg-cream-100",
};

export function Badge({ className, tone = "neutral", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}
