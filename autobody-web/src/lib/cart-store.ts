"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

export type CartLine = {
  slug: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  promoCode: string | null;
  drawerOpen: boolean;

  add: (product: Product, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  setPromoCode: (code: string | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promoCode: null,
      drawerOpen: false,

      add: (product, quantity = 1) => {
        const existing = get().lines.find((l) => l.slug === product.slug);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.slug === product.slug ? { ...l, quantity: l.quantity + quantity } : l,
            ),
          });
        } else {
          set({
            lines: [
              ...get().lines,
              {
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                model: product.model,
                price: product.price,
                image: product.image,
                quantity,
              },
            ],
          });
        }
      },

      remove: (slug) => set({ lines: get().lines.filter((l) => l.slug !== slug) }),

      setQuantity: (slug, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.slug !== slug) });
          return;
        }
        set({
          lines: get().lines.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
        });
      },

      clear: () => set({ lines: [], promoCode: null }),

      setPromoCode: (code) => set({ promoCode: code }),

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set({ drawerOpen: !get().drawerOpen }),
    }),
    {
      name: "ferreiras-cart",
      partialize: (state) => ({ lines: state.lines, promoCode: state.promoCode }),
    },
  ),
);

export function useCartTotals() {
  const lines = useCart((s) => s.lines);
  const promoCode = useCart((s) => s.promoCode);

  const subtotal = lines.reduce((t, l) => t + l.price * l.quantity, 0);
  const itemCount = lines.reduce((t, l) => t + l.quantity, 0);
  const discountRate = promoCode === "FERREIRA10" ? 0.1 : 0;
  const discount = Math.round(subtotal * discountRate);
  const shipping = subtotal > 2500 || subtotal === 0 ? 0 : 120;
  const afterDiscount = subtotal - discount;
  const vat = Math.round(afterDiscount * 0.15);
  const total = afterDiscount + shipping;

  return { subtotal, itemCount, discount, shipping, vat, total, promoCode };
}
