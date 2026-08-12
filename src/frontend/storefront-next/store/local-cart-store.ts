"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/commerce";

export type LocalCartLine = {
  id: string;
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

type LocalCartState = {
  lines: LocalCartLine[];
  add: (product: Product, quantity?: number, variantId?: string) => void;
  update: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useLocalCartStore = create<LocalCartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product, quantity = 1, variantIdArg) => {
        const variant =
          product.variants.find((v) => v.id === variantIdArg) ?? product.variants[0];
        const variantId = variant?.id ?? product.id;
        const title =
          variant && variant.title !== "Default Title"
            ? `${product.title} — ${variant.title}`
            : product.title;
        const price = variant?.price ?? product.price;
        const imageUrl = variant?.imageUrl ?? product.imageUrl;
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === variantId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                id: `local-${variantId}`,
                productId: product.id,
                variantId,
                handle: product.handle,
                title,
                price,
                imageUrl,
                quantity,
              },
            ],
          };
        });
      },
      update: (id, quantity) => {
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
        }));
      },
      remove: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "marmara-local-cart" },
  ),
);
