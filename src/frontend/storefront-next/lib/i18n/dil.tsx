"use client";

/**
 * Dil seçimi (Türkçe / İngilizce / İspanyolca). Varsayılan Türkçe.
 *
 * Sözlük anahtarları İngilizce metnin kendisi; karşılıklar lib/i18n/tr.ts
 * ve lib/i18n/es.ts içinde. "en" seçiliyken anahtar olduğu gibi
 * gösteriliyor, bu yüzden İngilizce için ayrı dosya yok.
 *
 * Seçim tarayıcıda saklanıyor (localStorage). Sunucu HER ZAMAN varsayılan
 * dili çiziyor; sayfa açıldıktan sonra kayıtlı dil farklıysa metinler
 * değişiyor. Böylece sayfalar önbellekli (ISR) kalabiliyor.
 *
 * Neden ilk çizimde doğrudan kayıtlı dili kullanmıyoruz: sunucuda localStorage
 * yok. Sunucu "tr", tarayıcı "en" çizerse React iki çıktının farklı olduğunu
 * görüp hidrasyon hatası veriyor.
 *
 * Ürün adları ve açıklamaları Shopify'dan geliyor ve burada çevrilmiyor.
 */

import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ES } from "@/lib/i18n/es";
import { TR } from "@/lib/i18n/tr";

export type Dil = "tr" | "en" | "es";

/** Varsayılan dil — sunucunun çizdiği dil de budur. */
export const VARSAYILAN: Dil = "tr";

export const DILLER: { kod: Dil; kisa: string; ad: string }[] = [
  { kod: "tr", kisa: "TR", ad: "Türkçe" },
  { kod: "en", kisa: "EN", ad: "English" },
  { kod: "es", kisa: "ES", ad: "Español" },
];

/** Dil kodu → sözlük. "en" yok: anahtarın kendisi zaten İngilizce. */
const SOZLUKLER: Partial<Record<Dil, Record<string, string>>> = { tr: TR, es: ES };

const useDilStore = create<{ dil: Dil; setDil: (d: Dil) => void }>()(
  persist((set) => ({ dil: VARSAYILAN, setDil: (dil) => set({ dil }) }), { name: "marmara-dil" }),
);

/** Hidrasyon tamamlanana kadar varsayılan dili döner, sonra kayıtlıyı. */
export function useDil(): [Dil, (d: Dil) => void] {
  const kayitli = useDilStore((s) => s.dil);
  const setDil = useDilStore((s) => s.setDil);
  const [hazir, setHazir] = useState(false);
  useEffect(() => setHazir(true), []);
  return [hazir ? kayitli : VARSAYILAN, setDil];
}

/** Geliştirmede sözlükte olmayan metni bir kez konsola yazar */
const bildirilen = new Set<string>();
function eksikBildir(metinEn: string) {
  if (bildirilen.has(metinEn)) return;
  bildirilen.add(metinEn);
  console.warn(`[i18n] eksik: ${JSON.stringify(metinEn)}`);
}

/**
 * Anahtar, metnin İngilizce hâlinin kendisi. Karşılıkları lib/i18n/tr.ts
 * ve lib/i18n/es.ts içinde; bulunamazsa İngilizcesi gösterilir.
 * Eksikleri bulmak için: node scripts/i18n-kontrol.mjs
 */
function cevir(dil: Dil, metinEn: string, degerler?: Record<string, string | number>) {
  const sozluk = SOZLUKLER[dil];
  if (sozluk && !(metinEn in sozluk) && process.env.NODE_ENV !== "production") eksikBildir(metinEn);
  let metin = sozluk ? (sozluk[metinEn] ?? metinEn) : metinEn;
  if (degerler) {
    for (const [k, v] of Object.entries(degerler)) metin = metin.replaceAll(`{${k}}`, String(v));
  }
  return metin;
}

/** const t = useT();  t("Follow")  ·  t("Showing {n} of {total}", { n: 12, total: 40 }) */
export function useT() {
  const [dil] = useDil();
  return (metinEn: string, degerler?: Record<string, string | number>) =>
    cevir(dil, metinEn, degerler);
}

/** Sunucu bileşenlerinin içinde çeviri: <T k="Learn the craft." /> */
export function T({ k, v }: { k: string; v?: Record<string, string | number> }) {
  const t = useT();
  return <>{t(k, v)}</>;
}

/** <html lang> kayıtlı dile uysun (ekran okuyucular ve tarayıcı çevirisi için) */
export function DilEsitle() {
  const [dil] = useDil();
  useEffect(() => {
    document.documentElement.lang = dil;
  }, [dil]);
  return null;
}

/**
 * Dil seçici — küre ikonu, tıklayınca üç dil açılır.
 *
 * Üç dil yan yana yazılınca üst menüde yer kalmıyordu; ikon tek bir
 * düğme kadar yer kaplıyor. Seçili dilin kısaltması ikonun yanında
 * duruyor ki menü açılmadan da hangi dilde olunduğu görülsün.
 *
 * `koyu`: koyu zeminde beyaz yazı.
 */
export function DilSecici({ koyu = false, className = "" }: { koyu?: boolean; className?: string }) {
  const [dil, setDil] = useDil();
  const t = useT();
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLDivElement | null>(null);
  const simdiki = DILLER.find((d) => d.kod === dil) ?? DILLER[0];

  /* Dışarı tıklayınca ve Esc ile kapansın — menü açık kalıp
     sayfanın üstünde takılı durmasın. */
  useEffect(() => {
    if (!acik) return;
    const disari = (e: MouseEvent) => {
      if (!kutu.current?.contains(e.target as Node)) setAcik(false);
    };
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcik(false);
    };
    document.addEventListener("pointerdown", disari);
    document.addEventListener("keydown", tus);
    return () => {
      document.removeEventListener("pointerdown", disari);
      document.removeEventListener("keydown", tus);
    };
  }, [acik]);

  return (
    <div ref={kutu} className={`lx-dil ${koyu ? "lx-dil--koyu" : ""} ${className || "relative inline-flex"}`}>
      <button
        type="button"
        className="lx-dil-ac"
        aria-haspopup="listbox"
        aria-expanded={acik}
        aria-label={`${t("Language")}: ${simdiki.ad}`}
        onClick={() => setAcik((a) => !a)}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
        </svg>
        <span className="lx-dil-kisa">{simdiki.kisa}</span>
      </button>

      {acik ? (
        <ul className="lx-dil-liste" role="listbox" aria-label={t("Language")}>
          {DILLER.map((d) => (
            <li key={d.kod}>
              <button
                type="button"
                lang={d.kod}
                role="option"
                aria-selected={dil === d.kod}
                className={`lx-dil-secenek ${dil === d.kod ? "lx-dil-secenek--secili" : ""}`}
                onClick={() => {
                  setDil(d.kod);
                  setAcik(false);
                }}
              >
                <span className="lx-dil-kod">{d.kisa}</span>
                <span>{d.ad}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
