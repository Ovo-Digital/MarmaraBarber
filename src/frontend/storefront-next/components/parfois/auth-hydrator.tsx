"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthHydrator() {
  const fetchCustomer = useAuthStore((s) => s.fetchCustomer);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) void fetchCustomer();
  }, [fetchCustomer, hydrated]);

  return null;
}
