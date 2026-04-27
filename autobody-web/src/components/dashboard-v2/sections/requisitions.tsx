"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, Plus, Search, Loader2, RefreshCw, X } from "lucide-react";
import { getOrders } from "@/lib/dashboard-service";
import type { Order } from "@/lib/dashboard-service";
import { toast } from "@/lib/toast";
import { describeApiError, isAuthError } from "@/lib/api";
import { redirectToLogin } from "@/lib/auth";
import { ErrorState } from "@/components/ui/error-state";

const BRANCH_OPTIONS = ["Pretoria", "Johannesburg", "Cape Town", "Durban"];
const SOURCE_OPTIONS: Order["source"][] = ["WALK_IN", "WHATSAPP", "SHOPIFY", "WEB"];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "text-warning", bg: "bg-warning/10", label: "Pending" },
  CONFIRMED: { color: "text-chart-1", bg: "bg-chart-1/10", label: "Confirmed" },
  FULFILLED: { color: "text-success", bg: "bg-success/10", label: "Fulfilled" },
  CANCELLED: { color: "text-destructive", bg: "bg-destructive/10", label: "Cancelled" },
  REFUNDED: { color: "text-muted-foreground", bg: "bg-muted/50", label: "Refunded" },
};

const STATUSES = ["all", "PENDING", "CONFIRMED", "FULFILLED", "CANCELLED", "REFUNDED"];

type DraftOrder = {
  customerName: string;
  branch: string;
  source: Order["source"];
  total: string;
  items: string;
};

const BLANK_DRAFT: DraftOrder = {
  customerName: "",
  branch: BRANCH_OPTIONS[0],
  source: "WALK_IN",
  total: "",
  items: "",
};

export function RequisitionsSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<DraftOrder>(BLANK_DRAFT);
  const [creating, setCreating] = useState(false);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders(statusFilter === "all" ? undefined : statusFilter, page);
      setOrders(res.data ?? []);
      setLastPage(res.last_page ?? 1);
    } catch (err) {
      if (isAuthError(err)) {
        redirectToLogin();
        return;
      }
      setError(describeApiError(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  const closeNew = useCallback(() => {
    setShowNew(false);
    setDraft(BLANK_DRAFT);
    setCreating(false);
  }, []);

  const submitNew = useCallback(async () => {
    const total = Number.parseFloat(draft.total);
    if (!draft.customerName.trim()) {
      toast.error("Customer required", "Add a customer name or company before saving.");
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      toast.error("Invalid total", "Enter the order total in ZAR (e.g. 1850).");
      return;
    }
    const items = draft.items
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (items.length === 0) {
      toast.error("Items required", "Add at least one part on its own line.");
      return;
    }
    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 380));
    const order: Order = {
      id: Math.floor(Date.now() / 1000) % 100000,
      customerName: draft.customerName.trim(),
      branch: draft.branch,
      source: draft.source,
      status: "PENDING",
      total,
      items,
      createdAt: new Date().toISOString(),
    };
    setLocalOrders((prev) => [order, ...prev]);
    toast.success("Order created", `#${order.id} for ${order.customerName} (ZAR ${total.toLocaleString("en", { minimumFractionDigits: 2 })}).`);
    closeNew();
  }, [draft, closeNew]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!showNew) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !creating) closeNew();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNew, creating, closeNew]);

  const merged = [
    ...localOrders.filter((entry) =>
      statusFilter === "all" ? true : entry.status === statusFilter,
    ),
    ...orders,
  ];
  const filtered = search
    ? merged.filter(
        (o) =>
          String(o.id).includes(search) ||
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.items.some((it) => it.toLowerCase().includes(search.toLowerCase())),
      )
    : merged;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <FileText className="h-4 w-4" />
            Ferreira&apos;s Orders
          </div>
          <h2 className="mt-1 text-xl font-semibold text-foreground">All Orders</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage sales orders across all channels and branches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, customer, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : statusConfig[s]?.label ?? s}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} variant="inline" />
      ) : null}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Branch</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order, index) => {
                  const sc = statusConfig[order.status] ?? {
                    color: "text-muted-foreground",
                    bg: "bg-muted/50",
                    label: order.status,
                  };
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-secondary/30 transition-colors cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">#{order.id}</td>
                      <td className="px-4 py-3 text-foreground">{order.customerName ?? "Walk-in"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.branch}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {order.items.slice(0, 2).join(", ")}{order.items.length > 2 ? ` +${order.items.length - 2}` : ""}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        ZAR {order.total.toLocaleString("en", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                            sc.bg,
                            sc.color,
                          )}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fmtDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <AnimatePresence>
        {showNew ? (
          <motion.div
            key="new-order-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 px-4 py-8 backdrop-blur-sm"
            onClick={() => (creating ? null : closeNew())}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-order-title"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Create order
                  </p>
                  <h3 id="new-order-title" className="mt-1 text-lg font-semibold text-foreground">
                    New sales order
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Lands in the queue as PENDING. POS receipts can convert it to FULFILLED.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeNew}
                  disabled={creating}
                  className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  aria-label="Close new order"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <label className="sm:col-span-2 space-y-1.5 text-sm">
                  <span className="font-medium">Customer / company</span>
                  <input
                    value={draft.customerName}
                    onChange={(event) => setDraft((current) => ({ ...current, customerName: event.target.value }))}
                    placeholder="Mike's Panel Shop"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Branch</span>
                  <select
                    value={draft.branch}
                    onChange={(event) => setDraft((current) => ({ ...current, branch: event.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  >
                    {BRANCH_OPTIONS.map((branch) => (
                      <option key={branch}>{branch}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Channel</span>
                  <select
                    value={draft.source}
                    onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value as Order["source"] }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  >
                    {SOURCE_OPTIONS.map((source) => (
                      <option key={source} value={source}>{source.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Total (ZAR)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    value={draft.total}
                    onChange={(event) => setDraft((current) => ({ ...current, total: event.target.value }))}
                    placeholder="1850.00"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Items <span className="text-muted-foreground">(one per line)</span></span>
                  <textarea
                    value={draft.items}
                    onChange={(event) => setDraft((current) => ({ ...current, items: event.target.value }))}
                    rows={4}
                    placeholder={"Front Bumper (Toyota Hilux)\nHeadlight Assembly LH"}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent"
                  />
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border bg-background/50 p-4">
                <button
                  type="button"
                  onClick={closeNew}
                  disabled={creating}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitNew}
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:opacity-60"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {creating ? "Saving…" : "Create order"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
