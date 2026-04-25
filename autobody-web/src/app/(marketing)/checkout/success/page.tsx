"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { formatZar } from "@/lib/payfast";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-[#6b6f7a]">Finalising…</div>}>
      <CheckoutSuccessBody />
    </Suspense>
  );
}

function CheckoutSuccessBody() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const amount = Number(params.get("amount") ?? "0");
  const method = params.get("method") ?? "payfast";

  const clear = useCart((s) => s.clear);
  const [order, setOrder] = useState<{ name?: string; email?: string; address?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("ferreiras-order");
      if (raw) {
        try {
          setOrder(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
    }
    clear();
  }, [clear]);

  return (
    <section className="bg-[#f4f5f9] py-16">
      <div className="mx-auto max-w-2xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 14 }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50"
          >
            <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <h1 className="mt-6 font-display text-3xl uppercase">Order Confirmed</h1>
          <p className="mt-2 text-sm text-[#6b6f7a]">
            Thanks{order?.name ? `, ${order.name}` : ""} — your payment came through.
          </p>

          <div className="mt-6 grid gap-3 border-y border-[#e8e9ee] py-5 text-sm">
            <Row label="Order reference" value={<span className="font-mono">{ref}</span>} />
            {amount > 0 && <Row label="Amount paid" value={<span className="font-bold text-[#2e4de0]">{formatZar(amount)}</span>} />}
            <Row
              label="Payment method"
              value={method === "payfast" ? "PayFast (test mode)" : method === "eft" ? "Manual EFT" : method}
            />
            {order?.email && <Row label="Confirmation email" value={order.email} />}
            {order?.address && <Row label="Delivery to" value={order.address} />}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
            {[
              { title: "Fitment confirmation", desc: "Our team will WhatsApp you to verify VIN before dispatch." },
              { title: "Tracking", desc: "Courier tracking link goes out by email when stock leaves the workshop." },
              { title: "Need help?", desc: "Reply to your confirmation or call 012 943 7437." },
            ].map((step) => (
              <div key={step.title} className="border-l-2 border-[#2e4de0] bg-[#f4f5f9] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em]">{step.title}</p>
                <p className="mt-2 text-xs leading-5 text-[#6b6f7a]">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-[#0d1016] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#2e4de0] transition"
            >
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="border border-[#0d1016] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d1016] hover:bg-[#0d1016] hover:text-white transition"
            >
              Browse More Parts
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b6f7a]">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
