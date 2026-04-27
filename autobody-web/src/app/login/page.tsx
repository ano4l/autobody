"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isDemoMode, makeDemoSession, saveSession } from "@/lib/auth";
import { ApiError, apiLogin } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const demo = isDemoMode();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = useState(demo ? "demo@ferreiras.local" : "");
  const [password, setPassword] = useState(demo ? "demo" : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (demo) {
        // Demo mode — any credentials work, no backend round-trip.
        await new Promise((r) => setTimeout(r, 350));
        saveSession(
          makeDemoSession({
            email: email || "demo@ferreiras.local",
            name: email ? email.split("@")[0] : "Demo Admin",
          }),
        );
      } else {
        const session = await apiLogin(email, password);
        saveSession(session);
      }
      router.replace(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 401
            ? "Invalid email or password."
            : err.message
          : "Could not reach the server. Try again or use demo mode.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1016] text-white lg:grid lg:grid-cols-2">
      {/* ── Left: form panel ── */}
      <div className="flex min-h-screen flex-col justify-between px-8 py-10 lg:min-h-0 lg:px-16 lg:py-14">
        {/* Wordmark */}
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center bg-[#ef3434] font-display text-xs font-bold text-white tracking-wider">
            FS
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm tracking-[0.06em] text-white">
              Ferreira&apos;s<span className="text-[#ef3434]">.</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Autobody Spares</div>
          </div>
        </Link>

        {/* Form */}
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#ef3434]">
              Staff portal
            </p>
            <h1 className="mt-2 font-display text-display-md text-white leading-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Sign in with your staff account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Email
              </label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@ferreiras.local"
                className="h-11 w-full rounded-sm border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/25 outline-none transition hover:border-white/20 focus:border-[#ef3434] focus:bg-white/8"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11 w-full rounded-sm border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/25 outline-none transition hover:border-white/20 focus:border-[#ef3434] focus:bg-white/8"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-sm border border-[#ef3434]/30 bg-[#ef3434]/10 px-3 py-2 text-xs text-[#ef3434]"
              >
                {error}
              </div>
            ) : null}

            {demo ? (
              <div
                role="note"
                className="rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50"
              >
                Demo mode — any email and password will sign you in.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[#ef3434] text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-xs text-white/30">
            {demo
              ? "Demo build — credentials are synthesised locally, no backend required."
              : "Connected to the live workshop backend. Use your staff credentials."}
          </p>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-white/20">
          © {new Date().getFullYear()} Ferreira&apos;s Autobody Spares, Pretoria
        </p>
      </div>

      {/* ── Right: brand panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {/* Background layers matching cinematic-hero */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(239,52,52,0.18),transparent_55%),radial-gradient(ellipse_at_80%_75%,rgba(58,93,122,0.22),transparent_55%)] bg-[#070d14]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }}
        />

        {/* Speed-line accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ef3434]/40 to-transparent" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
            Operations Dashboard
          </p>

          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.22em] text-[#ef3434]">
              Ferreira&apos;s Autobody Spares
            </p>
            <blockquote className="mt-4 max-w-sm font-serif text-2xl leading-snug text-white/90">
              &ldquo;Inventory, messages, receipts, and sales — the quiet machinery of the workshop, working in one place.&rdquo;
            </blockquote>
            <ul className="mt-8 space-y-2 text-xs text-white/40">
              {["Inventory & item master", "POS walk-in sales terminal", "WhatsApp inbox & escalations", "Shopify ecommerce orders", "Reports & analytics"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-px w-4 bg-[#ef3434]/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-white/20">
            Pretoria · Johannesburg · Online
          </p>
        </div>
      </div>
    </div>
  );
}
