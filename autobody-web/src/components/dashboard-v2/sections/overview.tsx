"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Package,
  ReceiptText,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { getDashboardStats, getRecentOrders } from "@/lib/dashboard-service";
import { inventoryItems, suppliers } from "@/lib/autobody-ops-demo-data";
import type { DashboardStats, Order } from "@/lib/dashboard-service";
import { describeApiError, isAuthError } from "@/lib/api";
import { redirectToLogin } from "@/lib/auth";
import type { Section } from "../types";
import { cn } from "@/lib/utils";

interface OverviewProps {
  onNavigate: (section: Section) => void;
}

const statusTone: Record<string, "amber" | "clay" | "leaf" | "rust" | "neutral"> = {
  PENDING: "amber",
  CONFIRMED: "clay",
  FULFILLED: "leaf",
  CANCELLED: "rust",
  REFUNDED: "neutral",
};

const branchPerformance = [
  { branch: "Pretoria", sales: 68240, orders: 32, fulfilment: 94 },
  { branch: "Johannesburg", sales: 47180, orders: 21, fulfilment: 91 },
  { branch: "Online / WhatsApp", sales: 38950, orders: 28, fulfilment: 88 },
];

const operationalQueue = [
  { label: "Orders awaiting picking", value: 12, tone: "amber" as const, owner: "Fulfilment" },
  { label: "WhatsApp conversations open", value: 23, tone: "clay" as const, owner: "Sales desk" },
  { label: "Escalated customer threads", value: 3, tone: "rust" as const, owner: "Manager" },
  { label: "Supplier purchase orders", value: 6, tone: "neutral" as const, owner: "Procurement" },
];

const channelMix = [
  { source: "Walk-in POS", value: 42, amount: 54400 },
  { source: "WhatsApp", value: 31, amount: 40150 },
  { source: "Website", value: 18, amount: 23300 },
  { source: "Trade accounts", value: 9, amount: 11650 },
];

const riskRegister = [
  { title: "VW Polo headlights below reorder", detail: "3 units available against 31 monthly sales", severity: "High" },
  { title: "Mercedes grille single unit remaining", detail: "Prestige German Parts lead time is 5 days", severity: "Medium" },
  { title: "Three escalations need takeover", detail: "Bot confidence below threshold on fitment questions", severity: "High" },
];

function money(value: number) {
  return `R ${value.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

function timeAgo(date: string) {
  const hours = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 3_600_000));
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export function OverviewSection({ onNavigate }: OverviewProps) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, orders] = await Promise.all([getDashboardStats(), getRecentOrders(8)]);
      setData(dash);
      setRecent(orders);
    } catch (err) {
      if (isAuthError(err)) {
        redirectToLogin();
        return;
      }
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const inventorySummary = useMemo(() => {
    const value = inventoryItems.reduce((sum, item) => sum + item.stock * item.cost, 0);
    const low = inventoryItems.filter((item) => item.stock <= item.reorderAt);
    const units = inventoryItems.reduce((sum, item) => sum + item.stock, 0);
    const grossMargin = inventoryItems.reduce((sum, item) => sum + (item.price - item.cost) * item.stock, 0);
    return { value, low, units, grossMargin };
  }, []);

  const todaySales = data?.todaySalesTotal ?? 0;
  const avgOrderValue = recent.length > 0 ? recent.reduce((sum, order) => sum + order.total, 0) / recent.length : 0;

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-xl border border-border bg-card">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Commercial command centre
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Ferreira&apos;s Operating Overview</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Live operating summary across POS sales, ecommerce orders, WhatsApp demand, stock risk, supplier activity, and fulfilment.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button className="rounded-lg" onClick={() => onNavigate("pos")}>
              <ReceiptText className="h-4 w-4" />
              Open POS
            </Button>
            <Button variant="outline" className="rounded-lg" onClick={() => onNavigate("inventory")}>
              <Boxes className="h-4 w-4" />
              Stock Control
            </Button>
            <Button variant="outline" className="rounded-lg" onClick={() => onNavigate("reports")}>
              <TrendingUp className="h-4 w-4" />
              Reports
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            { title: "Today sales", value: money(todaySales), caption: `${data?.todayOrderCount ?? 0} transactions`, icon: WalletCards, tone: "text-success" },
            { title: "Open order book", value: String(data?.pendingOrderCount ?? 0), caption: "Pending or confirmed", icon: ShoppingCart, tone: "text-warning" },
            { title: "Inventory held", value: money(inventorySummary.value), caption: `${inventorySummary.units} units in stock`, icon: Package, tone: "text-chart-1" },
            { title: "Stock risk", value: String(inventorySummary.low.length), caption: "Below reorder point", icon: AlertTriangle, tone: "text-destructive" },
            { title: "Gross margin held", value: money(inventorySummary.grossMargin), caption: "Current inventory margin", icon: TrendingUp, tone: "text-success" },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.title}
                className="rounded-xl border border-border bg-background p-4 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{metric.title}</p>
                  <Icon className={cn("h-4 w-4", metric.tone)} />
                </div>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.caption}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="font-semibold">Revenue and Fulfilment Pipeline</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Sales performance by branch and active fulfilment signal.</p>
            </div>
            <Badge tone="leaf" dot>Live day</Badge>
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              {branchPerformance.map((row) => (
                <div key={row.branch} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{row.branch}</p>
                      <p className="text-xs text-muted-foreground">{row.orders} orders today</p>
                    </div>
                    <p className="font-semibold">{money(row.sales)}</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${row.fulfilment}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{row.fulfilment}% fulfilment readiness</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="text-sm font-semibold">Channel Mix</h4>
              <div className="mt-4 space-y-4">
                {channelMix.map((row) => (
                  <div key={row.source}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{row.source}</span>
                      <span>{money(row.amount)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-foreground" style={{ width: `${row.value}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{row.value}% of demand</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Executive Queue</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Work that needs attention now.</p>
            </div>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 space-y-3">
            {operationalQueue.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.label.includes("conversation") || item.label.includes("Escalated") ? "conversations" : item.label.includes("Supplier") ? "suppliers" : "orders")}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 text-left transition hover:bg-secondary/50"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                </div>
                <Badge tone={item.tone}>{item.value}</Badge>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="font-semibold">Recent Commercial Activity</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Latest orders across POS, WhatsApp, and web channels.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("orders")}>
              View orders
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/35">
                    <td className="px-4 py-4">
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName ?? "Walk-in customer"} - {timeAgo(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-[280px] truncate">{order.items.slice(0, 2).join(", ")}</p>
                      <p className="text-xs text-muted-foreground">{order.branch} branch</p>
                    </td>
                    <td className="px-4 py-4">{order.source.replace(/_/g, " ")}</td>
                    <td className="px-4 py-4">
                      <Badge tone={statusTone[order.status] ?? "neutral"}>{order.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <h3 className="font-semibold">Risk Register</h3>
            </div>
            <div className="mt-4 space-y-3">
              {riskRegister.map((risk) => (
                <div key={risk.title} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{risk.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{risk.detail}</p>
                    </div>
                    <Badge tone={risk.severity === "High" ? "rust" : "amber"}>{risk.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <h3 className="font-semibold">Supplier Snapshot</h3>
            </div>
            <div className="mt-4 space-y-3">
              {suppliers.map((supplier) => (
                <div key={supplier.name} className="flex items-center justify-between rounded-lg bg-background p-3">
                  <div>
                    <p className="text-sm font-medium">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">{supplier.openOrders} open POs - {supplier.leadTime}</p>
                  </div>
                  <Badge tone="leaf">{supplier.reliability}</Badge>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "POS terminal", icon: ShoppingCart, target: "pos" as Section, detail: "Walk-in sales and receipts" },
          { label: "Inventory control", icon: Boxes, target: "inventory" as Section, detail: "Stock, reorders, item master" },
          { label: "WhatsApp inbox", icon: MessageCircle, target: "conversations" as Section, detail: "Bot handover and quotes" },
          { label: "Sales reports", icon: CheckCircle2, target: "reports" as Section, detail: `AOV ${money(avgOrderValue)}` },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} onClick={() => onNavigate(action.target)} className="rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-3 font-semibold">{action.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{action.detail}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
