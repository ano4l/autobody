"use client";

import { useEffect, type ReactNode } from "react";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchMobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    if (prefersReduced || isTouchMobile) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: Lenis }, gsapModule, stModule] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      lenis.on("scroll", () => {
        ScrollTrigger.update();
        document.documentElement.style.setProperty(
          "--scroll-progress",
          String(Math.min(1, Math.max(0, window.scrollY / (document.body.scrollHeight - window.innerHeight || 1)))),
        );
      });

      let rafId = 0;
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    })();

    return () => cleanup?.();
  }, []);

  return <>{children}</>;
}
