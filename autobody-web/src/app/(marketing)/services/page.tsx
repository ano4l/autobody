"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

const SERVICES = [
  {
    n: "01",
    title: "Collision Parts",
    desc: "Bumpers, fenders, bonnets, doors, panels — sourced and inspected for accident repairs.",
  },
  {
    n: "02",
    title: "Lighting & Mirrors",
    desc: "Headlights, tail lights, fog lamps, side mirrors. Halogen, LED, xenon — fitment confirmed.",
  },
  {
    n: "03",
    title: "Brakes & Suspension",
    desc: "Rotors, pads, calipers, struts, coilovers. Performance and OEM-grade options.",
  },
  {
    n: "04",
    title: "Wheels & Tyres",
    desc: "Alloy wheels, steel rims, tyre fitments. Sized to spec, ready for the workshop.",
  },
  {
    n: "05",
    title: "Engine & Mechanical",
    desc: "Cooling fans, alternators, belts, fluids, filters. Workshop-grade parts only.",
  },
  {
    n: "06",
    title: "Body Trim & Detail",
    desc: "Grilles, badges, mouldings, weather seals — finishing parts for proper restorations.",
  },
];

const PROCESS = [
  { step: "01", title: "Tell us what you need", desc: "VIN, photos, or a description over WhatsApp." },
  { step: "02", title: "Fitment confirmation", desc: "We match the part to your exact vehicle." },
  { step: "03", title: "Quote with options", desc: "OEM, aftermarket, used — your call." },
  { step: "04", title: "Pay & dispatch", desc: "Pickup or nationwide courier delivery." },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0d1016] text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top left, rgba(46,77,224,0.4) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 lg:px-8 lg:py-24">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#2e4de0]">
              What we do
            </p>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
              Parts. Fitment. <span className="text-[#2e4de0]">Done right.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/65">
              From bumper covers to brake calipers, we source the right part the first time —
              and the team behind the counter has the workshop background to back it up.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f4f5f9] py-16">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl uppercase sm:text-4xl">Service categories.</h2>
            <p className="mt-2 text-sm text-[#6b6f7a]">Six pillars that cover the bulk of every job.</p>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <RevealItem key={s.n}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="group h-full bg-white p-7"
                >
                  <p className="font-display text-sm text-[#2e4de0]">{s.n}</p>
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4f5360]">{s.desc}</p>
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2e4de0] hover:gap-3 transition-all"
                  >
                    Browse parts →
                  </Link>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#2e4de0]">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl">
              From quote to delivery in four steps.
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <RevealItem key={p.step}>
                <div className="relative border-l-2 border-[#2e4de0] bg-[#f4f5f9] p-6">
                  <p className="font-display text-3xl text-[#2e4de0]">{p.step}</p>
                  <h3 className="mt-3 text-base font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f5360]">{p.desc}</p>
                  {i < PROCESS.length - 1 && (
                    <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-[#2e4de0]/30 lg:block">
                      →
                    </span>
                  )}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="bg-[#0d1016] py-14 text-white">
        <div className="mx-auto grid max-w-[1400px] items-center gap-6 px-5 lg:grid-cols-[1fr_auto] lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl uppercase">Ready to source a part?</h2>
            <p className="mt-2 text-sm text-white/65">
              The catalog has thousands of items. The contact form gets you a human within the hour.
            </p>
          </Reveal>
          <Reveal variant="slideRight">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="bg-[#2e4de0] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3a5cf0]"
              >
                Browse Catalog
              </Link>
              <Link
                href="/contact"
                className="border border-white/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d1016]"
              >
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
