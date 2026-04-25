"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-store";

const NAV = [
  { label: "Home", href: "/" as const },
  { label: "Shop", href: "/shop" as const },
  { label: "About Us", href: "/about" as const },
  { label: "Services", href: "/services" as const },
  { label: "Contact", href: "/contact" as const },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCart((s) => s.lines.reduce((t, l) => t + l.quantity, 0));
  const openDrawer = useCart((s) => s.openDrawer);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top contact strip */}
      <div className="bg-[#0d1016] text-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-5 py-2 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>Ferreira&apos;s Autobody Spares / Pretoria, Gauteng</span>
          <span className="flex items-center gap-4">
            <span>Tel 012 943 7437</span>
            <span>WhatsApp 074 194 5672</span>
          </span>
        </div>
      </div>

      {/* Main sticky nav */}
      <header
        className={`sticky top-0 z-50 bg-[#0d1016] text-white transition-all duration-300 ${
          scrolled ? "shadow-[0_12px_32px_-20px_rgba(0,0,0,0.6)] backdrop-blur" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-5 lg:gap-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <motion.span
              whileHover={{ rotate: -6, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="grid h-9 w-9 place-items-center bg-[#2e4de0] font-display text-xs text-white"
            >
              FS
            </motion.span>
            <div className="leading-tight">
              <div className="font-display text-base tracking-[0.04em]">
                Ferreira&apos;s<span className="text-[#2e4de0]">.</span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/85 md:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 transition hover:text-white ${
                    active ? "text-white" : "text-white/70"
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#2e4de0]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <div className="ml-auto hidden flex-1 max-w-md items-center gap-2 rounded-sm bg-white/10 px-3 md:flex">
            <svg
              className="h-4 w-4 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/40 outline-none"
              placeholder="Search items"
            />
          </div>

          <Link
            href="/login"
            className="ml-auto md:ml-0 hidden sm:inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-white hover:text-[#0d1016] transition"
          >
            Sign In
          </Link>

          <button
            onClick={openDrawer}
            className="relative flex items-center gap-2 text-xs text-white/80 hover:text-white transition"
            aria-label="Open cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-[#2e4de0] px-1 text-[10px] font-bold text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden text-white"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-[#0d1016]"
            >
              <div className="flex flex-col gap-1 px-5 py-3">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-sm text-white/80 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm text-[#2e4de0]"
                >
                  Sign In
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
