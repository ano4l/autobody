"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
import { ReportsSection } from "@/components/dashboard-v2/sections/reports";
import { AuditSection } from "@/components/dashboard-v2/sections/audit";
import { NotificationsSection } from "@/components/dashboard-v2/sections/notifications";
import { FaqSection } from "@/components/dashboard-v2/sections/faq";
import { SettingsSection } from "@/components/dashboard-v2/sections/settings";
import type { Section } from "@/components/dashboard-v2/types";
import { clearSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard-autobody-seed";

const VALID: Section[] = [
  "overview", "inventory", "pos", "orders", "conversations", "escalations", "suppliers", "broadcast", "reports",
  "audit", "notifications", "faq", "settings",
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
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
          sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <DashboardHeader
          activeSection={activeSection}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div
            key={activeSection}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
