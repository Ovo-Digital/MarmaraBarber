"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/commerce";

/**
 * Shopify'a bağlı sepet.
 *
 * Önceki `useLocalCartStore` sadece tarayıcı hafızasında liste tutuyordu;
 * gerçek bir Shopify sepeti oluşmadığı için ÖDEMEYE GEÇİLEMİYORDU.
 *
 * Bu store aynı arayüzü sunar (lines / add / update / remove / total) ama
 * arkada `/api/cart` üzerinden Shopify Cart API'sini kullanır. Shopify her
 * işlemde sepetin son halini ve `checkoutUrl` adresini döndürür; ödeme o
 * adrese yönlendirilerek Shopify'ın kendi kasasında tamamlanır.
 *
 * Tarayıcıda sadece sepet kimliği saklanır — satırlar her zaman Shopify'dan
 * gelir, böylece fiyat/stok değişiklikleri anında yansır.
 */

export type CartLine = {
  /** Shopify sepet satırı kimliği — güncelleme/silme bununla yapılır */
  id: string;
  handle: string;
  title: string;
  variantTitle?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

type ApiCart = {
  id: string;
  checkoutUrl: string;
  totalAmount: number;
  currencyCode: string;
  lines: {
    id: string;
    merchandiseId: string;
    quantity: number;
    title: string;
    price: number;
    imageUrl?: string;
    productHandle?: string;
    variantTitle?: string;
  }[];
};

type CartState = {
  cartId: string | null;
  lines: CartLine[];
  checkoutUrl: string | null;
  currencyCode: string;
  totalAmount: number;
  loading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  add: (product: Product, quantity?: number, variantId?: string) => Promise<void>;
  update: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  clear: () => void;
  total: () => number;
};

/** Shopify satırlarını bileşenlerin beklediği şekle çevirir */
function mapLines(cart: ApiCart): CartLine[] {
  return cart.lines.map((l) => ({
    id: l.id,
    handle: l.productHandle ?? "",
    title: l.title,
    variantTitle: l.variantTitle,
    price: l.price,
    imageUrl: l.imageUrl,
    quantity: l.quantity,
  }));
}

async function callCart(body: Record<string, unknown>): Promise<ApiCart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data?: ApiCart; error?: string };
  if (!json.success || !json.data) throw new Error(json.error ?? "Cart request failed");
  return json.data;
}

export const useShopifyCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      lines: [],
      checkoutUrl: null,
      currencyCode: "USD",
      totalAmount: 0,
      loading: false,
      error: null,

      /** Sayfa açıldığında kayıtlı sepeti Shopify'dan tazeler */
      hydrate: async () => {
        const id = get().cartId;
        if (!id) return;
        try {
          const res = await fetch(`/api/cart?cartId=${encodeURIComponent(id)}`);
          const json = (await res.json()) as { success: boolean; data?: ApiCart };
          if (!json.success || !json.data) {
            // Sepet Shopify'da yoksa (süresi dolmuş / tamamlanmış) sıfırla
            set({ cartId: null, lines: [], checkoutUrl: null, totalAmount: 0 });
            return;
          }
          const cart = json.data;
          set({
            lines: mapLines(cart),
            checkoutUrl: cart.checkoutUrl,
            totalAmount: cart.totalAmount,
            currencyCode: cart.currencyCode,
          });
        } catch {
          /* bağlantı hatası: mevcut durum korunur */
        }
      },

      add: async (product, quantity = 1, variantId) => {
        const merchandiseId = variantId ?? product.variants[0]?.id;
        if (!merchandiseId) {
          set({ error: "Product variant not found" });
          return;
        }

        set({ loading: true, error: null });
        try {
          let id = get().cartId;
          if (!id) {
            const created = await callCart({ op: "create" });
            id = created.id;
            set({ cartId: id, checkoutUrl: created.checkoutUrl });
          }

          const cart = await callCart({ op: "add", cartId: id, variantId: merchandiseId, quantity });
          set({
            cartId: cart.id,
            lines: mapLines(cart),
            checkoutUrl: cart.checkoutUrl,
            totalAmount: cart.totalAmount,
            currencyCode: cart.currencyCode,
          });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Could not add to cart" });
        } finally {
          set({ loading: false });
        }
      },

      update: async (lineId, quantity) => {
        const id = get().cartId;
        if (!id) return;
        if (quantity < 1) return get().remove(lineId);

        set({ loading: true, error: null });
        try {
          const cart = await callCart({ op: "update", cartId: id, lineId, quantity });
          set({
            lines: mapLines(cart),
            checkoutUrl: cart.checkoutUrl,
            totalAmount: cart.totalAmount,
            currencyCode: cart.currencyCode,
          });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Could not update cart" });
        } finally {
          set({ loading: false });
        }
      },

      remove: async (lineId) => {
        const id = get().cartId;
        if (!id) return;

        set({ loading: true, error: null });
        try {
          const cart = await callCart({ op: "remove", cartId: id, lineId });
          set({
            lines: mapLines(cart),
            checkoutUrl: cart.checkoutUrl,
            totalAmount: cart.totalAmount,
            currencyCode: cart.currencyCode,
          });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Could not remove item" });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ cartId: null, lines: [], checkoutUrl: null, totalAmount: 0 }),

      total: () => get().totalAmount,
    }),
    {
      name: "marmara-cart",
      // Satırlar her zaman Shopify'dan gelir; sadece sepet kimliğini sakla
      partialize: (s) => ({ cartId: s.cartId }),
    },
  ),
);
