"use client";

import Link from "next/link";
import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/marketing/product-card";
import { Reveal } from "@/components/marketing/reveal";
import { PRODUCTS, CATEGORIES, BRANDS, CONDITIONS, type Product } from "@/lib/products";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
  { key: "newest", label: "Newest" },
];

const PAGE_SIZE = 12;

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopBody />
    </Suspense>
  );
}

function ShopFallback() {
  return (
    <section className="bg-[#f4f5f9] py-20">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        <div className="grid place-items-center py-20 text-center text-sm text-[#6b6f7a]">
          Loading catalog…
        </div>
      </div>
    </section>
  );
}

function ShopBody() {
  const params = useSearchParams();

  const [search, setSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  // Read query params (?category=, ?brand=, ?model=)
  useEffect(() => {
    const cat = params.get("category");
    if (cat) setCategoryFilters([cat]);
    const brand = params.get("brand");
    if (brand) setBrandFilter(brand);
  }, [params]);

  const toggleCategory = (cat: string) => {
    setCategoryFilters((current) =>
      current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat],
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilters.length > 0 && !categoryFilters.includes(p.category)) return false;
      if (brandFilter !== "all" && p.brand !== brandFilter) return false;
      if (conditionFilter !== "all" && p.condition !== conditionFilter) return false;
      if (p.price > maxPrice) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating || b.reviews - a.reviews;
        case "newest":
          return PRODUCTS.indexOf(b) - PRODUCTS.indexOf(a);
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    return list;
  }, [search, categoryFilters, brandFilter, conditionFilter, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible: Product[] = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilters([]);
    setBrandFilter("all");
    setConditionFilter("all");
    setMaxPrice(15000);
    setPage(1);
  };

  return (
    <>
      {/* Page hero */}
      <section className="bg-[#0d1016] py-12 text-white">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/55">
              Shop
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
              Full <span className="text-[#ef3434]">Parts</span> Catalog
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/65">
              Filter by category, brand, condition, and price. Every part is checked before
              quoting and dispatch.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/45">
              <Link href={"/" as "/"} className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">Shop</span>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f4f5f9] py-10">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-5 lg:grid-cols-[280px_1fr] lg:px-8">
          {/* Filters rail */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6f7a]">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search parts…"
                className="h-10 w-full border border-[#dedede] bg-white px-3 text-sm outline-none focus:border-[#ef3434]"
              />
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6f7a]">
                Categories
              </h3>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const checked = categoryFilters.includes(cat.name);
                  return (
                    <label
                      key={cat.name}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#ef3434]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat.name)}
                        className="accent-[#ef3434]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6f7a]">
                Brand
              </h3>
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full border border-[#dedede] bg-white px-3 text-sm outline-none focus:border-[#ef3434]"
              >
                <option value="all">All brands</option>
                {BRANDS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6f7a]">
                Condition
              </h3>
              <select
                value={conditionFilter}
                onChange={(e) => {
                  setConditionFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full border border-[#dedede] bg-white px-3 text-sm outline-none focus:border-[#ef3434]"
              >
                <option value="all">Any condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6f7a]">
                Max price
              </h3>
              <input
                type="range"
                min={500}
                max={15000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#ef3434]"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-[#6b6f7a]">
                <span>R500</span>
                <span className="font-semibold text-[#ef3434]">R{maxPrice.toLocaleString()}</span>
                <span>R15k</span>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full border border-[#0d1016] py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d1016] hover:bg-[#0d1016] hover:text-white transition"
            >
              Clear filters
            </button>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e9ee] pb-4">
              <p className="text-sm text-[#6b6f7a]">
                Showing <span className="font-semibold text-[#0d1016]">{visible.length}</span> of{" "}
                <span className="font-semibold text-[#0d1016]">{filtered.length}</span> products
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#6b6f7a]">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-9 border border-[#dedede] bg-white px-3 text-sm outline-none focus:border-[#ef3434]"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="grid place-items-center py-20 text-center">
                <p className="font-display text-xl uppercase">No products match</p>
                <p className="mt-2 text-sm text-[#6b6f7a]">Try adjusting your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-5 bg-[#ef3434] px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#f04444]"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {visible.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-4 border border-[#dedede] bg-white text-sm disabled:opacity-40 hover:border-[#ef3434]"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 text-sm font-semibold transition ${
                      page === p
                        ? "bg-[#ef3434] text-white"
                        : "border border-[#dedede] bg-white hover:border-[#ef3434]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-4 border border-[#dedede] bg-white text-sm disabled:opacity-40 hover:border-[#ef3434]"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
