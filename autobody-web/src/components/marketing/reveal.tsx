"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import { fadeUp, stagger, slideFromLeft, slideFromRight, fadeIn } from "@/lib/motion";

type Variant = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "stagger";

const variantMap: Record<Variant, Variants> = {
  fadeUp,
  fadeIn,
  slideLeft: slideFromLeft,
  slideRight: slideFromRight,
  stagger,
};

function useMobileRevealSafe() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export function Reveal({
  variant = "fadeUp",
  delay,
  once = true,
  amount = 0.2,
  children,
  className,
  ...rest
}: {
  variant?: Variant;
  delay?: number;
  once?: boolean;
  amount?: number;
  children: React.ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport">) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMobileRevealSafe();
  const safeVariant = shouldReduceMotion || isMobile ? fadeIn : variant === "slideLeft" || variant === "slideRight" ? fadeUp : variantMap[variant];

  return (
    <motion.div
      variants={safeVariant}
      initial={isMobile ? "visible" : "hidden"}
      animate={isMobile ? "visible" : undefined}
      whileInView="visible"
      viewport={{ once, amount: shouldReduceMotion ? 0.05 : amount, margin: "0px 0px -8% 0px" }}
      transition={delay ? { delay } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
  once = true,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMobileRevealSafe();

  return (
    <motion.div
      variants={shouldReduceMotion || isMobile ? fadeIn : stagger}
      initial={isMobile ? "visible" : "hidden"}
      animate={isMobile ? "visible" : undefined}
      whileInView="visible"
      viewport={{ once, amount: shouldReduceMotion ? 0.05 : amount, margin: "0px 0px -8% 0px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variant = "fadeUp",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMobileRevealSafe();

  return (
    <motion.div variants={shouldReduceMotion || isMobile ? fadeIn : variantMap[variant]} className={className}>
      {children}
    </motion.div>
  );
}
