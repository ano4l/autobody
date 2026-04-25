"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, Loader2, RefreshCw } from "lucide-react";
import { getOrders } from "@/lib/dashboard-autobody-seed";
import type { Order } from "@/lib/dashboard-autobody-seed";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "text-warning", bg: "bg-warning/10", label: "Pending" },
  CONFIRMED: { color: "text-chart-1", bg: "bg-chart-1/10", label: "Confirmed" },
  FULFILLED: { color: "text-success", bg: "bg-success/10", label: "Fulfilled" },
  CANCELLED: { color: "text-destructive", bg: "bg-destructive/10", label: "Cancelled" },
  REFUNDED: { color: "text-muted-foreground", bg: "bg-muted/50", label: "Refunded" },
};

const STATUSES = ["all", "PENDING", "CONFIRMED", "FULFILLED", "CANCELLED", "REFUNDED"];

export function RequisitionsSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders(statusFilter === "all" ? undefined : statusFilter, page);
      setOrders(res.data ?? []);
      setLastPage(res.last_page ?? 1);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search
    ? orders.filter(
        (o) =>
          String(o.id).includes(search) ||
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.items.some((it) => it.toLowerCase().includes(search.toLowerCase())),
      )
    : orders;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">All Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage sales orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => alert("New order form would open here in production.")}
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
    </div>
  );
}
