"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore, type ToastTone } from "@/lib/toast";
import { cn } from "@/lib/utils";

const toneStyles: Record<
  ToastTone,
  { icon: typeof CheckCircle2; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-success",
    barClass: "bg-success",
  },
  error: {
    icon: XCircle,
    iconClass: "text-destructive",
    barClass: "bg-destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-warning",
    barClass: "bg-warning",
  },
  info: {
    icon: Info,
    iconClass: "text-chart-1",
    barClass: "bg-chart-1",
  },
};

export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const tone = toneStyles[item.tone];
          const Icon = tone.icon;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              role={item.tone === "error" ? "alert" : "status"}
            >
              <span
                aria-hidden
                className={cn("absolute left-0 top-0 h-full w-1", tone.barClass)}
              />
              <div className="flex items-start gap-3 p-4 pl-5">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tone.iconClass)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                  {item.action ? (
                    <button
                      type="button"
                      onClick={() => {
                        item.action?.onClick();
                        dismiss(item.id);
                      }}
                      className="mt-2 inline-flex items-center text-xs font-semibold text-accent hover:underline"
                    >
                      {item.action.label}
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
