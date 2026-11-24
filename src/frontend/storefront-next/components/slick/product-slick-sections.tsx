"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/dil";
import { LEGAL_PAGES } from "@/lib/legal-content";

/**
 * Ürün sayfasının alt bölümleri — Slick Gorilla'nın ürün detayındaki düzen:
 * NASIL KULLANILIR (adım kartları), NE İŞE YARAR (siyah kartlar) ve SSS.
 *
 * Üçü de VERİYLE çalışıyor:
 *  · adımlar ve maddeler ürünün Shopify açıklamasından ayıklanıyor
 *    (`lib/urun-metni.ts`), bölüm yoksa o bölüm hiç çizilmiyor;
 *  · SSS mağazanın kendi SSS sayfasından geliyor (`lib/legal-content.ts`),
 *    ürüne özel soru uydurulmuyor.
 *
 * Masaüstü ve mobil aynı tipografiyi kullanıyor; sadece sütun sayısı
 * değişiyor (Volkan, 24 Kas: "hem mobilde hem masaüstünde aynı").
 */

/* Slick'in bölüm başlığı: Owners Narrow Black, büyük harf, ortalı. */
const BOLUM_BASLIGI: React.CSSProperties = {
  fontFamily: "var(--font-owners-black)",
  fontWeight: 900,
  fontSize: "clamp(26px, 3.4vw, 44px)",
  lineHeight: 1.05,
  letterSpacing: "-0.01em",
  color: "var(--lx-ink)",
  textTransform: "uppercase",
};

/* Siyah kart — adım ve madde kartlarının ortak zemini */
const KART: React.CSSProperties = {
  background: "#121212",
  borderRadius: 6,
  border: "1px solid transparent",
  transition: "border-color 260ms ease",
};

const KART_BASLIK: React.CSSProperties = {
  fontFamily: "var(--font-owners)",
  fontWeight: 800,
  fontSize: "18px",
  lineHeight: "24px",
  color: "#ffffff",
  textTransform: "uppercase",
};


const ETIKET_KIRMIZI: React.CSSProperties = {
  fontFamily: "var(--font-owners)",
  fontWeight: 800,
  fontSize: "13px",
  letterSpacing: "0.1em",
  color: "var(--sg-red)",
  textTransform: "uppercase",
};

/* ── 1. NASIL KULLANILIR ───────────────────────────────────────────── */

/**
 * Solda ürün görseli, sağda açılır adım kartları.
 * İlk kart açık geliyor — Slick'te de öyle.
 */
export function NasilKullanilir({
  adimlar,
  gorsel,
  baslik,
}: {
  adimlar: string[];
  gorsel?: string;
  baslik: string;
}) {
  const t = useT();
  if (adimlar.length < 2) return null;

  return (
    <section className="border-t border-black/10 bg-white">
      <div className="sg-container" style={{ paddingTop: "clamp(44px,4.5vw,76px)", paddingBottom: "clamp(44px,4.5vw,76px)" }}>
        <h2 className="mb-9 text-center" style={BOLUM_BASLIGI}>
          {t("How to use")}
        </h2>

        {/* Görsel kare bırakılınca kart sütunundan çok daha uzun kalıyor ve
            sağda boşluk açılıyordu; yüksekliği kartlara göre sınırlı. */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {gorsel ? (
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ borderRadius: 6, background: "#f3f1ee", maxHeight: 460 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gorsel}
                alt={baslik}
                className="block w-full"
                style={{ maxHeight: 460, objectFit: "contain", padding: "18px" }}
              />
            </div>
          ) : null}

          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {adimlar.map((adim, i) => (
              /* Kartta uydurma başlık YOK: Shopify'da adımın ayrı bir
                 başlığı olmadığı için cümlenin kendisi kartın metni.
                 İlk denemede ilk üç kelime başlığa çıkarılmıştı; cümleyi
                 ortasından kesiyordu. */
              <li key={adim} className="p-6" style={KART}>
                <span className="block" style={ETIKET_KIRMIZI}>
                  {t("Step {n}", { n: String(i + 1) })}
                </span>
                <p className="mt-3" style={{ ...KART_BASLIK, textTransform: "none", fontWeight: 500, lineHeight: "26px" }}>
                  {adim}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── 2. NE İŞE YARAR ───────────────────────────────────────────────── */

/** Üç siyah kart + tam açıklamayı açan çerçeveli düğme. */
export function NeIseYarar({ maddeler, tamAciklama }: { maddeler: string[]; tamAciklama?: string }) {
  const t = useT();
  const [tumu, setTumu] = useState(false);
  if (maddeler.length < 2) return null;

  return (
    <section className="border-t border-black/10 bg-white">
      <div className="sg-container" style={{ paddingTop: "clamp(44px,4.5vw,76px)", paddingBottom: "clamp(44px,4.5vw,76px)" }}>
        <h2 className="mb-9 text-center" style={BOLUM_BASLIGI}>
          {t("What it actually does")}
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {maddeler.map((m, i) => (
            /* Kart ve hover ölçüleri KANAR'dan: -6px kalkma, gölge büyümesi,
               kırmızıya dönen çizgi, ikonun 1.04 ölçeklenmesi.
               Sınıflar globals.css'te `.lx-derd-*` olarak katmansız. */
            <div key={m} className="lx-derd-kart">
              <span aria-hidden="true" className="lx-derd-ikon mb-5">
                <Ikon indeks={i} />
              </span>
              <p style={{ ...KART_BASLIK, textTransform: "none", fontWeight: 500, lineHeight: "26px" }}>{m}</p>
            </div>
          ))}
        </div>

        {tamAciklama ? (
          <div className="mt-9 text-center">
            <button
              type="button"
              onClick={() => setTumu((a) => !a)}
              aria-expanded={tumu}
              className="min-h-12 px-9"
              style={{
                border: "1px solid var(--lx-ink)",
                background: "transparent",
                color: "var(--lx-ink)",
                fontFamily: "var(--font-owners)",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {tumu ? t("Hide full description") : t("Show full description")}
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: tumu ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p
                  className="mx-auto max-w-[70ch] pt-7 text-left"
                  style={{
                    fontFamily: "var(--font-geist)",
                    fontWeight: 300,
                    fontSize: "15px",
                    lineHeight: "25px",
                    color: "#444",
                  }}
                >
                  {tamAciklama}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* Kart ikonları — süs değil, kartı birbirinden ayıran işaret. */
function Ikon({ indeks }: { indeks: number }) {
  const ortak = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (indeks === 0) {
    return (
      <svg {...ortak}>
        <path d="M12 3c3.5 3.4 5.5 6 5.5 9a5.5 5.5 0 0 1-11 0c0-3 2-5.6 5.5-9Z" />
      </svg>
    );
  }
  if (indeks === 1) {
    return (
      <svg {...ortak}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </svg>
    );
  }
  return (
    <svg {...ortak}>
      <path d="M12 21s-7-4.3-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 3.6C19 16.7 12 21 12 21Z" />
    </svg>
  );
}

/* ── 3. SSS ────────────────────────────────────────────────────────── */

/**
 * "Q: … A: …" satırını soru/cevap ikilisine ayırır.
 *
 * SSS metni tek satır olarak çevriliyor (tr.ts'te tam cümle anahtar), bu
 * yüzden ÖNCE çeviriliyor sonra bölünüyor. Türkçede ön ek "S:" / "C:",
 * İspanyolcada "P:" / "R:" olabiliyor — hepsi aynı kalıpla yakalanıyor.
 */
function soruAyir(satir: string): { soru: string; cevap: string } | null {
  const m = satir.match(/^[QSPF]:\s*([\s\S]+?)\s*[ACR]:\s*([\s\S]+)$/);
  return m ? { soru: m[1].trim(), cevap: m[2].trim() } : null;
}

/**
 * Ürün sayfasındaki SSS.
 *
 * Sorular mağazanın SSS sayfasından geliyor — ürüne özel soru yazılmadı.
 * `bolumler` ile hangi grupların alınacağı ayarlanıyor; varsayılan olarak
 * ürün, kargo ve iade grupları.
 */
export function UrunSSS({ bolumler = ["products", "shipping", "returns"] }: { bolumler?: string[] }) {
  const t = useT();
  const [acik, setAcik] = useState<string | null>(null);

  const sorular = LEGAL_PAGES.sss.sections
    .filter((b) => bolumler.includes(b.id))
    .flatMap((b) => b.content.map((satir) => soruAyir(t(satir))))
    .filter((x): x is { soru: string; cevap: string } => Boolean(x));

  if (sorular.length < 3) return null;

  return (
    <section className="border-t border-black/10 bg-white">
      <div className="sg-container" style={{ paddingTop: "clamp(44px,4.5vw,76px)", paddingBottom: "clamp(52px,5vw,88px)" }}>
        <h2 className="mb-8" style={BOLUM_BASLIGI}>
          {t("Frequently asked questions")}
        </h2>

        <div>
          {sorular.map(({ soru, cevap }) => {
            const secili = acik === soru;
            return (
              <div key={soru} style={{ borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
                <button
                  type="button"
                  onClick={() => setAcik(secili ? null : soru)}
                  aria-expanded={secili}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span
                    style={{
                      fontFamily: "var(--font-geist)",
                      fontWeight: 600,
                      fontSize: "15px",
                      lineHeight: "22px",
                      color: "var(--lx-ink)",
                    }}
                  >
                    {soru}
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-[22px] leading-none" style={{ color: "var(--sg-red)" }}>
                    {secili ? "−" : "+"}
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: secili ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="max-w-[80ch] pb-6"
                      style={{ fontFamily: "var(--font-geist)", fontWeight: 300, fontSize: "15px", lineHeight: "25px", color: "#444" }}
                    >
                      {cevap}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
