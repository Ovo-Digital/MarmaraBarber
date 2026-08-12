import { create } from "zustand";
import type { Customer } from "@/types/customer";
import { apiGetCustomer, apiLogout } from "@/services/api/storefront-api";

interface AuthState {
  customer: Customer | null;
  loading: boolean;
  hydrated: boolean;
  setCustomer: (customer: Customer | null) => void;
  fetchCustomer: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  loading: false,
  hydrated: false,
  setCustomer: (customer) => set({ customer, hydrated: true }),
  fetchCustomer: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const customer = await apiGetCustomer();
      set({ customer, hydrated: true });
    } catch {
      set({ customer: null, hydrated: true });
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    await apiLogout();
    set({ customer: null });
  },
}));
