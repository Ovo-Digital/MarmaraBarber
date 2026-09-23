"use client";

/**
 * Ortak paneli (/partner) — girişten sonra gelinen sayfa.
 *
 * Üç durum var:
 *  - Giriş yapılmamış  → girişe yönlendiren mesaj
 *  - Giriş yapılmış ama ortak değil → başvuruya yönlendiren mesaj
 *  - Onaylı ortak → panel
 *
 * Ortaklık Shopify müşteri etiketinden okunuyor (lib/wholesale.ts). Bu kapı
 * yalnızca arayüzde: ortağa özel fiyat Shopify tarafında tanımlanmadıkça
 * herkes perakende fiyatını görür.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/dil";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import { toptanOrtagiMi } from "@/lib/wholesale";
import { useAuthStore } from "@/store/auth-store";

export function PartnerPage() {
  useKoyuUstBildir();
  const t = useT();
  const router = useRouter();
  const musteri = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);
  const logout = useAuthStore((s) => s.logout);
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const ortak = toptanOrtagiMi(musteri);

  const kartlar = [
    { baslik: "Shop the range", metin: "Browse and order the full catalogue.", href: "/products" },
    { baslik: "Your orders", metin: "Track orders and reorder.", href: "/account?section=orders" },
    { baslik: "Account details", metin: "Addresses and contact information.", href: "/account" },
    { baslik: "Talk to us", metin: "Stock, display or campaign questions.", href: "/iletisim" },
  ];

  return (
    <section data-dark-top className="relative min-h-[80vh] overflow-hidden" style={{ background: "var(--lx-ink)" }}>
      <div aria-hidden="true" className="lx-kirmizi-isik" />

      <div className="sg-container relative" style={{ paddingTop: "clamp(120px,14vh,190px)", paddingBottom: "clamp(64px,8vw,120px)" }}>
        {/* Oturum durumu tarayıcıda çözülene kadar hiçbir şey iddia etme */}
        {!hydrated ? (
          <p className="lx-eyebrow">{t("Loading…")}</p>
        ) : !musteri ? (
          <Durum
            baslik={t("Partner portal")}
            metin={t("Sign in with your partner account to continue.")}
            eylem={{ etiket: t("Partner sign in"), href: "/wholesale?tab=login#portal" }}
          />
        ) : !ortak ? (
          <Durum
            baslik={t("Not a partner yet")}
            metin={t("You're signed in as {email}. This account isn't set up for wholesale yet — apply and we'll activate it once approved.", { email: musteri.email })}
            eylem={{ etiket: t("Apply for wholesale"), href: "/wholesale#portal" }}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="lx-eyebrow mb-3">{t("Wholesale partner")}</p>
                <h1
                  className="uppercase text-white"
                  style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(34px,5vw,72px)", lineHeight: 1.02 }}
                >
                  {musteri.firstName ? t("Welcome back, {name}", { name: musteri.firstName }) : t("Welcome back")}
                </h1>
                <p className="mt-4 text-[15px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {musteri.email}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setCustomer(null);
                  router.push("/");
                }}
                className="lx-link"
                style={{ color: "#fff" }}
              >
                {t("Sign out")}
              </button>
            </div>

            <ul className="mt-12 m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {kartlar.map((k) => (
                <li key={k.href}>
                  <Link href={k.href} className="lx-ortak-kart flex h-full flex-col justify-between gap-8 p-7 sm:p-9">
                    <span>
                      <span className="block uppercase" style={{ fontFamily: "var(--font-owners-black)", fontSize: 22 }}>
                        {t(k.baslik)}
                      </span>
                      <span className="mt-2 block text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {t(k.metin)}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ color: "var(--sg-red)" }}>→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("Prices shown are retail prices. Your partner terms are applied by our team on your order.")}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function Durum({
  baslik,
  metin,
  eylem,
}: {
  baslik: string;
  metin: string;
  eylem: { etiket: string; href: string };
}) {
  return (
    <div className="max-w-[46ch]">
      <p className="lx-eyebrow mb-3">{baslik}</p>
      <p className="text-[17px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
        {metin}
      </p>
      <Link href={eylem.href} className="lx-btn-outline mt-8" style={{ color: "#fff" }}>
        {eylem.etiket}
      </Link>
    </div>
  );
}
