"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useCartTotals } from "@/lib/cart-store";
import { formatZar } from "@/lib/payfast";
import { Reveal } from "@/components/marketing/reveal";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const setPromoCode = useCart((s) => s.setPromoCode);
  const totals = useCartTotals();

  const [code, setCode] = useState(totals.promoCode ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);

  const applyPromo = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === "FERREIRA10") {
      setPromoCode(trimmed);
      setFeedback("10% promo applied.");
    } else if (trimmed === "") {
      setPromoCode(null);
      setFeedback(null);
    } else {
      setPromoCode(null);
      setFeedback("That code isn't valid. Try FERREIRA10.");
    }
  };

  return (
    <>
      <section className="bg-[#0d1016] py-10 text-white">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/55">Cart</p>
            <h1 className="mt-2 font-display text-4xl uppercase">Your Cart</h1>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/45">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Cart</span>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f4f5f9] py-10">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          {lines.length === 0 ? (
            <Reveal>
              <div className="grid place-items-center bg-white py-20 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#f4f5f9]">
                  <svg className="h-8 w-8 text-[#9ea2ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="mt-4 font-display text-2xl uppercase">Cart is empty</h2>
                <p className="mt-2 text-sm text-[#6b6f7a]">
                  Browse the catalog and start adding parts.
                </p>
                <Link
                  href="/shop"
                  className="mt-5 bg-[#ef3434] px-8 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#f04444]"
                >
                  Browse Shop
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <Reveal>
                <div className="bg-white">
                  <div className="hidden border-b border-[#e8e9ee] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b6f7a] sm:grid sm:grid-cols-[1fr_120px_120px_60px]">
                    <span>Product</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Subtotal</span>
                    <span />
                  </div>
                  <ul className="divide-y divide-[#e8e9ee]">
                    <AnimatePresence initial={false}>
                      {lines.map((line) => (
                        <motion.li
                          key={line.slug}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_120px_120px_60px] sm:items-center"
                        >
                          <div className="flex gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={line.image} alt={line.name} className="h-20 w-20 object-cover" />
                            <div>
                              <Link
                                href={`/shop/${line.slug}`}
                                className="line-clamp-2 text-sm font-semibold hover:text-[#ef3434]"
                              >
                                {line.name}
                              </Link>
                              <p className="mt-1 text-xs text-[#6b6f7a]">
                                {line.brand} / {line.model}
                              </p>
                              <p className="mt-1 text-sm font-bold text-[#ef3434] sm:hidden">
                                {formatZar(line.price * line.quantity)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-start sm:justify-center">
                            <div className="flex items-center border border-[#dedede]">
                              <button
                                onClick={() => setQuantity(line.slug, line.quantity - 1)}
                                className="grid h-9 w-9 place-items-center hover:bg-[#f4f5f9]"
                              >
                                -
                              </button>
                              <span className="grid h-9 min-w-9 place-items-center text-sm">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => setQuantity(line.slug, line.quantity + 1)}
                                className="grid h-9 w-9 place-items-center hover:bg-[#f4f5f9]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="hidden text-right text-sm font-bold text-[#ef3434] sm:block">
                            {formatZar(line.price * line.quantity)}
                          </div>
                          <button
                            onClick={() => remove(line.slug)}
                            className="text-xs text-[#9ea2ab] hover:text-[#ef3434] justify-self-end"
                            aria-label="Remove"
                          >
                            Remove
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  <div className="border-t border-[#e8e9ee] px-5 py-4">
                    <Link
                      href="/shop"
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ef3434] hover:underline"
                    >
                      ← Continue Shopping
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* Summary */}
              <Reveal variant="slideRight">
                <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
                  <div className="bg-white p-5">
                    <h3 className="font-display text-xl uppercase">Order Summary</h3>
                    <div className="mt-4 space-y-2 border-t border-[#e8e9ee] pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6b6f7a]">Items ({totals.itemCount})</span>
                        <span className="font-semibold">{formatZar(totals.subtotal)}</span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex items-center justify-between text-[#ef3434]">
                          <span>Discount ({totals.promoCode})</span>
                          <span>-{formatZar(totals.discount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#6b6f7a]">Delivery</span>
                        <span className="font-semibold">
                          {totals.shipping === 0 ? "Free" : formatZar(totals.shipping)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6b6f7a]">
                        <span>VAT (15% incl.)</span>
                        <span>{formatZar(totals.vat)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[#e8e9ee] pt-3">
                      <span className="font-semibold uppercase tracking-[0.16em] text-sm">Total</span>
                      <span className="font-display text-2xl text-[#0d1016]">{formatZar(totals.total)}</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/checkout"
                        className="mt-5 block bg-[#ef3434] py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#f04444]"
                      >
                        Proceed to Checkout
                      </Link>
                    </motion.div>
                    <p className="mt-3 text-center text-xs text-[#6b6f7a]">
                      Secure PayFast checkout — card, EFT, or Zapper.
                    </p>
                  </div>

                  <div className="bg-white p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Promo code</h3>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                        className="h-10 flex-1 border border-[#dedede] px-3 text-sm outline-none focus:border-[#ef3434]"
                      />
                      <button
                        onClick={applyPromo}
                        className="h-10 bg-[#0d1016] px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#ef3434]"
                      >
                        Apply
                      </button>
                    </div>
                    {feedback && (
                      <p
                        className={`mt-2 text-xs ${
                          totals.discount > 0 ? "text-[#ef3434]" : "text-rose-600"
                        }`}
                      >
                        {feedback}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-[#9ea2ab]">Try FERREIRA10 for 10% off.</p>
                  </div>
                </aside>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
