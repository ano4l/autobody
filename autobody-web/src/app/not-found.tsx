import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0d1016] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#2e4de0]">
          Error 404
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.95] sm:text-7xl">
          Part Not <span className="text-[#2e4de0]">Found</span>
        </h1>
        <p className="mt-5 max-w-md mx-auto text-sm leading-7 text-white/65">
          That page took the wrong turn at the workshop. The catalog has thousands of parts —
          let&apos;s help you find the right one.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-[#2e4de0] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3a5cf0]"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="border border-white/20 bg-white/5 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d1016]"
          >
            Browse Catalog
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/30">
          <span className="h-px w-12 bg-white/15" />
          <span>Ferreira&apos;s Autobody Spares</span>
          <span className="h-px w-12 bg-white/15" />
        </div>
      </div>
    </div>
  );
}
