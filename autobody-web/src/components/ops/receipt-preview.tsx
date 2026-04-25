import type { ReactNode } from "react";
import type { Order } from "@/lib/types";
import { formatDate, formatMoney, formatOrderSource, cn } from "@/lib/utils";

interface ReceiptPreviewProps {
  order: Order | null;
  loading?: boolean;
  actions?: ReactNode;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ReceiptPreview({
  order,
  loading,
  actions,
  className,
  emptyTitle = "Select a receipt",
  emptyDescription = "Choose an order to inspect its line items and open the printable PDF.",
}: ReceiptPreviewProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "glass-surface panel-noise rounded-[32px] p-6",
          className,
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-28 rounded-full bg-cream-200" />
          <div className="h-10 w-44 rounded-2xl bg-cream-200" />
          <div className="space-y-3 rounded-[26px] border border-cream-200 bg-cream-50 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="h-3 w-32 rounded-full bg-cream-200" />
                <div className="h-3 w-14 rounded-full bg-cream-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className={cn(
          "glass-surface panel-noise rounded-[32px] border-dashed border-cream-300 px-6 py-12 text-center",
          className,
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-ink-500">
          Receipt Preview
        </p>
        <h3 className="mt-3 text-2xl font-serif text-ink-900">{emptyTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">{emptyDescription}</p>
      </div>
    );
  }

  const items = order.items ?? [];

  return (
      <div
        className={cn(
          "glass-surface panel-noise rounded-[32px] p-6",
          className,
        )}
      >
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full bg-clay-100/50 blur-3xl animate-float-slow"
      />
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-cream-300 pb-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-clay-600">
            Autobody
          </p>
          <h3 className="mt-2 text-2xl font-serif text-ink-900">Receipt #{order.id}</h3>
          <p className="mt-1 text-sm text-ink-600">
            {formatDate(order.createdAt, true)} / {formatOrderSource(order.source)} / {order.status}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      <div className="liquid-pill mt-5 rounded-[30px] border border-cream-200 bg-[linear-gradient(180deg,#fffdfa_0%,#fbf7f1_100%)] p-5">
        <div className="grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink-500">Customer</p>
            <p className="mt-1 font-medium text-ink-900">{order.customerName ?? "Walk-in"}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink-500">Handled</p>
            <p className="mt-1 font-medium text-ink-900">
              Order source: {formatOrderSource(order.source)}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-dashed border-cream-200 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{item.partName}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {item.partSku} / Qty {item.qty} / {formatMoney(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums text-ink-900">
                  {formatMoney(item.lineTotal)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-600">Line items are not available for this record.</p>
          )}
        </div>

        <div className="mt-6 space-y-2 border-t border-dashed border-cream-300 pt-4 text-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-ink-600">
            <span>Discount</span>
            <span className="tabular-nums">{formatMoney(order.discount)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-base font-semibold text-ink-900">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(order.total)}</span>
          </div>
        </div>

        {order.notes ? (
          <div className="liquid-pill mt-5 rounded-[24px] border border-cream-200 bg-white/85 px-4 py-3 text-sm text-ink-600">
            {order.notes}
          </div>
        ) : null}
      </div>
    </div>
  );
}
