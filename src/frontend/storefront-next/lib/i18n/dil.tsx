"use client";

/**
 * Dil seçimi (İngilizce / İspanyolca).
 *
 * Seçim tarayıcıda saklanıyor (localStorage). Sunucu her zaman İngilizce
 * çiziyor; sayfa tarayıcıda açıldıktan sonra kayıtlı dil İspanyolcaysa metinler
 * değişiyor. Böylece sayfalar önbellekli (ISR) kalabiliyor.
 *
 * Neden ilk çizimde doğrudan kayıtlı dili kullanmıyoruz: sunucuda localStorage
 * yok. Sunucu "en", tarayıcı "es" çizerse React iki çıktının farklı olduğunu
 * görüp hidrasyon hatası veriyor.
 *
 * Ürün adları ve açıklamaları Shopify'dan geliyor ve burada çevrilmiyor.
 */

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ES } from "@/lib/i18n/es";

export type Dil = "en" | "es";

export const DILLER: { kod: Dil; kisa: string; ad: string }[] = [
  { kod: "en", kisa: "EN", ad: "English" },
  { kod: "es", kisa: "ES", ad: "Español" },
];

const useDilStore = create<{ dil: Dil; setDil: (d: Dil) => void }>()(
  persist((set) => ({ dil: "en", setDil: (dil) => set({ dil }) }), { name: "marmara-dil" }),
);

/** Hidrasyon tamamlanana kadar "en" döner, sonra kayıtlı dili. */
export function useDil(): [Dil, (d: Dil) => void] {
  const kayitli = useDilStore((s) => s.dil);
  const setDil = useDilStore((s) => s.setDil);
  const [hazir, setHazir] = useState(false);
  useEffect(() => setHazir(true), []);
  return [hazir ? kayitli : "en", setDil];
}

/** Geliştirmede sözlükte olmayan metni bir kez konsola yazar */
const bildirilen = new Set<string>();
function eksikBildir(metinEn: string) {
  if (bildirilen.has(metinEn)) return;
  bildirilen.add(metinEn);
  console.warn(`[i18n] es eksik: ${JSON.stringify(metinEn)}`);
}

/**
 * Anahtar, metnin İngilizce hâlinin kendisi. İspanyolca karşılığı
 * lib/i18n/es.ts içinde; bulunamazsa İngilizcesi gösterilir.
 * Eksikleri bulmak için: node scripts/i18n-kontrol.mjs
 */
function cevir(dil: Dil, metinEn: string, degerler?: Record<string, string | number>) {
  if (dil === "es" && !(metinEn in ES) && process.env.NODE_ENV !== "production") eksikBildir(metinEn);
  let metin = dil === "es" ? (ES[metinEn] ?? metinEn) : metinEn;
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

/** EN / ES seçici. `koyu`: koyu zeminde beyaz yazı. */
export function DilSecici({ koyu = false, className = "" }: { koyu?: boolean; className?: string }) {
  const [dil, setDil] = useDil();
  const t = useT();
  return (
    <div role="group" aria-label={t("Language")} className={`lx-dil ${koyu ? "lx-dil--koyu" : ""} ${className || "inline-flex"}`}>
      {DILLER.map((d, i) => (
        <span key={d.kod} className="inline-flex items-center">
          {i > 0 ? <span aria-hidden="true" className="lx-dil-ayrac">/</span> : null}
          <button
            type="button"
            lang={d.kod}
            aria-pressed={dil === d.kod}
            title={d.ad}
            onClick={() => setDil(d.kod)}
            className="lx-dil-dugme"
          >
            {d.kisa}
          </button>
        </span>
      ))}
    </div>
  );
}
