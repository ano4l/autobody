"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatZar, PAYFAST_SANDBOX_CARD } from "@/lib/payfast";

type Method = "card" | "eft" | "zapper";

const METHODS: { key: Method; label: string; icon: string }[] = [
  { key: "card", label: "Card", icon: "💳" },
  { key: "eft", label: "Instant EFT", icon: "🏦" },
  { key: "zapper", label: "Zapper", icon: "📱" },
];

export default function PayFastSimulationPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-[#6b6f7a]">Loading PayFast…</div>}>
      <PayFastBody />
    </Suspense>
  );
}

function PayFastBody() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref") ?? "FERR-DEMO";
  const amount = Number(params.get("amount") ?? "0");

  const [method, setMethod] = useState<Method>("card");
  const [cardNumber, setCardNumber] = useState(PAYFAST_SANDBOX_CARD.number);
  const [expiry, setExpiry] = useState(PAYFAST_SANDBOX_CARD.expiry);
  const [cvc, setCvc] = useState(PAYFAST_SANDBOX_CARD.cvc);
  const [cardName, setCardName] = useState(PAYFAST_SANDBOX_CARD.name);
  const [processing, setProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      router.push(`/checkout/success?ref=${encodeURIComponent(ref)}&amount=${amount}&method=payfast`);
    }, 2200);
  };

  return (
    <div className="min-h-[80vh] bg-[#f3f5f8] py-8">
      <div className="mx-auto max-w-3xl px-5">
        {/* PayFast brand bar */}
        <div className="overflow-hidden bg-white shadow-[0_18px_38px_-26px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between bg-[#0a2c5b] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center bg-[#ff7a00] font-display text-xs font-bold">
                P
              </div>
              <div>
                <p className="font-display text-lg leading-none">Payfast</p>
                <p className="text-[10px] uppercase tracking-widest text-white/60">
                  Secure checkout
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>SSL Secured</span>
            </div>
          </div>

          {/* Merchant + amount */}
          <div className="grid gap-4 border-b border-[#e8e9ee] px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b6f7a]">Pay to</p>
              <p className="mt-1 font-display text-lg text-[#0a2c5b]">
                Ferreira&apos;s Autobody Spares
              </p>
              <p className="mt-1 text-xs text-[#6b6f7a]">
                Order ref: <span className="font-mono text-[#0a2c5b]">{ref}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b6f7a]">Amount</p>
              <p className="mt-1 font-display text-3xl text-[#0a2c5b]">{formatZar(amount)}</p>
            </div>
          </div>

          {/* Method tabs */}
          <div className="border-b border-[#e8e9ee] bg-[#f8fafc] px-6 py-3">
            <div className="flex gap-1">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold transition ${
                    method === m.key
                      ? "bg-white text-[#0a2c5b] shadow-sm"
                      : "text-[#6b6f7a] hover:text-[#0a2c5b]"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="px-6 py-6">
            <AnimatePresence mode="wait">
              {method === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <Field label="Card number" wide>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="payfast-input font-mono"
                      maxLength={19}
                    />
                  </Field>
                  <Field label="Cardholder name" wide>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="payfast-input"
                    />
                  </Field>
                  <Field label="Expiry">
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="payfast-input"
                    />
                  </Field>
                  <Field label="CVC">
                    <input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      maxLength={4}
                      className="payfast-input"
                    />
                  </Field>
                </motion.div>
              )}
              {method === "eft" && (
                <motion.div
                  key="eft"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <p className="text-sm text-[#4f5360]">
                    You will be redirected to your bank&apos;s instant EFT portal to authorise the
                    payment of <span className="font-bold">{formatZar(amount)}</span>.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    {["FNB", "Standard Bank", "Capitec", "Nedbank", "Absa", "Investec"].map((b) => (
                      <div key={b} className="border border-[#e8e9ee] bg-[#f8fafc] p-3 font-semibold text-[#0a2c5b]">
                        {b}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {method === "zapper" && (
                <motion.div
                  key="zapper"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-center"
                >
                  <div className="mx-auto h-40 w-40 grid place-items-center bg-[#f8fafc] border border-[#e8e9ee]">
                    <div
                      className="h-32 w-32 bg-black"
                      style={{
                        backgroundImage:
                          "repeating-conic-gradient(#000 0% 25%, #fff 25% 50%)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                  </div>
                  <p className="mt-4 text-sm text-[#4f5360]">
                    Open the Zapper app and scan the QR code to pay {formatZar(amount)}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#e8e9ee] pt-5">
              <Link
                href="/checkout"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6f7a] hover:text-[#0a2c5b]"
              >
                ← Cancel
              </Link>
              <motion.button
                whileHover={{ scale: processing ? 1 : 1.02 }}
                whileTap={{ scale: processing ? 1 : 0.98 }}
                type="submit"
                disabled={processing}
                className="bg-[#ff7a00] px-8 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#ff8d22] disabled:opacity-70"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Processing
                  </span>
                ) : (
                  `Pay ${formatZar(amount)}`
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#9ea2ab]">
          🔒 Sandbox / demo mode. No real payment is captured. Test card pre-filled.
        </p>
      </div>

      <style jsx global>{`
        .payfast-input {
          width: 100%;
          height: 2.75rem;
          border: 1px solid #d4dae3;
          background: white;
          padding: 0 0.75rem;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .payfast-input:focus {
          border-color: #0a2c5b;
          box-shadow: 0 0 0 3px rgba(10, 44, 91, 0.1);
        }
      `}</style>
    </div>
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
