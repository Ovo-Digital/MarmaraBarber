"use client";

/**
 * Wholesale sayfası: avantajlar + ortak girişi + başvuru.
 *
 * Slick Gorilla toptan satış için ayrı bir Shopify mağazası
 * (wholesale.slickgorilla.co.uk) kullanıyor ve kayıt olmak isteyeni o alan
 * adına gönderiyor. Burada ziyaretçi siteden çıkmıyor: giriş ve başvuru aynı
 * sayfada, sekmelerle. Ortak olup olmadığı Shopify müşteri etiketinden
 * anlaşılıyor — ayrıntı lib/wholesale.ts.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApplicationForm } from "@/components/slick/application-form";
import { LxEtiket, LxHata, lxAlan, lxAlanStil } from "@/components/slick/auth-form";
import { PageHero } from "@/components/slick/page-hero";
import { DEMO_MUSTERI, demoGirisi } from "@/lib/demo-customer";
import { useT } from "@/lib/i18n/dil";
import { ORTAK_AVANTAJLARI, toptanOrtagiMi } from "@/lib/wholesale";
import { apiLogin } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

type Sekme = "giris" | "basvuru";

export function WholesalePage() {
  const t = useT();
  const params = useSearchParams();
  const musteri = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [sekme, setSekme] = useState<Sekme>(params.get("tab") === "login" ? "giris" : "basvuru");

  // Başlıktaki "Partner login" bağlantısı ?tab=login ile gelir
  useEffect(() => {
    if (params.get("tab") === "login") setSekme("giris");
  }, [params]);

  const ortak = toptanOrtagiMi(musteri);

  return (
    <>
      <PageHero
        eyebrow="Wholesale"
        title="Stock Marmara Barber"
        subline="Retailers, distributors and barbershop chains — tell us about your business and we'll come back to you."
      />

      {/* ── Avantajlar ─────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="sg-container" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(40px,5vw,72px)" }}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="lx-eyebrow mb-2">{t("Partner benefits")}</p>
              <h2 className="lx-title">{t("Why partner with us")}</h2>
            </div>
            <a href="#portal" className="lx-link">{t("Apply or sign in")} ↓</a>
          </div>
          <ol className="m-0 grid list-none gap-px p-0 sm:grid-cols-2 lg:grid-cols-3" style={{ background: "rgba(20,17,15,0.1)" }}>
            {ORTAK_AVANTAJLARI.map((a, i) => (
              <li key={a.baslik} className="lx-avantaj bg-white p-7 sm:p-9">
                <span className="block text-[12px] tracking-[0.16em]" style={{ color: "var(--sg-red)", fontFamily: "var(--font-owners)" }}>
                  [ {String(i + 1).padStart(2, "0")} ]
                </span>
                <p className="mt-4 uppercase" style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "22px", lineHeight: 1.1, color: "var(--lx-ink)" }}>
                  {t(a.baslik)}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(20,17,15,0.62)" }}>
                  {t(a.metin)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Ortak girişi / başvuru ────────────────────────────────────── */}
      <section id="portal" className="scroll-mt-24" style={{ background: "var(--lx-bone)" }}>
        <div className="sg-container" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(64px,7vw,110px)" }}>
          <div className="mx-auto max-w-[720px]">
            {hydrated && musteri && ortak ? (
              <OrtakPaneli ad={musteri.firstName} />
            ) : (
              <>
                <div className="mb-8 text-center">
                  <p className="lx-eyebrow mb-2">{t("Partner portal")}</p>
                  <h2 className="lx-title">{sekme === "giris" ? t("Partner sign in") : t("Become a partner")}</h2>
                </div>

                {/* Oturum açık ama ortak değil */}
                {hydrated && musteri && !ortak ? (
                  <p className="mb-6 px-4 py-3 text-center text-[13px]" style={{ border: "1px solid rgba(20,17,15,0.18)", color: "rgba(20,17,15,0.72)", background: "#fff" }}>
                    {t("You're signed in as {email}. This account isn't set up for wholesale yet — apply below and we'll activate it once approved.", { email: musteri.email })}
                  </p>
                ) : null}

                <div role="tablist" aria-label={t("Partner portal")} className="lx-sekmeler mb-8">
                  {(
                    [
                      ["basvuru", t("Apply")],
                      ["giris", t("Partner sign in")],
                    ] as [Sekme, string][]
                  )
                    .filter(([id]) => !(musteri && id === "giris"))
                    .map(([id, etiket]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={sekme === id}
                        onClick={() => setSekme(id)}
                        className="lx-sekme"
                      >
                        {etiket}
                      </button>
                    ))}
                </div>

                <div className="bg-white p-6 sm:p-10" style={{ border: "1px solid rgba(20,17,15,0.1)" }}>
                  {sekme === "giris" && !musteri ? (
                    <OrtakGirisi onBasvur={() => setSekme("basvuru")} />
                  ) : (
                    <ApplicationForm type="wholesale" />
                  )}
                </div>

                <p className="mt-8 text-center text-[13px]" style={{ color: "rgba(20,17,15,0.55)" }}>
                  {t("Working behind the chair rather than buying to resell?")}{" "}
                  <Link href="/professional" style={{ color: "var(--sg-red)" }}>
                    {t("Register as a barber")}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function OrtakGirisi({ onBasvur }: { onBasvur: () => void }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const cartId = useShopifyCartStore((s) => s.cartId);

  // Başarılı girişte sayfada kalıyoruz: etikete göre panel ya da "henüz ortak değil" görünür
  const islem = useMutation({
    mutationFn: () => apiLogin(email, sifre, cartId ?? null),
    onSuccess: ({ customer }) => setCustomer(customer),
    onError: (e) => setHata(e instanceof Error ? t(e.message) : t("Sign-in failed.")),
  });

  return (
    <form
      className="mx-auto grid max-w-[420px] gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setHata(null);
        if (demoGirisi(email)) {
          setCustomer(DEMO_MUSTERI);
          return;
        }
        islem.mutate();
      }}
    >
      <p className="text-center text-[14px]" style={{ color: "rgba(20,17,15,0.6)" }}>
        {t("Approved partners sign in here to order and manage their account.")}
      </p>
      <div>
        <LxEtiket htmlFor="ws-email" zorunlu>{t("Email")}</LxEtiket>
        <input id="ws-email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={lxAlan} style={lxAlanStil} />
      </div>
      <div>
        <LxEtiket htmlFor="ws-sifre" zorunlu>{t("Password")}</LxEtiket>
        <input id="ws-sifre" type="password" required minLength={5} autoComplete="current-password" value={sifre}
          onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" className={lxAlan} style={lxAlanStil} />
      </div>
      {hata ? <LxHata mesaj={hata} /> : null}
      <button
        type="submit"
        disabled={islem.isPending}
        className="w-full uppercase tracking-[0.16em] disabled:opacity-60"
        style={{ minHeight: 52, background: "var(--lx-ink)", color: "#fff", fontFamily: "var(--font-owners)", fontSize: "12px" }}
      >
        {islem.isPending ? t("Signing in…") : t("Sign in")}
      </button>
      <p className="text-center text-[12px]" style={{ color: "rgba(20,17,15,0.55)" }}>
        {t("Not a partner yet?")}{" "}
        <button type="button" onClick={onBasvur} className="underline underline-offset-4" style={{ color: "var(--sg-red)" }}>
          {t("Apply for wholesale")}
        </button>
      </p>
    </form>
  );
}

function OrtakPaneli({ ad }: { ad?: string }) {
  const t = useT();
  const logout = useAuthStore((s) => s.logout);
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const kartlar = [
    { baslik: t("Shop the range"), metin: t("Browse and order the full catalogue."), href: "/products" },
    { baslik: t("Your orders"), metin: t("Track orders and reorder."), href: "/account?section=orders" },
    { baslik: t("Account details"), metin: t("Addresses and contact information."), href: "/account" },
    { baslik: t("Talk to us"), metin: t("Stock, display or campaign questions."), href: "/iletisim" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="lx-eyebrow mb-2">{t("Wholesale partner")}</p>
          <h2 className="lx-title">{ad ? t("Welcome back, {name}", { name: ad }) : t("Welcome back")}</h2>
        </div>
        <button
          type="button"
          onClick={async () => { await logout(); setCustomer(null); }}
          className="lx-link"
        >
          {t("Sign out")}
        </button>
      </div>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {kartlar.map((k) => (
          <li key={k.href}>
            <Link href={k.href} className="lx-yardim-kart flex h-full flex-col justify-between gap-6 p-6">
              <span>
                <span className="block uppercase" style={{ fontFamily: "var(--font-owners-black)", fontSize: 20, color: "var(--lx-ink)" }}>{k.baslik}</span>
                <span className="mt-2 block text-[14px]" style={{ color: "rgba(20,17,15,0.6)" }}>{k.metin}</span>
              </span>
              <span aria-hidden="true" style={{ color: "var(--sg-red)" }}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
