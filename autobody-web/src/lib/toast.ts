"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info" | "warning";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
}

export interface ToastItem extends Required<Omit<ToastInput, "description" | "action">> {
  id: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  items: ToastItem[];
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const DEFAULT_DURATION = 4200;

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (input) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "info",
      durationMs: input.durationMs ?? DEFAULT_DURATION,
      action: input.action,
    };
    set({ items: [...get().items, item] });
    if (item.durationMs > 0) {
      setTimeout(() => {
        const present = get().items.some((entry) => entry.id === id);
        if (present) get().dismiss(id);
      }, item.durationMs);
    }
    return id;
  },
  dismiss: (id) => set({ items: get().items.filter((entry) => entry.id !== id) }),
  clear: () => set({ items: [] }),
}));

function push(input: ToastInput) {
  return useToastStore.getState().push(input);
}

export const toast = {
  show: push,
  success: (title: string, description?: string) =>
    push({ title, description, tone: "success" }),
  error: (title: string, description?: string) =>
    push({ title, description, tone: "error", durationMs: 6000 }),
  info: (title: string, description?: string) => push({ title, description, tone: "info" }),
  warning: (title: string, description?: string) =>
    push({ title, description, tone: "warning" }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
  clear: () => useToastStore.getState().clear(),
};
