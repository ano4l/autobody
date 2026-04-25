"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, TrendingUp, MessageCircle, AlertTriangle, Package, Loader2,
} from "lucide-react";
import { getDashboardStats, getRecentOrders } from "@/lib/dashboard-autobody-seed";
import type { Order, DashboardStats } from "@/lib/dashboard-autobody-seed";
import type { Section } from "../types";

interface OverviewProps {
  onNavigate: (section: Section) => void;
}

const statusColors: Record<string, string> = {
  PENDING: "text-warning",
  CONFIRMED: "text-chart-1",
  FULFILLED: "text-success",
  CANCELLED: "text-destructive",
  REFUNDED: "text-muted-foreground",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OverviewSection({ onNavigate }: OverviewProps) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, orders] = await Promise.all([getDashboardStats(), getRecentOrders(5)]);
      setData(dash);
      setRecent(orders);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Today's Sales", value: `ZAR ${(data?.todaySalesTotal ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-chart-2" },
          { title: "Pending Orders", value: String(data?.pendingOrderCount ?? 0), icon: ShoppingCart, color: "text-warning" },
          { title: "Open Conversations", value: String(data?.openConversationCount ?? 0), icon: MessageCircle, color: "text-chart-1" },
          { title: "Low Stock Items", value: String(data?.lowStockCount ?? 0), icon: Package, color: "text-destructive" },
        ].map((m, i) => (
          <div
            key={m.title}
            className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">{m.title}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Recent Orders</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Order #{r.id} {r.customerName ? `– ${r.customerName}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.items.slice(0, 2).join(", ")}{r.items.length > 2 ? " +" + (r.items.length - 2) + " more" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ZAR {r.total.toLocaleString("en", { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs font-medium capitalize ${statusColors[r.status] ?? "text-muted-foreground"}`}>
                        {r.status.replace(/_/g, " ")} · {r.source.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Open POS Terminal", icon: ShoppingCart, color: "text-chart-2", action: () => onNavigate("pos") },
                { label: "Manage Inventory", icon: Package, color: "text-chart-1", action: () => onNavigate("inventory") },
                { label: `Pending Orders (${data?.pendingOrderCount ?? 0})`, icon: ShoppingCart, color: "text-warning", action: () => onNavigate("orders") },
                { label: `Conversations (${data?.openConversationCount ?? 0})`, icon: MessageCircle, color: "text-chart-1", action: () => onNavigate("conversations") },
                { label: `Escalations (${data?.escalatedConversationCount ?? 0})`, icon: AlertTriangle, color: "text-destructive", action: () => onNavigate("escalations") },
                { label: "View Reports", icon: TrendingUp, color: "text-muted-foreground", action: () => onNavigate("reports") },
                { label: "Broadcast Deal", icon: MessageCircle, color: "text-success", action: () => onNavigate("broadcast") },
                { label: `Low Stock (${data?.lowStockCount ?? 0})`, icon: AlertTriangle, color: "text-destructive", action: () => onNavigate("inventory") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
