"use client";

/**
 * Berber paneli (/berber/panel) — girişten sonra gelinen sayfa.
 *
 * Üç durum:
 *   - giriş yok            → girişe yönlendir
 *   - giriş var, berber yok → başvuruya yönlendir
 *   - onaylı berber        → puan, kademe ve ilerleme
 *
 * Kademeyi açan şey Shopify müşteri etiketi; puan ve eşik ilerlemesi sipariş
 * geçmişinden hesaplanıyor (lib/berber-puan.ts). İkisi ayrışabilir: eşiği
 * geçmiş ama etiketi hâlâ alt kademede olan berbere burada "yükseltiyoruz"
 * yazıyor — ekranda hak etmediği indirimi göstermemek için.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KADEMELER } from "@/lib/berber";
import { berberDurumu, DONEM_AY } from "@/lib/berber-puan";
import { useT } from "@/lib/i18n/dil";
import { formatMoney } from "@/lib/money";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import { useAuthStore } from "@/store/auth-store";
import "@/components/slick/berber.css";

export function BerberPanel() {
  useKoyuUstBildir();
  const t = useT();
  const router = useRouter();
  const musteri = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);
  const logout = useAuthStore((s) => s.logout);
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const durum = berberDurumu(musteri);
  const kademe = durum.kademe;

  const kartlar = [
    { baslik: "Build your stand", metin: "Pick the products, see the stand, order it in one go.", href: "/berber#portal" },
    { baslik: "Shop the range", metin: "Your tier pricing is already on the basket.", href: "/products" },
    { baslik: "Your orders", metin: "Track orders and reorder.", href: "/account?section=orders" },
    { baslik: "Talk to us", metin: "Stock, display or education questions.", href: "/iletisim" },
  ];

  return (
    <section data-dark-top className="relative min-h-[80vh] overflow-hidden" style={{ background: "var(--lx-ink)" }}>
      <div aria-hidden="true" className="lx-kirmizi-isik" />

      <div className="sg-container relative" style={{ paddingTop: "clamp(120px,14vh,190px)", paddingBottom: "clamp(64px,8vw,120px)" }}>
        {/* Oturum tarayıcıda çözülene kadar hiçbir şey iddia etme */}
        {!hydrated ? (
          <p className="lx-eyebrow">{t("Loading…")}</p>
        ) : !musteri ? (
          <Durum
            baslik={t("Barber panel")}
            metin={t("Sign in with your barber account to continue.")}
            eylem={{ etiket: t("Barber sign in"), href: "/berber?tab=login#portal" }}
          />
        ) : !kademe ? (
          <Durum
            baslik={t("Not a barber partner yet")}
            metin={t("You're signed in as {email}. This account isn't set up as a barber yet — apply and we'll activate it once approved.", { email: musteri.email })}
            eylem={{ etiket: t("Apply as a barber"), href: "/berber#portal" }}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="lx-eyebrow mb-3">{t("{tier} partner", { tier: t(kademe.ad) })}</p>
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

            {/* ── Puan + kademe ilerlemesi ──────────────────────────── */}
            <div className="mt-12 grid gap-3 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div className="brb-puan-kart">
                <span className="brb-puan-sayi">
                  {durum.puan.toLocaleString()}
                  <small>{t("Loyalty points")}</small>
                </span>
                <p className="mt-6 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {t("From your paid orders. Refunded orders drop back out.")}
                </p>
              </div>

              <div className="brb-puan-kart">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="lx-eyebrow mb-2">{t("Your tier")}</p>
                    <p
                      className="uppercase"
                      style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1, color: "#fff" }}
                    >
                      {t(kademe.ad)} · −{kademe.indirim}%
                    </p>
                  </div>
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {t("{amount} in the last {months} months", {
                      amount: formatMoney(durum.harcama, durum.currencyCode),
                      months: String(DONEM_AY),
                    })}
                  </p>
                </div>

                <div className="brb-cubuk mt-6">
                  <span style={{ width: `${Math.round(durum.ilerleme * 100)}%` }} />
                </div>

                <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {durum.yukseltmeBekliyor
                    ? t("You've passed the {tier} threshold — we're upgrading your account and the new pricing applies to your next basket.", { tier: t(durum.hakEdilen.ad) })
                    : durum.sonraki
                      ? t("{amount} more to {tier} and −{rate}%.", {
                          amount: formatMoney(durum.kalan, durum.currencyCode),
                          tier: t(durum.sonraki.ad),
                          rate: String(durum.sonraki.indirim),
                        })
                      : t("You're on our best terms. Thanks for sticking with us.")}
                </p>

                {/* Kademe şeridi: nerede olduğun bir bakışta */}
                <ol className="m-0 mt-6 flex list-none gap-2 p-0">
                  {KADEMELER.map((k) => (
                    <li
                      key={k.kod}
                      className="flex-1 px-3 py-2.5 text-center"
                      style={{
                        border: `1px solid ${k.kod === kademe.kod ? "var(--sg-red)" : "rgba(255,255,255,0.14)"}`,
                        background: k.kod === kademe.kod ? "rgba(225,6,0,0.14)" : "transparent",
                        fontFamily: "var(--font-owners)",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: k.kod === kademe.kod ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {t(k.ad)}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <ul className="mt-3 m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
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

            <p className="mt-10 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("Tier pricing is applied to your basket as a discount once you're signed in, and it carries through to checkout.")}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function Durum({ baslik, metin, eylem }: { baslik: string; metin: string; eylem: { etiket: string; href: string } }) {
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
