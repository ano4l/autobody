import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelTone = "default" | "warm" | "soft" | "dark";

const panelToneClasses: Record<PanelTone, string> = {
  default:
    "glass-surface panel-noise bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,255,255,0.74)_100%)]",
  warm: "glass-surface panel-noise bg-[linear-gradient(180deg,rgba(252,241,236,0.98)_0%,rgba(255,255,255,0.88)_100%)]",
  soft: "glass-surface panel-noise bg-[linear-gradient(180deg,rgba(250,247,242,0.96)_0%,rgba(255,255,255,0.8)_100%)]",
  dark: "relative overflow-hidden border border-ink-800/70 bg-[linear-gradient(180deg,#3d3929_0%,#262220_100%)] text-cream-50 shadow-[0_34px_80px_-34px_rgba(38,34,32,0.62)]",
};

interface OpsPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
}

interface OpsSectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

interface OpsMetricProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
}

interface OpsEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  action?: ReactNode;
}

export function OpsCanvas({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "glass-surface panel-noise soft-grid relative overflow-hidden rounded-[34px]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-clay-100/50 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(245,217,205,0.9),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_top_right,rgba(201,100,66,0.16),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-28 w-52 bg-[radial-gradient(circle_at_bottom_left,rgba(90,124,60,0.12),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-28 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)] animate-sheen"
      />
      <div className="relative">{children}</div>
    </section>
  );
}

export function OpsPanel({ className, tone = "default", children, ...props }: OpsPanelProps) {
  return (
    <div
      className={cn("glass-hover rounded-[28px] p-5", panelToneClasses[tone], className)}
      {...props}
    >
      {tone === "dark" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)]"
        />
      ) : null}
      {children}
    </div>
  );
}

export function OpsSectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: OpsSectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-clay-600">
            {eyebrow}
          </p>
        ) : null}
        <div>
          <h2 className="text-display-sm font-serif text-ink-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function OpsMetric({
  className,
  label,
  value,
  hint,
  icon,
  valueClassName,
  ...props
}: OpsMetricProps) {
  return (
    <div
      className={cn(
        "glass-surface panel-noise glass-hover rounded-[26px] p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-500">
            {label}
          </p>
          <div className={cn("mt-3 text-2xl font-semibold text-ink-900", valueClassName)}>
            {value}
          </div>
          {hint ? <p className="mt-2 text-xs text-ink-600">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="liquid-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-clay-100 bg-[linear-gradient(180deg,rgba(252,241,236,0.96)_0%,rgba(255,255,255,0.88)_100%)] text-clay-600">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function OpsEmptyState({
  className,
  title,
  description,
  action,
  ...props
}: OpsEmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-surface panel-noise rounded-[30px] border-dashed border-cream-300 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <h3 className="text-lg font-medium text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
