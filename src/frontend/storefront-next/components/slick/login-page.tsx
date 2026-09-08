"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageHero } from "@/components/slick/page-hero";
import { LxEtiket, LxHata, lxAlan, lxAlanStil } from "@/components/slick/auth-form";
import { apiLogin } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

/**
 * Giriş sayfası — üstte koyu bant, altta beyaz zeminde tek kolon form.
 *
 * Sepet kimliği girişle birlikte gönderiliyor: misafirken doldurulan sepet
 * hesaba bağlansın, giriş yapınca kaybolmasın.
 */
export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const cartId = useShopifyCartStore((s) => s.cartId);

  const islem = useMutation({
    mutationFn: () => apiLogin(email, sifre, cartId ?? null),
    onSuccess: ({ customer }) => {
      setCustomer(customer);
      router.push("/account");
    },
    onError: (e) => setHata(e instanceof Error ? e.message : "Sign-in failed."),
  });

  return (
    <>
      <PageHero eyebrow="Account" title="Sign in" subline="Track your orders and check out faster." />

      <div className="bg-white">
        <div
          className="sg-container"
          style={{ paddingTop: "clamp(48px, 5vw, 80px)", paddingBottom: "clamp(64px, 7vw, 120px)" }}
        >
          <div className="mx-auto w-full max-w-[440px]">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setHata(null);
                islem.mutate();
              }}
            >
              <div>
                <LxEtiket htmlFor="email" zorunlu>
                  Email
                </LxEtiket>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={lxAlan}
                  style={lxAlanStil}
                />
              </div>

              <div>
                <LxEtiket htmlFor="sifre" zorunlu>
                  Password
                </LxEtiket>
                <input
                  id="sifre"
                  type="password"
                  required
                  minLength={5}
                  autoComplete="current-password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="••••••••"
                  className={lxAlan}
                  style={lxAlanStil}
                />
              </div>

              {hata ? <LxHata mesaj={hata} /> : null}

              <button
                type="submit"
                disabled={islem.isPending}
                className="w-full disabled:opacity-60"
                style={{
                  minHeight: 52,
                  background: "var(--sg-red)",
                  color: "#ffffff",
                  fontFamily: "var(--font-owners)",
                  fontSize: "12px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {islem.isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div
              className="mt-8 flex items-center justify-between pt-6 text-[12px]"
              style={{ borderTop: "1px solid rgba(20,17,15,0.12)" }}
            >
              <span style={{ color: "rgba(20,17,15,0.55)" }}>New here?</span>
              <Link
                href="/uye-ol"
                className="uppercase tracking-[0.14em]"
                style={{ color: "var(--sg-red)", fontFamily: "var(--font-owners)" }}
              >
                Create account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
