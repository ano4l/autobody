"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatZar } from "@/lib/payfast";

export function MiniProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}` as "/shop"} className="group block">
      <article className="relative border border-[#e8e9ee] bg-white p-3 transition group-hover:border-[#2e4de0]">
        {product.discount && (
          <span className="absolute left-2 top-2 z-10 bg-[#ef3434] px-1.5 py-0.5 text-[9px] font-bold text-white">
            {product.discount}
          </span>
        )}
        <div className="aspect-square overflow-hidden bg-[#f6f7fa]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <h4 className="mt-2 line-clamp-2 min-h-[32px] text-xs font-semibold text-[#1a1d25]">
          {product.name}
        </h4>
        <div className="mt-1 text-[10px] text-[#f5b935]">★★★★★</div>
        <div className="mt-1 flex items-baseline gap-1">
          {product.oldPrice && (
            <span className="text-[11px] text-[#9ea2ab] line-through">
              {formatZar(product.oldPrice)}
            </span>
          )}
          <span className="text-xs font-bold text-[#2e4de0]">{formatZar(product.price)}</span>
        </div>
      </article>
    </Link>
  );
}
