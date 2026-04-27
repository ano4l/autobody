"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReports } from "@/lib/dashboard-service";
import type { ReportsPayload } from "@/lib/dashboard-service";
import { inventoryItems } from "@/lib/autobody-ops-demo-data";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

function fmt(s: string) {
  return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? s;
}

export function ReportsSection() {
  const [data, setData] = useState<ReportsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReports();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const byBranch = data.byBranch.map((b) => ({
    branch: b.branch,
    count: b.orders,
    revenue: b.revenue,
  }));
  const bySource = data.bySource.map((s) => ({
    name: fmt(s.source),
    value: s.count,
  }));
  const overTime = data.byMonth.map((m) => ({
    month: m.month,
    orders: m.orders,
    revenue: m.revenue,
  }));
  const topMoving = [...inventoryItems].sort((a, b) => b.monthlySales - a.monthlySales).slice(0, 4);
  const deadStock = inventoryItems.filter((item) => item.monthlySales < 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Ferreira&apos;s Analytics
          </div>
          <h2 className="mt-1 text-xl font-semibold text-foreground">Reports &amp; Analytics</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sales and order insights across all branches and channels.
          </p>
        </div>
        <button
          onClick={load}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: String(data.totalOrders), caption: "All time across branches" },
          { label: "Total Revenue", value: `R ${data.totalRevenue.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`, caption: "ZAR recognised revenue" },
          { label: "Avg Order Value", value: `R ${data.averageOrderValue.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`, caption: "Per transaction" },
          { label: "Fulfillment Rate", value: `${data.fulfillmentRate}%`, caption: "Orders shipped on time" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.caption}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Revenue by Branch</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }} />
                <Bar dataKey="revenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Orders by Source</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bySource} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={3}>
                  {bySource.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {bySource.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-4">Orders Over Time</h3>
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }} />
              <Line type="monotone" dataKey="orders" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)", r: 4 }} name="Orders" />
              <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)", r: 4 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Top-Moving Parts</h3>
          <div className="space-y-3">
            {topMoving.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/60 p-3 text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">{item.monthlySales}/mo</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Dead Stock Watch</h3>
          <div className="space-y-3">
            {deadStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/60 p-3 text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">{item.stock} units</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Gross Margin Per Item</h3>
          <div className="space-y-3">
            {inventoryItems.slice(0, 4).map((item) => {
              const margin = Math.round(((item.price - item.cost) / item.price) * 100);
              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/60 p-3 text-sm">
                  <span className="font-medium">{item.sku}</span>
                  <span className="font-semibold text-success">{margin}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
