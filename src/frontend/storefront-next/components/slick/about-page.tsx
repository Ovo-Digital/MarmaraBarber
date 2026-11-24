"use client";

/**
 * About sayfası.
 *
 * Metinler lib/legal-content.ts'teki markanın kendi "About" içeriğinden,
 * harita verisi lib/about-presence.ts'ten. Sayfada markanın açıklamadığı
 * bir rakam ya da iddia yok.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AboutGlobe } from "@/components/slick/about-globe";
import {
  IHRACAT,
  IHRACAT_ULKELERI,
  MERKEZLER,
  PAZARLAR,
  RAKAMLAR,
  URETIM_TESISI,
  kitayaGore,
  type IhracatUlkesi,
  type Rakam,
} from "@/lib/about-presence";
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
  const kureRef = useRef<HTMLDivElement | null>(null);

  /* Listeden seçince: küreyi döndür, işaretle ve KÜÇÜK EKRANDA küreye kaydır.
     Mobilde küre listenin üstünde kalıyor; kaydırmazsak kullanıcı bastığı
     şeyin bir karşılığı olduğunu göremiyor. */
  const sec = useCallback((kod: string, koordinat?: [number, number], kaydir = true) => {
    /* Koordinat yoksa küre, ülkenin harita üzerindeki merkezine kendisi uçuyor. */
    setHedef(koordinat ? [...koordinat] : null);
    setSecili(kod);
    /* Küreye tıklanarak seçildiyse kaydırmıyoruz: küre zaten ekranda,
       yeniden ortalamak yerinde duran görüntüyü sarsıyor. */
    if (kaydir && window.matchMedia("(max-width: 1023px)").matches) {
      kureRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    }
  }, []);
  const [secili, setSecili] = useState<string | null>(null);
  /* Açık duran kıta — aynı anda bir tanesi açık, liste kısa kalsın. */
  const [acikKita, setAcikKita] = useState<string | null>(null);
  /* Etikette yazacak ad: merkezlerde şehir, pazarlarda çevrilmiş ülke adı. */
  /* İç pazar (Türkiye) ihracat listesinde yok; başa kendimiz koyuyoruz. */
  const icPazar = PAZARLAR.find((p) => p.not === "Home market");
  const ulkeler: IhracatUlkesi[] = icPazar
    ? [
        /* Türkiye ihracat dosyasında yok; kıtası burada veriliyor.
           Merkez İstanbul'da, Avrupa yakasında. */
        { kod: icPazar.kod, koordinat: icPazar.koordinat, kita: "Avrupa", ulke: t(icPazar.ulke) },
        ...IHRACAT_ULKELERI,
      ]
    : IHRACAT_ULKELERI;

  const seciliAd =
    MERKEZLER.find((m) => m.id === secili)?.sehir ??
    IHRACAT_ULKELERI.find((u) => (u.kod ?? u.atlasAd ?? u.ulke) === secili)?.ulke ??
    (() => {
      const p = PAZARLAR.find((x) => x.kod === secili);
      return p ? t(p.ulke) : null;
    })();

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
                    onClick={() => sec(m.id, m.koordinat)}
                    className={`lx-kure-satir ${secili === m.id ? "lx-kure-satir--secili" : ""}`}
                  >
                    <span className="lx-kure-nokta lx-kure-nokta--merkez" aria-hidden="true" />
                    <span className="flex-1 text-left">{m.sehir}</span>
                    <span className="text-[11px] uppercase tracking-[0.14em] opacity-60">{t(m.rol)}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Ülkeler alt alta uzun bir liste değil, akan etiketler hâlinde:
                62 satır sol sütunu kürenin birkaç katı uzunluğa çıkarıyordu.
                Rolü doğrulanmış pazarlar (ana pazar, resmî distribütör…) kırmızı
                noktayla ayrılıyor; rolü etiketin üstünde yazıyor. */}
            <div className="mt-8 flex items-baseline justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {t("Where we are")}
              </p>
              <p className="text-[11px] tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                {t("Exports to {n} countries · {k} continents", { n: IHRACAT.ulke, k: IHRACAT.kita })}
              </p>
            </div>

            {/* İç pazar listede ilk sırada: başlık "Neredeyiz", ihracat dosyasında
                Türkiye yok çünkü kendine ihracat yapılmıyor. Sayı satırı yine
                ihracat sayısını veriyor, karışmasın diye "ihracat" yazıyor. */}
            {/* Kıta kıta gruplanmış, kutusuz metin. 63 ülke kutu içinde
                yan yana dizilince göz yoruyordu; başlık + sakin metin hem
                daha kısa hem taranabilir. Ülke adları yine tıklanabilir. */}
            {/* Kıtalar kapalı başlıyor: başlığa basınca o kıtanın ülkeleri
                açılıyor. 62 ülke tek seferde açık durunca sol sütun kürenin
                birkaç katı uzuyordu. */}
            <div className="lx-kitalar mt-4">
              {kitayaGore(ulkeler).map(([kita, liste]) => {
                const acik = acikKita === kita;
                return (
                <section key={kita} className="lx-kita" data-acik={acik}>
                  <button
                    type="button"
                    className="lx-kita-baslik"
                    aria-expanded={acik}
                    onClick={() => setAcikKita(acik ? null : kita)}
                  >
                    {kita}
                    <span className="lx-kita-sayi">{liste.length}</span>
                    <span aria-hidden="true" className="lx-kita-ok">
                      {acik ? "−" : "+"}
                    </span>
                  </button>
                  <p className="lx-kita-ulkeler" hidden={!acik}>
                    {liste.map((u, i) => {
                      const anahtar = u.kod ?? u.atlasAd ?? u.ulke;
                      const pazar = PAZARLAR.find((p) => p.kod === u.kod);
                      return (
                        <span key={anahtar}>
                          {i > 0 ? <span aria-hidden="true" className="lx-kita-ayrac">·</span> : null}
                          <button
                            type="button"
                            title={pazar ? t(pazar.not) : undefined}
                            onClick={() => sec(anahtar, u.koordinat ?? pazar?.koordinat)}
                            className={`lx-ulke ${secili === anahtar ? "lx-ulke--secili" : ""} ${pazar ? "lx-ulke--pazar" : ""}`}
                          >
                            {u.ulke}
                          </button>
                        </span>
                      );
                    })}
                  </p>
                </section>
                );
              })}
            </div>
          </div>

          {/* Mobilde küre listenin üstünde: listeden seçince dönüşü görülsün */}
          <div ref={kureRef} className="order-first lg:order-none">
            <AboutGlobe
              hedef={hedef}
              secili={secili}
              seciliKod={secili}
              seciliAd={seciliAd}
              onSecim={(kod, koordinat) => sec(kod, koordinat, false)}
            />
          </div>
        </div>
      </section>

      {/* ── 3b. Rakamlar ─────────────────────────────────────────────────
          İki ayrı siyah bölüm sayfanın yarısını yiyordu; marka ve üretim
          rakamları tek bölümde, ikinci satır daha küçük puntoyla. */}
      <RakamBolumu
        eyebrow={t("The numbers")}
        baslik={t("Built in our own facility, used in 62 countries.")}
        rakamlar={RAKAMLAR}
        altEtiket={t("Production")}
        altRakamlar={URETIM_TESISI}
      />

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

/**
 * "Rakamlar" bölümü — ortada etiket + başlık, altında büyük kırmızı sayılar.
 *
 * `deger: null` olan satır hiç çizilmiyor: markadan gelmeyen bir rakamın
 * yerine sıfır ya da tahmin yazmıyoruz. Hiçbiri dolu değilse bölüm de yok.
 */
/**
 * Rakam bölümü — Slick Gorilla'nın "THE NUMBERS" alanının karşılığı.
 *
 * Tek siyah bölüm: üstte marka rakamları, altında (varsa) üretim rakamları
 * daha küçük puntoyla. Önce iki ayrı bölümdü ve sayfada devasa bir boşluk
 * açıyordu; Volkan "daha ufağını yap" dedi (24 Kas).
 *
 * Tipografi Slick'in alt bilgisinden okunan ölçülerle aynı aileyi kullanıyor:
 * başlıklar Owners, etiketler Geist.
 *
 * Değeri `null` olan rakam HİÇ ÇİZİLMEZ — markadan gelmeyen sayı uydurulmaz.
 */
function RakamBolumu({
  eyebrow,
  baslik,
  rakamlar,
  altEtiket,
  altRakamlar,
}: {
  eyebrow: string;
  baslik: string;
  rakamlar: Rakam[];
  altEtiket?: string;
  altRakamlar?: Rakam[];
}) {
  const dolu = rakamlar.filter((r) => r.deger !== null && r.deger !== undefined);
  const altDolu = (altRakamlar ?? []).filter((r) => r.deger !== null && r.deger !== undefined);
  /* Tek rakamla bölüm kurulmuyor: ekranda boş bir alan gibi duruyor. */
  if (dolu.length < 2) return null;

  return (
    <section className="bg-black text-white">
      <div
        className="sg-container text-center"
        style={{ paddingTop: "clamp(40px,4.2vw,64px)", paddingBottom: "clamp(40px,4.2vw,64px)" }}
      >
        <p className="lx-eyebrow mb-2">{eyebrow}</p>
        <h2
          className="mx-auto max-w-[26ch] uppercase"
          style={{
            fontFamily: "var(--font-owners)",
            fontWeight: 800,
            fontSize: "clamp(20px, 2.2vw, 28px)",
            lineHeight: 1.3,
            color: "#ffffff",
          }}
        >
          {baslik}
        </h2>

        <dl
          className="mx-auto mt-7 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4"
          style={{ maxWidth: 900 }}
        >
          {dolu.map((r) => (
            <Rakamlar key={r.etiket} rakam={r} boy="buyuk" />
          ))}
        </dl>

        {altDolu.length >= 2 ? (
          <div className="mx-auto mt-9 border-t border-white/15 pt-7" style={{ maxWidth: 900 }}>
            {altEtiket ? (
              <p
                className="mb-5 uppercase"
                style={{
                  fontFamily: "var(--font-owners)",
                  fontWeight: 800,
                  fontSize: "13px",
                  letterSpacing: "0.14em",
                  color: "var(--sg-red)",
                }}
              >
                {altEtiket}
              </p>
            ) : null}
            <dl className="grid grid-cols-3 gap-x-4 gap-y-6">
              {altDolu.map((r) => (
                <Rakamlar key={r.etiket} rakam={r} boy="kucuk" />
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Tek rakam + etiketi. `boy` iki ölçek: marka rakamları ve üretim rakamları. */
function Rakamlar({ rakam, boy }: { rakam: Rakam; boy: "buyuk" | "kucuk" }) {
  const t = useT();
  const buyuk = boy === "buyuk";
  return (
    <div className="px-1">
      <dd
        style={{
          fontFamily: "var(--font-owners-black)",
          fontWeight: 900,
          fontSize: buyuk ? "clamp(28px, 3vw, 42px)" : "clamp(20px, 2vw, 28px)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--sg-red)",
          whiteSpace: "nowrap",
        }}
      >
        {typeof rakam.deger === "number" ? <Sayac hedef={rakam.deger} /> : rakam.deger}
        {rakam.son ?? ""}
      </dd>
      <dt
        className="mt-2 uppercase"
        style={{
          fontFamily: "var(--font-geist)",
          fontWeight: 400,
          fontSize: buyuk ? "11px" : "10px",
          lineHeight: 1.35,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {t(rakam.etiket)}
      </dt>
    </div>
  );
}
