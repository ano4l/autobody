"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart, useCartTotals } from "@/lib/cart-store";
import { formatZar, newOrderRef } from "@/lib/payfast";
import { Reveal } from "@/components/marketing/reveal";

type DeliveryMethod = "pickup" | "courier";
type PaymentMethod = "payfast" | "eft";

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const totals = useCartTotals();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [notes, setNotes] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("courier");
  const [payment, setPayment] = useState<PaymentMethod>("payfast");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lines.length === 0) {
      router.replace("/cart");
    }
  }, [lines.length, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ref = newOrderRef();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "ferreiras-order",
        JSON.stringify({
          ref,
          name,
          email,
          phone,
          address: `${address}, ${city} ${postal}`.trim(),
          delivery,
          notes,
          total: totals.total,
        }),
      );
    }
    if (payment === "payfast") {
      router.push(`/checkout/payfast?ref=${encodeURIComponent(ref)}&amount=${totals.total}`);
    } else {
      router.push(`/checkout/success?ref=${encodeURIComponent(ref)}&method=eft`);
    }
  };

  return (
    <>
      <section className="bg-[#0d1016] py-10 text-white">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/55">Checkout</p>
            <h1 className="mt-2 font-display text-4xl uppercase">Finalise Order</h1>
            <ol className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em]">
              <li className="text-white/45">
                <Link href="/cart" className="hover:text-white">1. Cart</Link>
              </li>
              <li className="text-white/30">→</li>
              <li className="text-white">2. Details</li>
              <li className="text-white/30">→</li>
              <li className="text-white/45">3. Payment</li>
              <li className="text-white/30">→</li>
              <li className="text-white/45">4. Done</li>
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f4f5f9] py-10">
        <form
          onSubmit={onSubmit}
          className="mx-auto grid max-w-[1400px] gap-8 px-5 lg:grid-cols-[1fr_380px] lg:px-8"
        >
          <Reveal>
            <div className="space-y-6 bg-white p-6">
              {/* Contact */}
              <div>
                <h2 className="font-display text-xl uppercase">Contact</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Full name">
                    <input value={name} onChange={(e) => setName(e.target.value)} required className="checkout-input" />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="checkout-input"
                    />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="checkout-input"
                    />
                  </Field>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h2 className="font-display text-xl uppercase">Delivery</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "courier" as DeliveryMethod,
                      title: "Courier delivery",
                      desc: "2-5 business days nationwide",
                      meta: totals.subtotal > 2500 ? "Free over R2 500" : "R120",
                    },
                    {
                      key: "pickup" as DeliveryMethod,
                      title: "In-store pickup",
                      desc: "Pretoria, Gauteng workshop",
                      meta: "Free",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={`cursor-pointer border p-4 transition ${
                        delivery === opt.key ? "border-[#2e4de0] bg-[#2e4de0]/5" : "border-[#dedede]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <input
                            type="radio"
                            name="delivery"
                            value={opt.key}
                            checked={delivery === opt.key}
                            onChange={() => setDelivery(opt.key)}
                            className="hidden"
                          />
                          <p className="text-sm font-semibold">{opt.title}</p>
                          <p className="mt-1 text-xs text-[#6b6f7a]">{opt.desc}</p>
                        </div>
                        <span className="text-xs font-semibold text-[#2e4de0]">{opt.meta}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {delivery === "courier" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field label="Street address" wide>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} required className="checkout-input" />
                    </Field>
                    <Field label="City">
                      <input value={city} onChange={(e) => setCity(e.target.value)} required className="checkout-input" />
                    </Field>
                    <Field label="Postal code">
                      <input value={postal} onChange={(e) => setPostal(e.target.value)} required className="checkout-input" />
                    </Field>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <h2 className="font-display text-xl uppercase">Order notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="VIN, fitment notes, side preference, etc."
                  className="mt-3 checkout-input"
                />
              </div>

              {/* Payment */}
              <div>
                <h2 className="font-display text-xl uppercase">Payment</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "payfast" as PaymentMethod,
                      title: "PayFast",
                      desc: "Card, Instant EFT, Zapper",
                      tag: "Recommended",
                    },
                    {
                      key: "eft" as PaymentMethod,
                      title: "Manual EFT",
                      desc: "Bank transfer with reference",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={`cursor-pointer border p-4 transition ${
                        payment === opt.key ? "border-[#2e4de0] bg-[#2e4de0]/5" : "border-[#dedede]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.key}
                        checked={payment === opt.key}
                        onChange={() => setPayment(opt.key)}
                        className="hidden"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{opt.title}</p>
                          <p className="mt-1 text-xs text-[#6b6f7a]">{opt.desc}</p>
                        </div>
                        {"tag" in opt && opt.tag && (
                          <span className="bg-[#2e4de0] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            {opt.tag}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Summary */}
          <Reveal variant="slideRight">
            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <div className="bg-white p-5">
                <h3 className="font-display text-xl uppercase">Order Summary</h3>
                <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto border-t border-[#e8e9ee] pt-4">
                  {lines.map((line) => (
                    <li key={line.slug} className="flex items-center gap-3 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={line.image} alt="" className="h-12 w-12 object-cover" />
                      <div className="flex-1">
                        <p className="line-clamp-2 text-xs font-medium">{line.name}</p>
                        <p className="text-[11px] text-[#6b6f7a]">x{line.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-[#2e4de0]">
                        {formatZar(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2 border-t border-[#e8e9ee] pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b6f7a]">Subtotal</span>
                    <span className="font-semibold">{formatZar(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex items-center justify-between text-[#2e4de0]">
                      <span>Discount</span>
                      <span>-{formatZar(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b6f7a]">Delivery</span>
                    <span className="font-semibold">
                      {delivery === "pickup" ? "Free" : totals.shipping === 0 ? "Free" : formatZar(totals.shipping)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#e8e9ee] pt-3">
                  <span className="text-sm font-semibold uppercase tracking-[0.16em]">Total</span>
                  <span className="font-display text-2xl">{formatZar(totals.total - (delivery === "pickup" ? totals.shipping : 0))}</span>
                </div>
                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full bg-[#2e4de0] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3a5cf0] disabled:opacity-60"
                >
                  {submitting ? "Processing…" : payment === "payfast" ? "Pay With PayFast" : "Submit Order"}
                </motion.button>
                <p className="mt-3 text-center text-[11px] text-[#9ea2ab]">
                  Demo store — no real payment is captured.
                </p>
              </div>
            </aside>
          </Reveal>
        </form>
      </section>

      <style jsx global>{`
        .checkout-input {
          width: 100%;
          height: 2.75rem;
          border: 1px solid #dedede;
          background: white;
          padding: 0 0.75rem;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .checkout-input:focus {
          border-color: #2e4de0;
        }
        textarea.checkout-input {
          height: auto;
          padding: 0.625rem 0.75rem;
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b6f7a]">
        {label}
      </span>
      {children}
    </label>
  );
}
