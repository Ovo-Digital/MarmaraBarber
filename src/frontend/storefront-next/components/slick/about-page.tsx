"use client";

/**
 * About sayfası.
 *
 * Metinler lib/legal-content.ts'teki markanın kendi "About" içeriğinden,
 * harita verisi lib/about-presence.ts'ten. Sayfada markanın açıklamadığı
 * bir rakam ya da iddia yok.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AboutGlobe } from "@/components/slick/about-globe";
import { IHRACAT, MERKEZLER, PAZARLAR } from "@/lib/about-presence";
import { LEGAL_PAGES } from "@/lib/legal-content";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import { useT } from "@/lib/i18n/dil";

const ICERIK = LEGAL_PAGES.hakkimizda.sections;
const bolum = (id: string) => ICERIK.find((s) => s.id === id);

/** Ekrana girince 0'dan hedefe sayan rakam */
function Sayac({ hedef }: { hedef: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [deger, setDeger] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeger(hedef);
      return;
    }
    let kare = 0;
    const gozcu = new IntersectionObserver(([g]) => {
      if (!g.isIntersecting) return;
      gozcu.disconnect();
      const bas = performance.now();
      const adim = (z: number) => {
        const k = Math.min(1, (z - bas) / 1400);
        setDeger(Math.round(hedef * (1 - Math.pow(1 - k, 3))));
        if (k < 1) kare = requestAnimationFrame(adim);
      };
      kare = requestAnimationFrame(adim);
    }, { threshold: 0.4 });
    gozcu.observe(el);
    return () => {
      gozcu.disconnect();
      cancelAnimationFrame(kare);
    };
  }, [hedef]);
  return <span ref={ref}>{deger}</span>;
}

export function AboutPage() {
  useKoyuUstBildir();
  const t = useT();
  const [hedef, setHedef] = useState<[number, number] | null>(null);
  const [secili, setSecili] = useState<string | null>(null);

  const kim = bolum("who");
  const vizyon = bolum("vision");
  const misyon = bolum("mission");
  const ortak = bolum("partner");

  return (
    <div className="w-full">
      {/* ── 1. Açılış ─────────────────────────────────────────────────── */}
      <section data-dark-top className="relative isolate overflow-hidden" style={{ background: "var(--lx-ink)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/learn-the-craft.jpg" alt="" aria-hidden="true" className="lx-hakkinda-gorsel absolute inset-0 -z-10 h-full w-full object-cover" />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(180deg, rgba(20,17,15,.55) 0%, rgba(20,17,15,.35) 40%, rgba(20,17,15,.96) 100%)" }}
        />
        <div className="sg-container flex min-h-[78vh] flex-col justify-end pb-16 pt-36 sm:pb-24">
          <p className="lx-eyebrow mb-5">{t("About Marmara Barber")}</p>
          <h1
            className="max-w-[14ch] uppercase text-white"
            style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(44px, 8.4vw, 128px)", lineHeight: 0.92, letterSpacing: "-0.01em" }}
          >
            {t("Made for the chair.")}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed sm:text-[18px]" style={{ color: "rgba(255,255,255,0.75)" }}>
            {t("Grooming built for barbers — produced in our own facilities in Türkiye and shipped to barbershops around the world.")}
          </p>
        </div>

        {/* Rakamlar */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <dl className="sg-container grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4">
            {[
              { deger: <Sayac hedef={IHRACAT.ulke} />, etiket: t("Countries") },
              { deger: <Sayac hedef={IHRACAT.kita} />, etiket: t("Continents") },
              { deger: "GMP", etiket: t("Manufacturing standard") },
              { deger: t("Own"), etiket: t("Production") },
            ].map((s, i) => (
              <div key={i} className="pr-4">
                <dd className="text-white" style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                  {s.deger}
                </dd>
                <dt className="mt-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {s.etiket}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 2. Kimiz ──────────────────────────────────────────────────── */}
      {kim ? (
        <section className="bg-white">
          <div className="sg-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20" style={{ paddingTop: "clamp(64px,8vw,130px)", paddingBottom: "clamp(64px,8vw,130px)" }}>
            <div>
              <p className="lx-eyebrow mb-3">{t("Who we are")}</p>
              <h2 className="lx-title">{t("Barber-built, from the factory floor up.")}</h2>
            </div>
            <div className="space-y-5">
              {kim.content.map((p) => (
                <p key={p} className="text-[16px] leading-[1.75] sm:text-[17px]" style={{ color: "rgba(20,17,15,0.75)" }}>
                  {t(p)}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 3. Dünya ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white" style={{ background: "var(--lx-ink)" }}>
        <div aria-hidden="true" className="lx-kirmizi-isik" />
        <div className="sg-container relative grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" style={{ paddingTop: "clamp(64px,8vw,120px)", paddingBottom: "clamp(64px,8vw,120px)" }}>
          <div>
            <p className="lx-eyebrow mb-3">{t("Around the world")}</p>
            <h2 className="lx-title" style={{ color: "#fff" }}>
              {t("From Istanbul to {n} countries.", { n: IHRACAT.ulke })}
            </h2>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              {t("Drag the globe to explore. Select a place to fly there.")}
            </p>

            <p className="mt-10 text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {t("Where it's made")}
            </p>
            <ul className="mt-3 m-0 list-none p-0">
              {MERKEZLER.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => { setHedef([...m.koordinat]); setSecili(m.id); }}
                    className={`lx-kure-satir ${secili === m.id ? "lx-kure-satir--secili" : ""}`}
                  >
                    <span className="lx-kure-nokta lx-kure-nokta--merkez" aria-hidden="true" />
                    <span className="flex-1 text-left">{m.sehir}</span>
                    <span className="text-[11px] uppercase tracking-[0.14em] opacity-60">{t(m.rol)}</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {t("Where you'll find us")}
            </p>
            <ul className="mt-3 m-0 list-none p-0">
              {PAZARLAR.map((p) => (
                <li key={p.kod}>
                  <button
                    type="button"
                    onClick={() => { setHedef([...p.koordinat]); setSecili(p.kod); }}
                    className={`lx-kure-satir ${secili === p.kod ? "lx-kure-satir--secili" : ""}`}
                  >
                    <span className="lx-kure-nokta" aria-hidden="true" />
                    <span className="flex-1 text-left">{t(p.ulke)}</span>
                    <span className="text-[11px] uppercase tracking-[0.14em] opacity-60">{t(p.not)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("…and barbershops and distributors across {n} countries on {k} continents.", { n: IHRACAT.ulke, k: IHRACAT.kita })}
            </p>
          </div>

          {/* Mobilde küre listenin üstünde: listeden seçince dönüşü görülsün */}
          <div className="order-first lg:order-none">
            <AboutGlobe hedef={hedef} />
          </div>
        </div>
      </section>

      {/* ── 4. Vizyon / Misyon ───────────────────────────────────────── */}
      <section style={{ background: "var(--lx-bone)" }}>
        <div className="sg-container grid gap-px sm:grid-cols-2" style={{ paddingTop: "clamp(56px,7vw,110px)", paddingBottom: "clamp(56px,7vw,110px)" }}>
          {[vizyon, misyon].filter(Boolean).map((b, i) => (
            <article key={b!.id} className="lx-hakkinda-kart p-8 sm:p-12">
              <span className="block text-[12px] tracking-[0.16em]" style={{ color: "var(--sg-red)", fontFamily: "var(--font-owners)" }}>
                [ {String(i + 1).padStart(2, "0")} ]
              </span>
              <h3 className="lx-title mt-5">{t(b!.title)}</h3>
              <p className="mt-5 text-[16px] leading-[1.75]" style={{ color: "rgba(20,17,15,0.72)" }}>
                {t(b!.content[0])}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 5. İş birliği ────────────────────────────────────────────── */}
      {ortak ? (
        <section className="bg-black text-white">
          <div className="sg-container flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end" style={{ paddingTop: "clamp(56px,7vw,110px)", paddingBottom: "clamp(56px,7vw,110px)" }}>
            <div className="max-w-[60ch]">
              <p className="lx-eyebrow mb-3">{t(ortak.title)}</p>
              <h2 className="lx-title" style={{ color: "#fff" }}>{t("Carry the range.")}</h2>
              {ortak.content.slice(0, 2).map((p) => (
                <p key={p} className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {t(p)}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/wholesale" className="lx-btn-outline" style={{ color: "#fff" }}>
                {t("Wholesale")}
              </Link>
              <Link href="/iletisim" className="lx-btn-outline" style={{ color: "#fff" }}>
                {t("Contact")}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
