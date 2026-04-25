"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { makeDemoSession, saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@ferreiras.local");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Demo mode — any credentials work, no backend round-trip.
    await new Promise((r) => setTimeout(r, 350));
    saveSession(
      makeDemoSession({
        email: email || "demo@ferreiras.local",
        name: email ? email.split("@")[0] : "Demo Admin",
      }),
    );
    router.replace("/dashboard");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-clay-500 text-sm font-semibold text-white">
              AB
            </span>
            <span className="font-serif text-base font-medium text-ink-900">Autobody</span>
          </Link>

          <h1 className="font-serif text-display-md text-ink-900">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-600">Sign in with your staff account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="Email">
              <Input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-rust-500/30 bg-rust-50 px-3 py-2 text-xs text-rust-600"
              >
                {error}
              </div>
            ) : null}

            <div
              role="note"
              className="rounded-md border border-clay-200 bg-cream-50 px-3 py-2 text-xs text-ink-700"
            >
              Demo mode — any email and password will sign you in.
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-xs text-ink-500">
            This build runs without a real backend, so the form just synthesises a session and
            takes you to the dashboard.
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,100,66,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(245,239,230,0.15),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream-100">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cream-400">
              Autobody Operations
            </p>
          </div>
          <div>
            <p className="max-w-md font-serif text-3xl leading-tight">
              &ldquo;The quiet machinery of the shop — inventory, messages, receipts — working together in
              one place.&rdquo;
            </p>
            <p className="mt-6 text-xs text-cream-400">
              Inventory · POS · WhatsApp · Shopify · Reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
