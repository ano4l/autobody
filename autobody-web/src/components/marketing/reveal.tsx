"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { fadeUp, stagger, slideFromLeft, slideFromRight, fadeIn } from "@/lib/motion";

type Variant = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "stagger";

const variantMap: Record<Variant, Variants> = {
  fadeUp,
  fadeIn,
  slideLeft: slideFromLeft,
  slideRight: slideFromRight,
  stagger,
};

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
  return (
    <motion.div
      variants={variantMap[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
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
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
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
  return (
    <motion.div variants={variantMap[variant]} className={className}>
      {children}
    </motion.div>
  );
}
