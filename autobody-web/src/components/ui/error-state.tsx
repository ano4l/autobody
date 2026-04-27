"use client";

import { IconAlert } from "./icons";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  // "card" renders a full-width panel inside section content; "inline" renders
  // a slimmer banner suitable for in-line placement above a list.
  variant?: "card" | "inline";
}

export function ErrorState({ message, onRetry, className, variant = "card" }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 text-red-900",
        variant === "card" ? "px-5 py-4" : "px-4 py-3",
        className,
      )}
    >
      <IconAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
      <div className="flex-1 text-sm">
        <p className="font-medium">Couldn&apos;t load this section</p>
        <p className="mt-0.5 text-red-800/90">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 transition hover:bg-red-100"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
