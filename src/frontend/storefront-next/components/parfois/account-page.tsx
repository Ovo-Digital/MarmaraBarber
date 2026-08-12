"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountAddresses } from "./account/account-addresses";
import { AccountOrders } from "./account/account-orders";
import { AccountPersonalInfo } from "./account/account-personal-info";
import { AccountSidebar } from "./account/account-sidebar";
import { parseAccountSection, type AccountSection } from "./account/account-utils";
import { apiGetCustomer } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";

function AccountPasswordStub() {
  return (
    <div className="border border-[#e0e0e0] p-8 text-[12px] text-[#666]">
      <h2 className="text-[15px] font-semibold text-black mb-4">Şifre Değiştir</h2>
      <p>
        Şifrenizi değiştirmek için çıkış yapıp &quot;Şifremi Unuttum&quot; bağlantısını kullanabilir veya{" "}
        <a href="mailto:destek@dominant.com.tr" className="underline text-black">
          destek
        </a>{" "}
        ile iletişime geçebilirsiniz.
      </p>
    </div>
  );
}

export function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeSection = parseAccountSection(searchParams.get("section"));
  const { customer: storedCustomer, logout, setCustomer, hydrated, fetchCustomer } = useAuthStore();

  useEffect(() => {
    if (!hydrated) void fetchCustomer();
  }, [hydrated, fetchCustomer]);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer"],
    queryFn: apiGetCustomer,
    enabled: hydrated,
    initialData: storedCustomer ?? undefined,
    retry: false,
  });

  useEffect(() => {
    if (hydrated && customer === null && !isLoading) {
      router.replace("/login");
    }
  }, [customer, hydrated, isLoading, router]);

  const setSection = (section: AccountSection) => {
    const params = new URLSearchParams(searchParams.toString());
    if (section === "profile") {
      params.delete("section");
    } else {
      params.set("section", section);
    }
    const qs = params.toString();
    router.push(qs ? `/account?${qs}` : "/account");
  };

  const refreshCustomer = async () => {
    await queryClient.invalidateQueries({ queryKey: ["customer"] });
    await fetchCustomer();
  };

  const handleLogout = async () => {
    await logout();
    setCustomer(null);
    router.push("/");
  };

  if (!hydrated || isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 animate-pulse">
        <div className="flex gap-12">
          <div className="hidden lg:block h-64 w-[220px] bg-[#e5e5e5]" />
          <div className="flex-1 h-96 bg-[#e5e5e5]" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <AccountSidebar active={activeSection} onSelect={setSection} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="text-[10px] uppercase tracking-[0.12em] text-[#666] underline hover:text-black"
            >
              Çıkış Yap
            </button>
          </div>

          {activeSection === "profile" && (
            <AccountPersonalInfo customer={customer} onUpdated={refreshCustomer} />
          )}
          {activeSection === "addresses" && (
            <AccountAddresses customer={customer} onUpdated={refreshCustomer} />
          )}
          {activeSection === "orders" && <AccountOrders customer={customer} />}
          {activeSection === "password" && <AccountPasswordStub />}
        </div>
      </div>
    </div>
  );
}
