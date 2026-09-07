"use client";

import { create } from "zustand";

type UiState = {
  cartDrawerOpen: boolean;
  /** Sayfanın en üstünde koyu bir hero bandı var mı? Header buna göre şeffaf durur. */
  koyuUst: boolean;
  setKoyuUst: (v: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartDrawerOpen: false,
  koyuUst: false,
  setKoyuUst: (v) => set({ koyuUst: v }),
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  toggleCartDrawer: () => set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen })),
}));
