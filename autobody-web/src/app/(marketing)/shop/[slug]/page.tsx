"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound } from "next/navigation";
import { findProduct, relatedProducts } from "@/lib/products";
import { ProductCard } from "@/components/marketing/product-card";
import { Reveal } from "@/components/marketing/reveal";
import { useCart } from "@/lib/cart-store";
import { formatZar } from "@/lib/payfast";

type Tab = "description" | "specs" | "fitment" | "reviews";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = findProduct(slug);
  if (!product) notFound();

  const related = relatedProducts(slug);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [tab, setTab] = useState<Tab>("description");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(product, qty);
    openDrawer();
  };

  return (
    <>
      {/* Breadcrumb hero */}
      <section className="bg-[#0d1016] py-10 text-white">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-white">Shop</Link>
            <span className="mx-2">/</span>
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-white"
            >
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
          </p>
        </div>
      </section>

      {/* Detail grid */}
      <section className="bg-[#f4f5f9] py-10">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          {/* Gallery */}
          <Reveal variant="slideLeft">
            <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
              <div className="order-2 sm:order-1 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
                {gallery.map((g) => (
                  <button
                    key={g}
                    onClick={() => setActiveImage(g)}
                    className={`flex-none border-2 overflow-hidden ${
                      activeImage === g ? "border-[#ef3434]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt="" className="h-20 w-20 object-cover" />
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="order-1 sm:order-2 aspect-[4/3] overflow-hidden bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          {/* Info */}
          <Reveal variant="slideRight">
            <p className="text-xs uppercase tracking-[0.2em] text-[#ef3434]">
              {product.brand} / {product.category}
            </p>
            <h1 className="mt-2 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-[#6b6f7a]">
              <span className="text-[#f5b935]">★★★★★</span>
              <span>{product.reviews} reviews</span>
              <span className="h-1 w-1 rounded-full bg-[#dedede]" />
              <span className={product.stock > 0 ? "text-emerald-600" : "text-rose-600"}>
                {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              {product.oldPrice && (
                <span className="text-base text-[#9ea2ab] line-through">
                  {formatZar(product.oldPrice)}
                </span>
              )}
              <span className="font-display text-3xl text-[#ef3434]">{formatZar(product.price)}</span>
              {product.discount && (
                <span className="bg-[#ef3434] px-2 py-0.5 text-[10px] font-bold text-white">
                  {product.discount}
                </span>
              )}
            </div>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#4f5360]">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-[#dedede] bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-12 w-10 place-items-center text-lg hover:bg-[#f4f5f9]"
                >
                  -
                </button>
                <span className="grid h-12 min-w-10 place-items-center px-2 text-sm font-semibold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-12 w-10 place-items-center text-lg hover:bg-[#f4f5f9]"
                >
                  +
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="h-12 bg-[#0d1016] px-8 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#ef3434] transition"
              >
                {added ? "✓ Added" : "Add to Cart"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="h-12 bg-[#ef3434] px-8 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#f04444] transition"
              >
                Buy Now
              </motion.button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#e8e9ee] pt-6 text-xs text-[#6b6f7a]">
              <div>
                <span className="block font-semibold text-[#0d1016]">Free quote</span>
                fitment confirmed
              </div>
              <div>
                <span className="block font-semibold text-[#0d1016]">Nationwide</span>
                delivery support
              </div>
              <div>
                <span className="block font-semibold text-[#0d1016]">Workshop tested</span>
                before dispatch
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <div className="flex flex-wrap gap-6 border-b border-[#e8e9ee]">
            {([
              { key: "description", label: "Description" },
              { key: "specs", label: "Specifications" },
              { key: "fitment", label: "Fitment" },
              { key: "reviews", label: `Reviews (${product.reviews})` },
            ] as { key: Tab; label: string }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative pb-3 text-sm font-medium transition ${
                  tab === t.key ? "text-[#0d1016]" : "text-[#7a7e89] hover:text-[#0d1016]"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <motion.span
                    layoutId="product-tab-underline"
                    className="absolute -bottom-px left-0 h-[2px] w-full bg-[#ef3434]"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {tab === "description" && (
                <p className="max-w-3xl text-sm leading-7 text-[#4f5360]">
                  {product.description}
                </p>
              )}
              {tab === "specs" && (
                <dl className="grid max-w-2xl gap-2 text-sm">
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="grid grid-cols-[140px_1fr] border-b border-[#f0f1f4] py-2"
                    >
                      <dt className="text-[#6b6f7a]">{s.label}</dt>
                      <dd className="font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tab === "fitment" && (
                <ul className="grid max-w-2xl grid-cols-2 gap-2 text-sm">
                  {(product.fitment ?? ["Universal fitment — contact us to confirm."]).map((f) => (
                    <li key={f} className="border-l-2 border-[#ef3434] pl-3">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {tab === "reviews" && (
                <div className="max-w-2xl space-y-4 text-sm">
                  <div className="border border-[#e8e9ee] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Verified buyer</span>
                      <span className="text-[#f5b935]">★★★★★</span>
                    </div>
                    <p className="mt-2 text-[#4f5360]">
                      Fitment was spot on, quality matches OEM. Quick delivery to Pretoria.
                    </p>
                  </div>
                  <p className="text-xs text-[#6b6f7a]">
                    Live reviews are coming soon. Contact us with your fitment for confirmation.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-[#f4f5f9] py-12">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
            <Reveal>
              <h2 className="font-display text-2xl uppercase">Related Products</h2>
              <p className="mt-1 text-sm text-[#6b6f7a]">From the same category</p>
            </Reveal>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
