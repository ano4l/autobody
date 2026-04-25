"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { commerceNav } from "./navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex">
      {/* Logo area */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            AB
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-lg text-sidebar-foreground">Autobody</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Retail ops</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {commerceNav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {/* Active indicator bar */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-200",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  active ? "text-accent" : "group-hover:scale-110"
                )}
              />
              <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent/80 to-primary flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">
            FS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">Ferreira&apos;s</p>
            <p className="text-[10px] text-muted-foreground truncate">Staff workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
