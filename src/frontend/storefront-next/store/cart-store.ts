import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cart } from "@/types/commerce";

interface CartState {
  cart: Cart | null;
  cartId: string | null;
  setCart: (cart: Cart) => void;
  setCartId: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      cartId: null,
      setCart: (cart) => set({ cart, cartId: cart.id }),
      setCartId: (id) => set({ cartId: id }),
      clearCart: () => set({ cart: null, cartId: null }),
    }),
    { name: "headless-cart" }
  )
);

interface WishlistState {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId) => set({ items: [...get().items, productId] }),
      remove: (productId) => set({ items: get().items.filter((id) => id !== productId) }),
      has: (productId) => get().items.includes(productId),
    }),
    { name: "headless-wishlist" }
  )
);

interface UiState {
  miniCartOpen: boolean;
  toggleMiniCart: () => void;
  closeMiniCart: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  miniCartOpen: false,
  toggleMiniCart: () => set((s) => ({ miniCartOpen: !s.miniCartOpen })),
  closeMiniCart: () => set({ miniCartOpen: false }),
}));
