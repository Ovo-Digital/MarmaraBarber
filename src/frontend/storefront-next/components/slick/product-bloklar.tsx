"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/dil";

/**
 * Ürün detayındaki açılır bilgi blokları.
 *
 * Slick Gorilla'da bu alan sade bir satır listesi ("WHY IT'S SLICK",
 * "INGREDIENTS", "SHIPPING"). Bizde aynı yerde duruyor ama tasarım KANAR
 * sunumunun diliyle: solda sıra numarası, ortada büyük Owners başlık,
 * sağda 44px yuvarlak düğme — açılınca 45° dönüp çarpıya geçiyor.
 *
 * Başlıklar ürünün kendi Shopify açıklamasındaki büyük harfli bölümlerden
 * geliyor; başlık uydurulmuyor. Stiller `globals.css` içindeki `.lx-blok-*`
 * sınıflarında (katmansız — Tailwind ezmesin).
 *
 * Açılma yüksekliği animasyonla değil grid satırıyla (0fr → 1fr) yapılıyor:
 * `height: auto` animasyonu tarayıcıda çalışmıyor.
 */
export function UrunBloklari({
  bloklar,
}: {
  bloklar: { id: string; title: string; body: React.ReactNode }[];
}) {
  const t = useT();
  /* Hepsi kapalı başlıyor: ilk bölüm açık gelince uzun açıklama sayfayı
     yine duvara çeviriyordu. */
  const [acik, setAcik] = useState<string | null>(null);

  if (!bloklar.length) return null;

  return (
    <section className="bg-white">
      <div
        className="sg-container"
        style={{ paddingTop: "clamp(36px,3.6vw,64px)", paddingBottom: "clamp(36px,3.6vw,64px)" }}
      >
        <div className="lx-blok-liste">
          {bloklar.map((b, i) => {
            const secili = acik === b.id;
            return (
              <div key={b.id} className={secili ? "lx-blok lx-blok--acik" : "lx-blok"}>
                <button
                  type="button"
                  className="lx-blok-baslik"
                  aria-expanded={secili}
                  aria-controls={`blok-${b.id}`}
                  onClick={() => setAcik(secili ? null : b.id)}
                >
                  <span className="lx-blok-no" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="lx-blok-ad">{t(b.title)}</span>
                  <span className="lx-blok-dugme" aria-hidden="true" />
                </button>
                <div className="lx-blok-govde" id={`blok-${b.id}`} role="region">
                  <div>
                    <div
                      className="lx-blok-icerik"
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontWeight: 300,
                        fontSize: "15px",
                        lineHeight: "25px",
                        color: "#444",
                      }}
                    >
                      {b.body}
                    </div>
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
