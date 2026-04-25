"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useCart, useCartTotals } from "@/lib/cart-store";
import { formatZar } from "@/lib/payfast";

export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { subtotal, itemCount } = useCartTotals();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-white text-[#1a1d25] shadow-[0_0_60px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-[#e8e9ee] px-5 py-4">
              <div>
                <h2 className="font-display text-xl uppercase">Your Cart</h2>
                <p className="text-xs text-[#6b6f7a]">{itemCount} item{itemCount === 1 ? "" : "s"}</p>
              </div>
              <button
                onClick={close}
                className="grid h-8 w-8 place-items-center text-[#6b6f7a] hover:text-[#0d1016]"
                aria-label="Close cart"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[#6b6f7a]">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-[#f4f5f9]">
                    <svg className="h-8 w-8 text-[#9ea2ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="mt-4">Your cart is empty.</p>
                  <Link
                    href="/shop"
                    onClick={close}
                    className="mt-4 bg-[#ef3434] px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#f04444]"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.slug}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="grid grid-cols-[72px_1fr] gap-3 border border-[#e8e9ee] p-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={line.image} alt={line.name} className="h-18 w-18 object-cover" />
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="line-clamp-2 text-sm font-semibold">{line.name}</p>
                              <p className="mt-0.5 text-xs text-[#6b6f7a]">{line.brand} {line.model}</p>
                            </div>
                            <button
                              onClick={() => remove(line.slug)}
                              aria-label="Remove item"
                              className="text-xs text-[#9ea2ab] hover:text-[#ef3434]"
                            >
                              ×
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setQuantity(line.slug, line.quantity - 1)}
                                className="grid h-7 w-7 place-items-center border border-[#d7d7d7] text-sm hover:border-[#ef3434]"
                              >
                                -
                              </button>
                              <span className="grid h-7 min-w-7 place-items-center px-2 text-sm">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => setQuantity(line.slug, line.quantity + 1)}
                                className="grid h-7 w-7 place-items-center border border-[#d7d7d7] text-sm hover:border-[#ef3434]"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-bold text-[#ef3434]">
                              {formatZar(line.price * line.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-[#e8e9ee] px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold uppercase tracking-[0.18em] text-[#6b6f7a]">Subtotal</span>
                  <span className="font-display text-lg text-[#0d1016]">{formatZar(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-[#6b6f7a]">Shipping and taxes calculated at checkout.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={close}
                    className="border border-[#0d1016] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0d1016] transition hover:bg-[#0d1016] hover:text-white"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="bg-[#ef3434] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#f04444]"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
