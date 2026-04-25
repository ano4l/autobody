"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileNav } from "./navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 px-4 md:hidden">
      <nav className="dock-surface mx-auto max-w-md rounded-[30px] px-2 py-2">
        <ul className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2.5 text-[11px] font-medium transition-all",
                    active
                      ? "bg-[linear-gradient(180deg,rgba(252,241,236,0.98)_0%,rgba(255,255,255,0.92)_100%)] text-ink-900 shadow-[0_16px_34px_-24px_rgba(201,100,66,0.45)]"
                      : "text-ink-600 hover:bg-white/70 hover:text-ink-900",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-2xl border transition-colors",
                      active
                        ? "border-clay-200 bg-clay-50 text-clay-600"
                        : "border-white/70 bg-white/60 text-ink-500 group-hover:text-clay-500",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
