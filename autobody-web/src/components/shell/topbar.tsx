"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconClock, IconLogout, IconSearch, IconSpark } from "@/components/ui/icons";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  SALESPERSON: "Salesperson",
  WAREHOUSE: "Warehouse",
  VIEW_ONLY: "View only",
};

export function Topbar({ title, description }: { title: string; description?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 md:px-6 lg:px-8">
      <div className="glass-surface panel-noise rounded-[30px] px-5 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate font-serif text-display-sm font-medium text-ink-900">{title}</h1>
              <span className="liquid-pill inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/76 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.26em] text-ink-600">
                <IconClock className="h-3.5 w-3.5" />
                {today}
              </span>
              <span className="liquid-pill hidden items-center gap-2 rounded-full border border-white/80 bg-white/76 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.26em] text-clay-600 sm:inline-flex">
                <IconSpark className="h-3.5 w-3.5" />
                Live sync
              </span>
            </div>
            {description ? <p className="mt-1 truncate text-sm text-ink-600">{description}</p> : null}
          </div>

          <div className="relative hidden w-full max-w-sm flex-1 lg:flex">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              placeholder="Search part, order, or customer"
              className="liquid-pill h-12 w-full rounded-[22px] border border-white/80 bg-white/78 pl-11 pr-4 text-sm text-ink-800 placeholder:text-ink-500 focus:border-clay-500 focus:bg-white"
            />
          </div>

          {user ? (
            <div className="liquid-pill flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/76 px-3 py-2">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-sm font-medium text-ink-900">{user.name || user.email}</p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-ink-500">
                  {roleLabel[user.role] ?? user.role}
                </p>
              </div>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-ink-900 text-xs font-semibold text-cream-100"
                aria-hidden
              >
                {initials(user.name || user.email)}
              </span>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
