"use client";

/**
 * Wholesale sayfası: program kademeleri + ortak girişi + başvuru.
 *
 * Kurgu lv3.com/pages/programs ile aynı mantıkta: her satış kanalı için ayrı
 * bir kademe, her kademede görsel + avantaj listesi + koşul + başvuru düğmesi.
 * Bir kademeden başvurulduğunda hangi program olduğu forma taşınıyor ve
 * başvuru notuna yazılıyor.
 *
 * İÇERİK YER TUTUCU — kademe metinleri ve görselleri
 * lib/wholesale-programs.ts'te. Görsel verilmeyen kademede tasarlanmış bir
 * boşluk (dev kademe numarası + kırmızı ışıma) çıkıyor.
 *
 * Slick Gorilla toptan satış için ayrı bir Shopify mağazası kullanıyor
 * (wholesale.slickgorilla.co.uk). Burada ziyaretçi siteden çıkmıyor: giriş ve
 * başvuru aynı sayfada. Ortaklık Shopify müşteri etiketinden anlaşılıyor —
 * ayrıntı lib/wholesale.ts.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApplicationForm } from "@/components/slick/application-form";
import { LxEtiket, LxHata, lxAlanKoyu } from "@/components/slick/auth-form";
import { DEMO_MUSTERI, demoGirisi } from "@/lib/demo-customer";
import { useT } from "@/lib/i18n/dil";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import { toptanOrtagiMi } from "@/lib/wholesale";
import { PROGRAMLAR } from "@/lib/wholesale-programs";
import { apiLogin } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

type Sekme = "giris" | "basvuru";

export function WholesalePage() {
  // Sayfanın üstü koyu: başlık şeffaf durup bandın üzerinde yüzsün
  useKoyuUstBildir();
  const t = useT();
  const params = useSearchParams();
  const musteri = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [sekme, setSekme] = useState<Sekme>(params.get("tab") === "login" ? "giris" : "basvuru");
  const [program, setProgram] = useState<string | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Başlıktaki "Partner login" bağlantısı ?tab=login ile gelir
  useEffect(() => {
    if (params.get("tab") === "login") setSekme("giris");
  }, [params]);

  const ortak = toptanOrtagiMi(musteri);

  const basvuruyaGit = (programBasligi?: string) => {
    if (programBasligi) setProgram(programBasligi);
    setSekme("basvuru");
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
          style={{ background: "linear-gradient(180deg, rgba(20,17,15,.55) 0%, rgba(20,17,15,.4) 45%, rgba(20,17,15,.96) 100%)" }}
        />
        <div className="sg-container flex min-h-[62vh] flex-col justify-end pb-14 pt-36 sm:pb-20">
          <p className="lx-eyebrow mb-4">{t("Wholesale")}</p>
          <h1
            className="max-w-[16ch] uppercase text-white"
            style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(38px, 7vw, 104px)", lineHeight: 0.94, letterSpacing: "-0.01em" }}
          >
            {t("Partner with Marmara Barber")}
          </h1>
          <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed sm:text-[18px]" style={{ color: "rgba(255,255,255,0.72)" }}>
            {t("Stock the range barbers already ask for — made in our own facilities since 1970.")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => basvuruyaGit()} className="lx-btn-outline" style={{ color: "#fff" }}>
              {t("Apply now")}
            </button>
            <button
              type="button"
              onClick={() => {
                setSekme("giris");
                portalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="lx-btn-outline"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
            >
              {t("Partner sign in")}
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Programlar ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="sg-container" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(32px,4vw,56px)" }}>
          <p className="lx-eyebrow mb-2">{t("Programmes")}</p>
          <h2 className="lx-title max-w-[18ch]">{t("Find the programme that fits your business")}</h2>
        </div>

        <div className="sg-container" style={{ paddingBottom: "clamp(56px,7vw,110px)" }}>
          <ol className="m-0 list-none space-y-px p-0">
            {PROGRAMLAR.map((p, i) => (
              <li key={p.id} className="lx-program grid gap-0 md:grid-cols-2">
                {/* Görsel tek sayıda satırda sağda: göz aşağı inerken zikzak yapsın */}
                <div className={`relative min-h-[240px] md:min-h-[380px] ${i % 2 ? "md:order-2" : ""}`}>
                  {p.gorsel ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.gorsel}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: "grayscale(1) contrast(1.04)" }}
                    />
                  ) : (
                    /* Fotoğraf gelene kadar: tasarlanmış boşluk */
                    <div className="lx-program-bos absolute inset-0 flex items-center justify-center">
                      <span aria-hidden="true" className="lx-kirmizi-isik" />
                      <span
                        aria-hidden="true"
                        className="relative"
                        style={{
                          fontFamily: "var(--font-owners-black)",
                          fontWeight: 900,
                          fontSize: "clamp(90px, 14vw, 190px)",
                          lineHeight: 1,
                          color: "rgba(255,255,255,0.07)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                  {p.rozet ? (
                    <span
                      className="absolute left-0 top-0 px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
                      style={{ background: "var(--sg-red)", color: "#fff", fontFamily: "var(--font-owners)" }}
                    >
                      {t(p.rozet)}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <span className="text-[12px] tracking-[0.16em]" style={{ color: "var(--sg-red)", fontFamily: "var(--font-owners)" }}>
                    [ {String(i + 1).padStart(2, "0")} ]
                  </span>
                  <h3
                    className="mt-4 uppercase"
                    style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(24px,2.6vw,38px)", lineHeight: 1.04, color: "var(--lx-ink)" }}
                  >
                    {t(p.baslik)}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.62)" }}>
                    {t(p.ozet)}
                  </p>

                  <ul className="mt-6 m-0 list-none space-y-2.5 p-0">
                    {p.avantajlar.map((a) => (
                      <li key={a} className="flex items-start gap-3 text-[14px]" style={{ color: "var(--lx-ink)" }}>
                        <span aria-hidden="true" className="lx-program-tik" />
                        <span>{t(a)}</span>
                      </li>
                    ))}
                  </ul>

                  {p.kosul ? (
                    <p
                      className="mt-6 inline-flex w-fit px-3 py-2 text-[11px] uppercase tracking-[0.12em]"
                      style={{ border: "1px solid rgba(20,17,15,0.2)", color: "rgba(20,17,15,0.6)", fontFamily: "var(--font-owners)" }}
                    >
                      {t(p.kosul)}
                    </p>
                  ) : null}

                  <button type="button" onClick={() => basvuruyaGit(p.baslik)} className="lx-btn mt-8 w-fit">
                    {t("Apply now")}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 3. Ortak girişi / başvuru ─────────────────────────────────── */}
      <section
        id="portal"
        ref={portalRef}
        className="relative scroll-mt-24 overflow-hidden"
        style={{ background: "var(--lx-ink)" }}
      >
        {/* Alttan yükselen kırmızı ışıma — "Find your formula" bandıyla aynı dil */}
        <div aria-hidden="true" className="lx-kirmizi-isik" />

        <div className="sg-container relative" style={{ paddingTop: "clamp(56px,6vw,96px)", paddingBottom: "clamp(64px,7vw,110px)" }}>
          <div className="mx-auto max-w-[720px]">
            {hydrated && musteri && ortak ? (
              <OrtakPaneli ad={musteri.firstName} />
            ) : (
              <>
                <div className="mb-8 text-center">
                  <p className="lx-eyebrow mb-2">{t("Partner portal")}</p>
                  <h2 className="lx-title" style={{ color: "#fff" }}>
                    {sekme === "giris" ? t("Partner sign in") : t("Become a partner")}
                  </h2>
                  {sekme === "basvuru" && program ? (
                    <p className="mt-3 text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {t("Applying for: {name}", { name: t(program) })}
                    </p>
                  ) : null}
                </div>

                {hydrated && musteri && !ortak ? (
                  <p
                    className="mb-6 px-4 py-3 text-center text-[13px]"
                    style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.75)" }}
                  >
                    {t("You're signed in as {email}. This account isn't set up for wholesale yet — apply below and we'll activate it once approved.", { email: musteri.email })}
                  </p>
                ) : null}

                <div role="tablist" aria-label={t("Partner portal")} className="lx-sekmeler lx-sekmeler--koyu mb-8">
                  {(
                    [
                      ["basvuru", t("Apply")],
                      ["giris", t("Partner sign in")],
                    ] as [Sekme, string][]
                  )
                    .filter(([id]) => !(musteri && id === "giris"))
                    .map(([id, etiket]) => (
                      <button key={id} type="button" role="tab" aria-selected={sekme === id} onClick={() => setSekme(id)} className="lx-sekme">
                        {etiket}
                      </button>
                    ))}
                </div>

                {/* Form beyaz kutuda değil, zeminin üstünde duran cam panelde:
                    kırmızı ışıma panelin arkasından geçiyor */}
                <div className="lx-cam-panel p-6 sm:p-10">
                  {sekme === "giris" && !musteri ? (
                    <OrtakGirisi onBasvur={() => setSekme("basvuru")} />
                  ) : (
                    <ApplicationForm type="wholesale" program={program ?? undefined} koyu />
                  )}
                </div>

                <p className="mt-8 text-center text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
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
      <p className="text-center text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
        {t("Approved partners sign in here to order and manage their account.")}
      </p>
      <div>
        <LxEtiket htmlFor="ws-email" zorunlu koyu>{t("Email")}</LxEtiket>
        <input id="ws-email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={lxAlanKoyu} />
      </div>
      <div>
        <LxEtiket htmlFor="ws-sifre" zorunlu koyu>{t("Password")}</LxEtiket>
        <input id="ws-sifre" type="password" required minLength={5} autoComplete="current-password" value={sifre}
          onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" className={lxAlanKoyu} />
      </div>
      {hata ? <LxHata mesaj={hata} koyu /> : null}
      <button
        type="submit"
        disabled={islem.isPending}
        className="w-full uppercase tracking-[0.16em] disabled:opacity-60"
        style={{ minHeight: 52, background: "var(--sg-red)", color: "#fff", fontFamily: "var(--font-owners)", fontSize: "12px" }}
      >
        {islem.isPending ? t("Signing in…") : t("Sign in")}
      </button>
      <p className="text-center text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
        {t("Not a partner yet?")}{" "}
        <button type="button" onClick={onBasvur} className="underline underline-offset-4" style={{ color: "#fff" }}>
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
          <h2 className="lx-title" style={{ color: "#fff" }}>
            {ad ? t("Welcome back, {name}", { name: ad }) : t("Welcome back")}
          </h2>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            setCustomer(null);
          }}
          className="lx-link"
          style={{ color: "#fff" }}
        >
          {t("Sign out")}
        </button>
      </div>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {kartlar.map((k) => (
          <li key={k.href}>
            <Link href={k.href} className="lx-ortak-kart flex h-full flex-col justify-between gap-6 p-6">
              <span>
                <span className="block uppercase" style={{ fontFamily: "var(--font-owners-black)", fontSize: 20 }}>
                  {k.baslik}
                </span>
                <span className="mt-2 block text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {k.metin}
                </span>
              </span>
              <span aria-hidden="true" style={{ color: "var(--sg-red)" }}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
