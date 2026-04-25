"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

const STATS = [
  { num: "15+", label: "Years sourcing parts" },
  { num: "30K+", label: "Parts checked" },
  { num: "12", label: "Vehicle brands" },
  { num: "RSA", label: "Nationwide support" },
];

const VALUES = [
  {
    n: "01",
    title: "Quality before quoting",
    body: "Every used part is inspected and photographed. Aftermarket and OEM stock is sourced through trusted suppliers only.",
  },
  {
    n: "02",
    title: "Fitment first",
    body: "Send a VIN, photo, or chassis tag. We confirm fitment before payment so the part bolts on the first time.",
  },
  {
    n: "03",
    title: "Fair pricing",
    body: "Quote-assisted ordering keeps repair costs realistic — no surprise mark-ups, no upsells.",
  },
  {
    n: "04",
    title: "Nationwide support",
    body: "Pretoria-based with same-day Gauteng delivery and courier dispatch across South Africa.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d1016] text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top right, rgba(239,52,52,0.45) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(239,52,52,0.18) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 lg:px-8 lg:py-28">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#ef3434]">
              About Ferreira&apos;s
            </p>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-6xl lg:text-[80px]">
              Craft Meets
              <br />
              <span className="text-[#ef3434]">Machinery.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/65">
              Since 2009 we&apos;ve been the parts call for Pretoria&apos;s panel beaters,
              workshop owners, and weekend restorers. The standard is simple — finish the job
              right, or don&apos;t finish it at all.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/45">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">About</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="bg-[#f4f5f9] py-16">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-[1fr_1fr] lg:px-8">
          <Reveal variant="slideLeft">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#ef3434]">
              The story
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl">
              From a single bay to a full-service parts room.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[#4f5360]">
              <p>
                Two decades on the floor taught us one thing — a vehicle leaves the workshop in
                exactly the condition its owner deserves. Every panel, every torque setting,
                every fitment gets checked twice.
              </p>
              <p>
                We run a tight operation: OEM parts network, certified body and mechanical
                technicians, digital intake, and a customer line that keeps you in the loop from
                quote to delivery.
              </p>
              <p>
                From fleet vehicles to weekend drivers, the standard never changes — and it never
                will.
              </p>
            </div>
          </Reveal>

          <Reveal variant="slideRight">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#0d1016]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=82"
                alt="Workshop"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d1016]/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
                  Pretoria, Gauteng
                </p>
                <p className="mt-1 font-display text-xl">Workshop &amp; parts room</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <RevealItem key={s.label}>
                <div className="border-l-2 border-[#ef3434] pl-4">
                  <div className="font-display text-3xl text-[#0d1016]">{s.num}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#6b6f7a]">
                    {s.label}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#f4f5f9] py-16">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#ef3434]">
              How we work
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl">
              The non-negotiables.
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <RevealItem key={v.n}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="h-full bg-white p-6"
                >
                  <p className="font-display text-sm text-[#ef3434]">{v.n}</p>
                  <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4f5360]">{v.body}</p>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0d1016] py-16 text-white">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-5 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl uppercase sm:text-4xl">
              Need a part fast? <span className="text-[#ef3434]">Get a quote.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/65">
              Send your VIN or vehicle details and the team will confirm fitment, stock, and
              delivery — usually within the hour.
            </p>
          </Reveal>
          <Reveal variant="slideRight">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="bg-[#ef3434] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#f04444]"
              >
                Contact Us
              </Link>
              <Link
                href="/shop"
                className="border border-white/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d1016]"
              >
                Browse Catalog
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
