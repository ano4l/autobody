"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const VIMEO_ID = "1186412193";
// background=1 strips chrome and auto-loops/mutes the player.
const VIMEO_SRC = `https://player.vimeo.com/video/${VIMEO_ID}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1&transparent=0&quality=1080p`;
const HERO_POSTER =
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1800&q=72";

export function CinematicHero() {
  const heroRef = useRef<HTMLElement>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const fallback = window.setTimeout(() => setVideoReady(true), 2800);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const [gsapModule, stModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.set(".hero-content, .hero-finder, .hero-kicker, .hero-word, .hero-sub, .hero-cta > *, .scroll-cue", {
          opacity: 1,
          visibility: "visible",
        });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-kicker", { y: 12, duration: 0.45, clearProps: "transform" }, 0)
          .from(".hero-word", { y: 28, duration: 0.55, stagger: 0.05, clearProps: "transform" }, 0.05)
          .from(".hero-sub", { y: 14, duration: 0.45, clearProps: "transform" }, 0.35)
          .from(".hero-cta > *", { y: 10, duration: 0.35, stagger: 0.08, clearProps: "transform" }, 0.5)
          .from(".hero-finder", { y: 18, duration: 0.45, clearProps: "transform" }, 0.08)
          .from(".scroll-cue", { y: 8, duration: 0.45, clearProps: "transform" }, 0.65);

        gsap.to(".hero-video-layer", {
          yPercent: 18,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".hero-content-scroll", {
          yPercent: -12,
          opacity: 0.92,
          ease: "power2.in",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "25% top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }, heroRef);

      cleanup = () => ctx.revert();
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative overflow-hidden bg-[#03060a] text-white"
    >
      {/* Vimeo background — slightly blurred so text stays legible */}
      <div className="hero-video-layer absolute inset-0 z-0" aria-hidden="true">
        <img
          src={HERO_POSTER}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={VIMEO_SRC}
            title="Cinematic background"
            allow="autoplay; fullscreen; picture-in-picture"
            loading="eager"
            onLoad={() => window.setTimeout(() => setVideoReady(true), 450)}
            className="hero-iframe absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "max(100vw, calc(100vh * 16 / 9))",
              height: "max(56.25vw, 100vh)",
              minWidth: "100%",
              minHeight: "100%",
              border: 0,
              filter: "blur(0.6px) saturate(1.08) contrast(1.04)",
              transform: "translate(-50%, -50%) scale(1.06)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Cinematic grade for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060a]/55 via-[#03060a]/38 to-[#03060a]/86" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_0%,rgba(3,6,10,0.42)_74%)]" />

        {/* Atmospheric orbs */}
        <div
          className="pointer-events-none absolute left-[10%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-[#2e4de0]/18 blur-[120px]"
          style={{ animation: "floatOrb 12s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute right-[8%] bottom-[14%] h-80 w-80 rounded-full bg-[#ef3434]/15 blur-[100px]"
          style={{ animation: "floatOrb 10s ease-in-out infinite 1s" }}
        />

      </div>

      <div
        className={`pointer-events-none fixed inset-0 z-[80] grid min-h-screen place-items-center overflow-hidden bg-[#03060a] text-white transition-all duration-700 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border border-white/15" />
            <div className="hero-wheel absolute inset-2 rounded-full border-[12px] border-[#2e4de0] border-t-white border-r-[#ef3434] shadow-[0_0_54px_rgba(46,77,224,0.5)]" />
            <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
          <div className="h-px w-56 overflow-hidden bg-white/10">
            <div className="hero-road-line h-full w-24 bg-gradient-to-r from-transparent via-[#2e4de0] to-transparent" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 pt-6 lg:px-8">
        {/* Vehicle finder */}
        <div className="hero-finder mx-auto max-w-[920px] border border-white/15 bg-[#151a23]/92 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">
              Select Your Car
            </span>
            <span className="text-xs text-white/60">
              Search Part By Selecting Your Car →
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="bg-[#0d1016] border border-white/10 px-4 py-3 text-sm text-white"
            >
              <option value="">1. Select Make</option>
              <option>Toyota</option>
              <option>Volkswagen</option>
              <option>BMW</option>
              <option>Mercedes-Benz</option>
              <option>Ford</option>
              <option>Hyundai</option>
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#0d1016] border border-white/10 px-4 py-3 text-sm text-white"
            >
              <option value="">2. Select Model</option>
              <option>Corolla</option>
              <option>Hilux</option>
              <option>Polo</option>
              <option>3 Series</option>
              <option>C-Class</option>
              <option>Ranger</option>
              <option>i20</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-[#0d1016] border border-white/10 px-4 py-3 text-sm text-white"
            >
              <option value="">3. Select Year</option>
              {Array.from({ length: 20 }, (_, i) => 2024 - i).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={`/shop${make ? `?brand=${encodeURIComponent(make)}` : ""}${
                model ? `${make ? "&" : "?"}model=${encodeURIComponent(model)}` : ""
              }`}
              className="inline-flex items-center justify-center bg-[#2e4de0] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#3a5cf0]"
            >
              Search Now
            </motion.a>
          </div>
        </div>

        {/* Hero content — fully centered */}
        <div className="hero-content hero-content-scroll relative flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center opacity-100 lg:py-20">
          <p className="hero-kicker text-[11px] font-bold uppercase tracking-[0.32em] text-white/85 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            Premium collision repair parts
          </p>
          <h1 className="font-display text-4xl uppercase leading-[0.95] text-white drop-shadow-[0_5px_34px_rgba(0,0,0,0.95)] sm:text-6xl lg:text-[80px]">
            <span className="hero-word block">Quality</span>
            <span className="hero-word block text-[#2e4de0] drop-shadow-[0_0_30px_rgba(46,77,224,0.45)]">
              Autobody
            </span>
            <span className="hero-word block">Parts For</span>
            <span className="hero-word block text-white">Every Repair</span>
          </h1>
          <p className="hero-sub mx-auto mt-2 max-w-xl text-base font-medium leading-8 text-white/90 drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)]">
            Reliable used and new autobody parts for every repair, restoration, and everyday
            maintenance need — sourced from trusted suppliers since 2009.
          </p>
          <div className="hero-cta mt-2 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={"/shop" as "/shop"}
                className="inline-block bg-[#2e4de0] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3a5cf0] hover:shadow-[0_18px_50px_-12px_rgba(46,77,224,0.5)]"
              >
                Shop Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={"/contact" as "/contact"}
                className="inline-block border border-white/25 bg-white/5 backdrop-blur-md px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d1016]"
              >
                Request a Quote
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue mx-auto flex -translate-y-2 flex-col items-center gap-2 pb-6 text-white/45">
          <span className="text-[10px] uppercase tracking-[0.28em]">Scroll to explore</span>
          <div className="relative h-10 w-px overflow-hidden bg-white/10">
            <div className="absolute top-0 left-0 h-5 w-full animate-scroll-line bg-gradient-to-b from-[#2e4de0] to-transparent" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroWheelSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes heroRoadLine {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(240%);
          }
        }

        .hero-wheel {
          animation: heroWheelSpin 0.82s linear infinite;
        }

        .hero-road-line {
          animation: heroRoadLine 0.9s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        @keyframes floatOrb {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -12px, 0);
          }
        }
      `}</style>
    </section>
  );
}
