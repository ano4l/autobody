"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { CategoryRail } from "@/components/marketing/category-rail";
import { ProductCard } from "@/components/marketing/product-card";
import { MiniProductCard } from "@/components/marketing/mini-product-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { FEATURE_TABS, getFeatured, getTrending, PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-store";

const featured = getFeatured();
const trending = getTrending();
const headlightSet = PRODUCTS.filter((p) => p.category === "Headlights" || p.category === "Lighting").slice(0, 4);

const sidebarPromos = [
  {
    title: "Wide Selection Of Quality Auto Parts",
    desc: "Source reliable parts at prices that keep repair costs realistic.",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80",
    href: "/shop",
  },
  {
    title: "Genuine Auto Parts At Fair Pricing",
    desc: "OEM and aftermarket options inspected before quoting.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
    href: "/shop",
  },
  {
    title: "Engine Oils & Workshop Fluids",
    desc: "Tested fluids and chemicals for collision repairs and restorations.",
    image: "https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=900&q=80",
    href: "/shop?category=Engine",
  },
] as const;

export default function MarketingHome() {
  const [activeTab, setActiveTab] = useState<string>(FEATURE_TABS[0]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const openDrawer = useCart((s) => s.openDrawer);

  return (
    <>
      <CinematicHero />
      <CategoryRail />

      {/* ========== FEATURE PRODUCTS + SIDEBAR ========== */}
      <section id="featured" className="bg-[#f4f5f9] py-10">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-5 lg:grid-cols-[1fr_380px] lg:px-8">
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-3xl lg:text-4xl">Feature Products</h2>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 border-b border-[#e6e8ed]">
              {FEATURE_TABS.map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  className={`relative pb-3 text-sm font-medium transition ${
                    activeTab === tab ? "text-[#0d1016]" : "text-[#7a7e89] hover:text-[#0d1016]"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="feature-tab-underline"
                      className="absolute -bottom-px left-0 h-[2px] w-full bg-[#2e4de0]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.slice(0, 8).map((p) => (
                <RevealItem key={p.slug}>
                  <ProductCard product={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>

          {/* RIGHT: Sidebar */}
          <aside className="space-y-4 lg:self-start">
            {sidebarPromos.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1} variant="slideRight">
                <Link
                  href={card.href as "/shop"}
                  className="group relative block overflow-hidden bg-[#0d1016] text-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-700 group-hover:opacity-55 group-hover:scale-105"
                  />
                  <div className="relative p-5">
                    <h3 className="font-display text-lg leading-tight">{card.title}</h3>
                    <p className="mt-2 text-xs text-white/70">{card.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2e4de0]">
                      Shop now →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}

            <Reveal variant="slideRight" delay={0.2}>
              <div className="border border-[#e8e9ee] bg-white">
                <div className="flex items-center justify-between p-4">
                  <h3 className="font-display text-lg">Top Trending</h3>
                  <Link
                    href={"/shop" as "/shop"}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2e4de0] hover:underline"
                  >
                    More +
                  </Link>
                </div>
                <div className="grid grid-cols-2 border-t border-[#e8e9ee]">
                  {trending.slice(0, 4).map((p) => (
                    <MiniProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ========== BANNER CTAs ========== */}
      <section className="bg-[#f4f5f9] py-6">
        <div className="mx-auto grid max-w-[1400px] gap-5 px-5 md:grid-cols-2 lg:px-8">
          {[
            {
              title: "Get The\nBest Priced",
              img: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=80",
              href: "/shop",
            },
            {
              title: "Tire & Wheel\nPackages",
              img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80",
              href: "/shop?category=Wheels",
            },
          ].map((banner, i) => (
            <Reveal key={banner.title} delay={i * 0.1}>
              <Link
                href={banner.href as "/shop"}
                className="group relative block overflow-hidden bg-[#0d1016] text-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.img}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-65"
                />
                <div className="relative p-8">
                  <h3 className="font-display text-2xl uppercase whitespace-pre-line">{banner.title}</h3>
                  <span className="mt-5 inline-block bg-[#2e4de0] px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition group-hover:bg-[#3a5cf0]">
                    Shop Now
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========== HEADLIGHTS + SIDEBAR ========== */}
      <section className="bg-[#f4f5f9] py-10">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-5 lg:grid-cols-[1fr_380px] lg:px-8">
          <Reveal>
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {headlightSet.map((p) => (
                <RevealItem key={p.slug}>
                  <ProductCard product={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>
          <aside className="space-y-4 lg:self-start">
            <Reveal variant="slideRight">
              <div className="relative overflow-hidden bg-[#0d1016] text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80"
                  alt=""
                  loading="lazy"
                  className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-45"
                />
                <div className="relative p-6">
                  <h3 className="font-display text-2xl uppercase">
                    Headlights &<br />
                    Lighting
                  </h3>
                  <ul className="mt-4 space-y-1 text-xs text-white/75">
                    <li>• Bulbs</li>
                    <li>• Reflectors</li>
                    <li>• Corner Lights</li>
                    <li>• Warning Lights</li>
                    <li>• Door Lights</li>
                  </ul>
                  <Link
                    href={"/shop?category=Headlights" as "/shop"}
                    className="mt-5 inline-block bg-[#2e4de0] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-[#3a5cf0]"
                  >
                    View All +
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal variant="slideRight" delay={0.1}>
              <div className="border border-[#e8e9ee] bg-white">
                <div className="grid grid-cols-2">
                  {trending.slice(2, 6).map((p) => (
                    <MiniProductCard key={`hl-${p.slug}`} product={p} />
                  ))}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ========== TRUST STRIP ========== */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { num: "15+", label: "Years sourcing parts" },
              { num: "30K+", label: "Parts checked" },
              { num: "50+", label: "Vehicle brands" },
              { num: "RSA", label: "Nationwide delivery" },
            ].map((stat) => (
              <RevealItem key={stat.label}>
                <div className="border-l-2 border-[#2e4de0] pl-4">
                  <div className="font-display text-3xl text-[#0d1016]">{stat.num}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#6b6f7a]">
                    {stat.label}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ========== NEW PRODUCTS NEWSLETTER ========== */}
      <section id="newsletter" className="bg-[#f4f5f9] py-10">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <div className="grid overflow-hidden border border-[#e8e9ee] bg-white md:grid-cols-[1.3fr_1fr]">
              <div className="relative h-56 md:h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=85"
                  alt="Assortment of car parts"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8">
                <h2 className="font-display text-3xl uppercase">New Products</h2>
                <p className="mt-3 text-sm leading-7 text-[#6b6f7a]">
                  Be the first to know when fresh stock arrives. Subscribe for parts drops, deals,
                  and fitment guides delivered straight to your inbox.
                </p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSubscribed(true);
                  }}
                  className="mt-6 flex items-center gap-3 border-b-2 border-[#0d1016]"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Your e-mail address"
                    className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#7a7e89]"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="grid h-10 w-10 place-items-center bg-[#0d1016] text-white transition hover:bg-[#2e4de0]"
                    aria-label="Submit"
                  >
                    →
                  </motion.button>
                </form>
                {subscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-xs text-[#2e4de0]"
                  >
                    Thanks — we will keep you posted on new parts.
                  </motion.p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== QUICK ACTION FLOATER ========== */}
      <button
        onClick={openDrawer}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
    </>
  );
}
