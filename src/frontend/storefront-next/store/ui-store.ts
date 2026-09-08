"use client";

import { create } from "zustand";

type UiState = {
  cartDrawerOpen: boolean;
  /** Sepet imleçle mi açıldı? Öyleyse imleç ayrılınca kapanır. */
  cartDrawerHover: boolean;
  /** Sayfanın en üstünde koyu bir hero bandı var mı? Header buna göre şeffaf durur. */
  koyuUst: boolean;
  setKoyuUst: (v: boolean) => void;
  openCartDrawer: (hoverIle?: boolean) => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartDrawerOpen: false,
  cartDrawerHover: false,
  koyuUst: false,
  setKoyuUst: (v) => set({ koyuUst: v }),
  openCartDrawer: (hoverIle = false) => set({ cartDrawerOpen: true, cartDrawerHover: hoverIle }),
  closeCartDrawer: () => set({ cartDrawerOpen: false, cartDrawerHover: false }),
  toggleCartDrawer: () => set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen, cartDrawerHover: false })),
}));
