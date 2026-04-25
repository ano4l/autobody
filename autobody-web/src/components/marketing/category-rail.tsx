"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/products";

export function CategoryRail() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="bg-[#f4f5f9] py-10">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden bg-[#2e4de0] text-white"
        >
          <div className="grid items-center gap-6 p-6 lg:grid-cols-[280px_1fr] lg:p-8">
            <div>
              <h2 className="font-display text-3xl uppercase lg:text-4xl">Categories</h2>
              <p className="mt-3 text-sm text-white/80">
                Browse our full range of new and used autobody spares.
              </p>
              <div className="mt-5 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollBy(-220)}
                  aria-label="Previous category"
                  className="grid h-10 w-10 place-items-center bg-white/15 transition hover:bg-white/25"
                >
                  <span className="text-xl leading-none">←</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollBy(220)}
                  aria-label="Next category"
                  className="grid h-10 w-10 place-items-center bg-white/15 transition hover:bg-white/25"
                >
                  <span className="text-xl leading-none">→</span>
                </motion.button>
              </div>
            </div>
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            >
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex-none snap-start"
                >
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat.name)}` as "/shop"}
                    className="group block"
                  >
                    <div className="relative h-[120px] w-[150px] overflow-hidden bg-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2e4de0]/60 to-transparent" />
                    </div>
                    <div className="mt-2 text-center text-sm font-medium text-white/95 transition group-hover:text-white">
                      {cat.name}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
