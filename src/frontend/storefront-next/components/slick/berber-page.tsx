"use client";

/**
 * /berber — berber ortaklık programı sayfası.
 *
 * Kurgu lv3.com/pages/programs ile aynı mantıkta: kademeler yan yana, her
 * kademede oran + avantaj listesi + koşul, altında tek bir başvuru. Fark:
 * lv3'te sadakat puanı yok; burada var, çünkü berber düzenli alıyor ve
 * kademeyi harcaması belirliyor.
 *
 * Sayfanın sırası satın alma kararının sırası:
 *   1. ne kazanıyorum (kademeler)
 *   2. nasıl görünecek (stand kurma)
 *   3. devam ettikçe ne oluyor (puan)
 *   4. nasıl katılıyorum (başvuru / giriş)
 *
 * İÇERİK YER TUTUCU: oranlar, eşikler ve avantaj metinleri lib/berber.ts'te.
 * Marka kendi şartlarını verince orası ve Shopify'daki indirim kodları
 * BİRLİKTE güncellenmeli.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApplicationForm } from "@/components/slick/application-form";
import { LxEtiket, LxHata, lxAlanKoyu } from "@/components/slick/auth-form";
import { BerberStand } from "@/components/slick/berber-stand";
import { KADEMELER, kademeBul } from "@/lib/berber";
import { berberDurumu, DONEM_AY, PUAN_KURU } from "@/lib/berber-puan";
import { DEMO_MUSTERI, demoGirisi } from "@/lib/demo-customer";
import { useT } from "@/lib/i18n/dil";
import { formatMoney } from "@/lib/money";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import { apiLogin } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import type { Product } from "@/types/commerce";
import "@/components/slick/berber.css";

type Sekme = "basvuru" | "giris";

export function BerberPage({ urunler }: { urunler: Product[] }) {
  useKoyuUstBildir();
  const t = useT();
  const params = useSearchParams();
  const musteri = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [sekme, setSekme] = useState<Sekme>(params.get("tab") === "login" ? "giris" : "basvuru");
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (params.get("tab") === "login") setSekme("giris");
  }, [params]);

  const kademe = kademeBul(musteri);
  const berber = Boolean(kademe);
  const durum = berberDurumu(musteri);

  const portalaGit = (hangi: Sekme) => {
    setSekme(hangi);
    portalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── 1. Açılış ─────────────────────────────────────────────────── */}
      <section data-dark-top className="relative isolate overflow-hidden" style={{ background: "var(--lx-ink)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/learn-the-craft.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.05)" }}
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(180deg, rgba(20,17,15,.5) 0%, rgba(20,17,15,.42) 45%, rgba(20,17,15,.96) 100%)" }}
        />
        <div className="sg-container flex min-h-[64vh] flex-col justify-end pb-14 pt-36 sm:pb-20">
          <p className="lx-eyebrow mb-4">{t("Barber programme")}</p>
          <h1
            className="max-w-[17ch] uppercase text-white"
            style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(38px, 7vw, 104px)", lineHeight: 0.94, letterSpacing: "-0.01em" }}
          >
            {t("Behind the chair, on better terms")}
          </h1>
          <p className="mt-5 max-w-[50ch] text-[16px] leading-relaxed sm:text-[18px]" style={{ color: "rgba(255,255,255,0.72)" }}>
            {t("Barber pricing on the full range, a stand built for your shop, and terms that improve as you keep ordering.")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {hydrated && berber ? (
              <Link href="/berber/panel" className="lx-btn-kirmizi" style={{ minHeight: 52, paddingInline: 32 }}>
                {t("Go to your barber panel")}
              </Link>
            ) : (
              <>
                <button type="button" onClick={() => portalaGit("basvuru")} className="lx-btn-outline" style={{ color: "#fff" }}>
                  {t("Apply as a barber")}
                </button>
                <button
                  type="button"
                  onClick={() => portalaGit("giris")}
                  className="lx-btn-outline"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
                >
                  {t("Barber sign in")}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. Kademeler ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="sg-container" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(28px,3vw,44px)" }}>
          <p className="lx-eyebrow mb-2">{t("Tiers")}</p>
          <h2 className="lx-title max-w-[20ch]">{t("Three tiers. You move up by ordering.")}</h2>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.62)" }}>
            {t("Every approved barber starts on Bronze. Your spend over the last {months} months decides the tier — we move you up, you don't have to ask.", { months: String(DONEM_AY) })}
          </p>
        </div>

        <div className="sg-container" style={{ paddingBottom: "clamp(56px,7vw,110px)" }}>
          <div className="brb-kademeler">
            {KADEMELER.map((k, i) => (
              <article
                key={k.kod}
                className="brb-kademe"
                /* Ortadaki kademe koyu zeminde: en çok tercih edilen o */
                data-one={i === 1 ? "" : undefined}
                data-benim={kademe?.kod === k.kod ? "" : undefined}
              >
                {kademe?.kod === k.kod ? (
                  <span className="brb-kademe-rozet">{t("Your tier")}</span>
                ) : i === 1 ? (
                  <span className="brb-kademe-rozet">{t("Most chosen")}</span>
                ) : i === 0 ? (
                  <span className="brb-kademe-rozet">{t("Entry level")}</span>
                ) : null}

                <h3 className="brb-kademe-ad">{t(k.ad)}</h3>
                <span className="brb-kademe-oran">
                  −{k.indirim}
                  <small>%</small>
                </span>
                <p className="brb-kademe-ozet">{t(k.ozet)}</p>

                <ul className="brb-kademe-liste">
                  {k.avantajlar.map((a) => (
                    <li key={a}>
                      <span aria-hidden="true" className="brb-kademe-tik" />
                      <span>{t(a)}</span>
                    </li>
                  ))}
                </ul>

                <p className="brb-kademe-esik">
                  {k.esik === 0
                    ? t("From your first order")
                    : t("From {amount} in the last {months} months", {
                        amount: formatMoney(k.esik, durum.currencyCode),
                        months: String(DONEM_AY),
                      })}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-[13px]" style={{ color: "rgba(20,17,15,0.5)" }}>
            {t("Tier pricing is applied to your basket automatically once you're signed in — nothing to type in at checkout.")}
          </p>
        </div>
      </section>

      {/* ── 3. Standını kur ───────────────────────────────────────────── */}
      <BerberStand urunler={urunler} kademe={kademe} girisli={Boolean(musteri)} />

      {/* ── 4. Sadakat puanı ──────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="sg-container" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(56px,7vw,110px)" }}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <p className="lx-eyebrow mb-2">{t("Loyalty")}</p>
              <h2 className="lx-title max-w-[18ch]">{t("Every order counts towards the next tier")}</h2>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.62)" }}>
                {t("Points come straight from your orders — {rate} point for every unit you spend. Nothing to collect, nothing to lose: your order history is the record.", { rate: String(PUAN_KURU) })}
              </p>
              {hydrated && berber ? (
                <Link href="/berber/panel" className="lx-btn mt-8 w-fit">
                  {t("See your points")}
                </Link>
              ) : null}
            </div>

            <ol className="m-0 list-none p-0">
              {[
                { no: "01", baslik: t("You order"), metin: t("Barber pricing is already on your basket — the discount is a real Shopify discount, applied before checkout.") },
                { no: "02", baslik: t("Points add up"), metin: t("Paid orders turn into points. A refunded order drops out again, so the number always matches reality.") },
                { no: "03", baslik: t("Your tier moves up"), metin: t("Pass a tier threshold and we upgrade your account. The better pricing applies to your next basket.") },
              ].map((s) => (
                <li key={s.no} className="grid grid-cols-[52px_minmax(0,1fr)] gap-5 py-7" style={{ borderTop: "1px solid rgba(20,17,15,0.12)" }}>
                  <span style={{ fontFamily: "var(--font-owners)", fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-red)" }}>
                    [ {s.no} ]
                  </span>
                  <span>
                    <span className="block uppercase" style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: 19, color: "var(--lx-ink)" }}>
                      {s.baslik}
                    </span>
                    <span className="mt-2 block text-[14px] leading-relaxed" style={{ color: "rgba(20,17,15,0.6)" }}>
                      {s.metin}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 5. Başvuru / giriş ────────────────────────────────────────── */}
      <section id="portal" ref={portalRef} className="relative scroll-mt-24 overflow-hidden" style={{ background: "var(--lx-ink)" }}>
        <div aria-hidden="true" className="lx-kirmizi-isik" />
        <div className="sg-container relative" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(64px,7vw,110px)" }}>
          <div className="mx-auto max-w-[720px]">
            {hydrated && berber ? (
              <div className="lx-cam-panel p-8 text-center sm:p-12">
                <p className="lx-eyebrow mb-3">{t("{tier} partner", { tier: t(kademe?.ad ?? "") })}</p>
                <h2 className="lx-title" style={{ color: "#fff" }}>
                  {musteri?.firstName ? t("Welcome back, {name}", { name: musteri.firstName }) : t("Welcome back")}
                </h2>
                <Link href="/berber/panel" className="lx-btn-kirmizi mt-8 px-10" style={{ minHeight: 52 }}>
                  {t("Go to your barber panel")}
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <p className="lx-eyebrow mb-2">{t("Barber portal")}</p>
                  <h2 className="lx-title" style={{ color: "#fff" }}>
                    {sekme === "giris" ? t("Barber sign in") : t("Apply as a barber")}
                  </h2>
                </div>

                {hydrated && musteri && !berber ? (
                  <p
                    className="mb-6 px-4 py-3 text-center text-[13px]"
                    style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.75)" }}
                  >
                    {t("You're signed in as {email}. This account isn't set up as a barber yet — apply below and we'll activate it once approved.", { email: musteri.email })}
                  </p>
                ) : null}

                <div role="tablist" aria-label={t("Barber portal")} className="lx-sekmeler lx-sekmeler--koyu mb-8">
                  {(
                    [
                      ["basvuru", t("Apply")],
                      ["giris", t("Barber sign in")],
                    ] as [Sekme, string][]
                  )
                    .filter(([id]) => !(musteri && id === "giris"))
                    .map(([id, etiket]) => (
                      <button key={id} type="button" role="tab" aria-selected={sekme === id} onClick={() => setSekme(id)} className="lx-sekme">
                        {etiket}
                      </button>
                    ))}
                </div>

                <div className="lx-cam-panel p-6 sm:p-10">
                  {sekme === "giris" && !musteri ? (
                    <BerberGirisi onBasvur={() => setSekme("basvuru")} />
                  ) : (
                    <ApplicationForm type="barber" koyu />
                  )}
                </div>

                <p className="mt-6 text-center text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {t("Buying for yourself, not for a shop?")}{" "}
                  <Link href="/uye-ol" className="underline underline-offset-4" style={{ color: "#fff" }}>
                    {t("Create a customer account")}
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

function BerberGirisi({ onBasvur }: { onBasvur: () => void }) {
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
      router.push("/berber/panel");
    },
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
          router.push("/berber/panel");
          return;
        }
        islem.mutate();
      }}
    >
      <p className="text-center text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
        {t("Approved barbers sign in here. Your tier pricing lands on the basket by itself.")}
      </p>
      <div>
        <LxEtiket htmlFor="brb-email" zorunlu koyu>{t("Email")}</LxEtiket>
        <input id="brb-email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={lxAlanKoyu} />
      </div>
      <div>
        <LxEtiket htmlFor="brb-sifre" zorunlu koyu>{t("Password")}</LxEtiket>
        <input id="brb-sifre" type="password" required minLength={5} autoComplete="current-password" value={sifre}
          onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" className={lxAlanKoyu} />
      </div>
      {hata ? <LxHata mesaj={hata} koyu /> : null}
      <button type="submit" disabled={islem.isPending} className="lx-btn-kirmizi w-full" style={{ minHeight: 52 }}>
        {islem.isPending ? t("Signing in…") : t("Sign in")}
      </button>
      <p className="text-center text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
        {t("Not a barber partner yet?")}{" "}
        <button type="button" onClick={onBasvur} className="underline underline-offset-4" style={{ color: "#fff" }}>
          {t("Apply as a barber")}
        </button>
      </p>
    </form>
  );
}
