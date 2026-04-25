"use client";

import { useState, useEffect, useCallback, Suspense, type ElementType } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-v2/sidebar";
import { DashboardHeader } from "@/components/dashboard-v2/header";
import { OverviewSection } from "@/components/dashboard-v2/sections/overview";
import { InventorySection } from "@/components/dashboard-v2/sections/inventory";
import { PosSection } from "@/components/dashboard-v2/sections/pos";
import { RequisitionsSection as OrdersSection } from "@/components/dashboard-v2/sections/requisitions";
import { ApprovalsSection as ConversationsSection } from "@/components/dashboard-v2/sections/approvals";
import { EscalationsSection } from "@/components/dashboard-v2/sections/escalations";
import { SuppliersSection } from "@/components/dashboard-v2/sections/suppliers";
import { BroadcastSection } from "@/components/dashboard-v2/sections/broadcast";
import { ReviewsSection } from "@/components/dashboard-v2/sections/reviews";
import { ReportsSection } from "@/components/dashboard-v2/sections/reports";
import { AuditSection } from "@/components/dashboard-v2/sections/audit";
import { NotificationsSection } from "@/components/dashboard-v2/sections/notifications";
import { FaqSection } from "@/components/dashboard-v2/sections/faq";
import { SettingsSection } from "@/components/dashboard-v2/sections/settings";
import type { Section } from "@/components/dashboard-v2/types";
import { clearSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard-autobody-seed";
import { BarChart3, Boxes, LayoutDashboard, MessageCircle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const VALID: Section[] = [
  "overview", "inventory", "pos", "orders", "conversations", "escalations", "suppliers", "broadcast", "reviews", "reports",
  "audit", "notifications", "faq", "settings",
];

const MOBILE_NAV: Array<{ id: Section; label: string; icon: ElementType }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Stock", icon: Boxes },
  { id: "pos", label: "POS", icon: ShoppingCart },
  { id: "conversations", label: "Inbox", icon: MessageCircle },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-background"><p className="text-sm text-muted-foreground">Loading workspace...</p></div>}>
      <DashboardShell />
    </Suspense>
  );
}

function DashboardShell() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("section") as Section | null) ?? "overview";

  const [activeSection, setActiveSection] = useState<Section>(
    VALID.includes(initial) ? initial : "overview",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Hydrate dark-mode state from existing class (set by inline script in root layout if present)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const saved = localStorage.getItem("ab_theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      } else {
        setDarkMode(document.documentElement.classList.contains("dark"));
      }
    }
  }, []);

  // Sync sidebar badge with open conversation count
  useEffect(() => {
    let mounted = true;
    getDashboardStats().then((d) => {
      if (mounted) setPendingCount(d.openConversationCount + d.escalatedConversationCount);
    });
    return () => {
      mounted = false;
    };
  }, [activeSection]);

  // Reflect section in URL so it's deep-linkable
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeSection === "overview") url.searchParams.delete("section");
    else url.searchParams.set("section", activeSection);
    window.history.replaceState({}, "", url.toString());
  }, [activeSection]);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ab_theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection onNavigate={setActiveSection} />;
      case "inventory":
        return <InventorySection />;
      case "pos":
        return <PosSection />;
      case "orders":
        return <OrdersSection />;
      case "conversations":
        return <ConversationsSection />;
      case "escalations":
        return <EscalationsSection />;
      case "suppliers":
        return <SuppliersSection />;
      case "broadcast":
        return <BroadcastSection />;
      case "reviews":
        return <ReviewsSection />;
      case "reports":
        return <ReportsSection />;
      case "audit":
        return <AuditSection />;
      case "notifications":
        return <NotificationsSection />;
      case "faq":
        return <FaqSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <OverviewSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-clip bg-background">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-out ${
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        }`}
      >
        <DashboardHeader
          activeSection={activeSection}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <main className="min-w-0 flex-1 overflow-x-clip p-4 pb-24 md:p-6 md:pb-6">
          <div
            key={activeSection}
            className="animate-in fade-in duration-300 md:slide-in-from-bottom-4 md:duration-500"
          >
            {renderSection()}
          </div>
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-18px_44px_-30px_rgba(0,0,0,0.35)] backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition",
                    active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-accent")} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
