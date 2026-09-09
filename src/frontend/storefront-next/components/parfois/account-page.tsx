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
import { DEMO_MUSTERI, demoModu } from "@/lib/demo-customer";

function AccountPasswordStub() {
  return (
    <div className="border border-[#e0e0e0] p-8 text-[12px] text-[#666]">
      <h2 className="lx-filtre-baslik mb-4">Change password</h2>
      <p>
        To change your password, sign out and use the &quot;Forgot password&quot; link on the sign-in
        page.
      </p>
    </div>
  );
}

export function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeSection = parseAccountSection(searchParams.get("section"));
  /* Tasarımı görmek için: /account?demo=1 — sadece geliştirmede çalışır,
     Shopify'a istek gitmez, mağazada kayıt oluşmaz. */
  const demo = demoModu(searchParams.get("demo"));
  const { customer: storedCustomer, logout, setCustomer, hydrated, fetchCustomer } = useAuthStore();

  useEffect(() => {
    if (!hydrated) void fetchCustomer();
  }, [hydrated, fetchCustomer]);

  const { data: sunucuMusteri, isLoading } = useQuery({
    queryKey: ["customer"],
    queryFn: apiGetCustomer,
    enabled: hydrated && !demo,
    initialData: storedCustomer ?? undefined,
    retry: false,
  });

  const customer = demo ? DEMO_MUSTERI : sunucuMusteri;

  useEffect(() => {
    if (!demo && hydrated && customer === null && !isLoading) {
      router.replace("/login");
    }
  }, [customer, demo, hydrated, isLoading, router]);

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

  if (!demo && (!hydrated || isLoading)) {
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
    <div className="bg-white">
      <div
        className="sg-container"
        style={{ paddingTop: "clamp(48px, 5vw, 80px)", paddingBottom: "clamp(64px, 7vw, 110px)" }}
      >
        {/* Başlık ve çıkış aynı satırda; ayrı koyu bant kaldırıldı */}
        <div
          className="mb-10 flex flex-wrap items-end justify-between gap-5 pb-6"
          style={{ borderBottom: "1px solid rgba(20,17,15,0.12)" }}
        >
          <div className="min-w-0">
            <h1
              className="uppercase"
              style={{
                fontFamily: "var(--font-owners-black)",
                fontWeight: 900,
                fontSize: "clamp(28px, 3vw, 40px)",
                lineHeight: 1.02,
                color: "var(--lx-ink)",
              }}
            >
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "My account"}
            </h1>
            <p className="mt-2 text-[13px]" style={{ color: "rgba(20,17,15,0.55)" }}>
              {customer.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="uppercase tracking-[0.14em]"
            style={{
              minHeight: 42,
              padding: "0 20px",
              border: "1px solid rgba(20,17,15,0.25)",
              color: "var(--lx-ink)",
              fontFamily: "var(--font-owners)",
              fontSize: "11px",
            }}
          >
            Sign out
          </button>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <AccountSidebar active={activeSection} onSelect={setSection} />

          <div className="min-w-0 flex-1">
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
    </div>
  );
}
