import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "liquid-pill h-10 w-full rounded-2xl border border-white/80 bg-white/78 px-3 text-sm text-ink-900 placeholder:text-ink-500 transition-colors",
          "hover:border-clay-100 focus:border-clay-500 focus:bg-white",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "liquid-pill h-10 w-full rounded-2xl border border-white/80 bg-white/78 px-3 text-sm text-ink-900 transition-colors",
          "hover:border-clay-100 focus:border-clay-500 focus:bg-white",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "liquid-pill w-full rounded-[24px] border border-white/80 bg-white/78 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 transition-colors",
        "hover:border-clay-100 focus:border-clay-500 focus:bg-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium uppercase tracking-wider text-ink-600", className)}
      {...props}
    />
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const generatedId = React.useId();
  let resolvedId: string | undefined;
  let renderedChild: React.ReactNode = children;

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{ id?: string }>;
    resolvedId = element.props.id ?? generatedId;
    if (!element.props.id) {
      renderedChild = React.cloneElement(element, { id: resolvedId });
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={resolvedId}>{label}</Label>
      {renderedChild}
      {error ? (
        <p className="text-xs text-rust-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
