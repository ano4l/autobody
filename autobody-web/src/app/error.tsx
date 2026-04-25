"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#0d1016] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#ef3434]">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
          The Workshop Hit a <span className="text-[#ef3434]">Snag</span>
        </h1>
        <p className="mt-5 max-w-md mx-auto text-sm leading-7 text-white/65">
          An unexpected error came through. Try again, or head back home and the team will sort it
          out shortly.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-[#ef3434] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#f04444]"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-white/20 bg-white/5 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d1016]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
