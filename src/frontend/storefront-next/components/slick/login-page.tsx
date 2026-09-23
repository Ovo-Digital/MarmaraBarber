"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/dil";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LxEtiket, LxHata, lxAlanKoyu } from "@/components/slick/auth-form";
import { apiLogin } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { DEMO_MUSTERI, demoGirisi } from "@/lib/demo-customer";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";

/**
 * Giriş sayfası — üstte koyu bant, altta beyaz zeminde tek kolon form.
 *
 * Sepet kimliği girişle birlikte gönderiliyor: misafirken doldurulan sepet
 * hesaba bağlansın, giriş yapınca kaybolmasın.
 */
export function LoginPage() {
  // Sayfanın üstü koyu: başlık şeffaf durup bandın üzerinde yüzsün
  useKoyuUstBildir();
  const t = useT();
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
    onError: (e) => setHata(e instanceof Error ? t(e.message) : t("Sign-in failed.")),
  });

  return (
    <div data-dark-top className="relative overflow-hidden" style={{ background: "var(--lx-ink)" }}>
        <div aria-hidden="true" className="lx-kirmizi-isik" />
        <div
          className="sg-container relative"
          style={{ paddingTop: "clamp(120px, 14vh, 180px)", paddingBottom: "clamp(72px, 8vw, 130px)" }}
        >
          <div className="lx-cam-panel mx-auto w-full max-w-[460px] p-7 sm:p-10">
            {/* Başlık formun kendi üstünde: ayrı koyu bant sayfayı gereksiz uzatıyordu */}
            <div className="mb-10 text-center">
              <p className="lx-eyebrow mb-3">{t("Account")}</p>
              <h1
                className="uppercase"
                style={{
                  fontFamily: "var(--font-owners-black)",
                  fontWeight: 900,
                  fontSize: "clamp(30px, 3.4vw, 44px)",
                  lineHeight: 1.02,
                  color: "#fff",
                }}
              >
                {t("Sign in")}
              </h1>
              <p className="mt-3 text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("Track your orders and check out faster.")}
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setHata(null);
                // Geliştirme kısayolu: Shopify'a gitmeden hesap ekranlarını aç
                if (demoGirisi(email)) {
                  setCustomer(DEMO_MUSTERI);
                  router.push("/account?demo=1");
                  return;
                }
                islem.mutate();
              }}
            >
              <div>
                <LxEtiket htmlFor="email" zorunlu koyu>
                  {t("Email")}
                </LxEtiket>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={lxAlanKoyu}
                />
              </div>

              <div>
                <LxEtiket htmlFor="sifre" zorunlu koyu>
                  {t("Password")}
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
                  className={lxAlanKoyu}
                />
              </div>

              {hata ? <LxHata mesaj={hata} koyu /> : null}

              <button
                type="submit"
                disabled={islem.isPending}
                className="lx-btn-kirmizi w-full"
                style={{ minHeight: 52 }}
              >
                {islem.isPending ? t("Signing in…") : t("Sign in")}
              </button>
            </form>

            <div
              className="mt-8 flex items-center justify-between pt-6 text-[12px]"
              style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}
            >
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{t("New here?")}</span>
              <Link
                href="/uye-ol"
                className="uppercase tracking-[0.14em]"
                style={{ color: "#fff", fontFamily: "var(--font-owners)" }}
              >
                {t("Create account")} →
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}
