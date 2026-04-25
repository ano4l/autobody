"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { formatZar } from "@/lib/payfast";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [flash, setFlash] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    setFlash(true);
    setTimeout(() => setFlash(false), 1000);
    setTimeout(() => openDrawer(), 250);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className="group relative border border-[#e8e9ee] bg-white transition hover:shadow-[0_18px_38px_-20px_rgba(0,0,0,0.18)]"
    >
      {product.discount && (
        <span className="absolute left-3 top-3 z-10 bg-[#ef3434] px-2 py-0.5 text-[10px] font-bold text-white">
          {product.discount}
        </span>
      )}
      <button
        aria-label="Favorite"
        className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center border border-[#e8e9ee] bg-white text-[#9ea2ab] transition hover:text-[#ef3434]"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
          />
        </svg>
      </button>

      <Link href={`/shop/${product.slug}` as "/shop"} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-[#f6f7fa]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2e4de0]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#d8d9df]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#d8d9df]" />
        </div>

        <div className="border-t border-[#e8e9ee] p-4">
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-[#1a1d25]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#7a7e89]">
            <span className="text-[#f5b935]">★★★★★</span>
            <span>{product.reviews} Review{product.reviews === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.oldPrice && (
                <span className="text-xs text-[#9ea2ab] line-through">{formatZar(product.oldPrice)}</span>
              )}
              <span className="text-base font-bold text-[#2e4de0]">{formatZar(product.price)}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleAdd}
              aria-label="Add to cart"
              className="relative grid h-8 w-8 place-items-center bg-[#f4f5f9] text-[#0d1016] transition hover:bg-[#2e4de0] hover:text-white"
            >
              <AnimatePresence mode="wait">
                {flash ? (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="cart"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
