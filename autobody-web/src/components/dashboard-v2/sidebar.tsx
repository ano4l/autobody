"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Bell,
  HelpCircle,
  Settings,
  Wrench,
  LogOut,
  Megaphone,
  Star,
  ShoppingCart,
  Siren,
  Truck,
} from "lucide-react";
import type { Section } from "./types";

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout?: () => void;
  pendingCount?: number;
}

const navItems: {
  id: Section;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "pos", label: "POS Terminal", icon: ShoppingCart },
  { id: "orders", label: "Orders", icon: FileText },
  { id: "conversations", label: "Conversations", icon: CheckSquare },
  { id: "escalations", label: "Escalations", icon: Siren },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "audit", label: "Audit Trail", icon: ClipboardList },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "faq", label: "Help & FAQ", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onCollapsedChange,
  onLogout,
  pendingCount,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out md:flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0 bg-[#ef3434]">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div
            className={cn(
              "whitespace-nowrap transition-all duration-300 leading-tight",
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto",
            )}
          >
            <div className="font-display text-sm tracking-[0.05em] text-sidebar-foreground">
              Ferreira&apos;s<span className="text-[#ef3434]">.</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-sidebar-foreground/40">Autobody Spares</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const showBadge = item.id === "conversations" && (pendingCount ?? 0) > 0;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  isActive ? "text-accent" : "group-hover:scale-110",
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300 flex-1 text-left",
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                )}
              >
                {item.label}
              </span>
              {showBadge && !collapsed && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">
              --
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                No user selected
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Sign in to load profile
              </p>
            </div>
          </div>
        )}
        <div className="px-3 pb-3 flex items-center gap-2">
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200",
              collapsed ? "w-full" : "flex-1",
            )}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
