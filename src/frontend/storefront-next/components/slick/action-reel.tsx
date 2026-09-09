"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatMoney } from "@/lib/money";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import type { Product } from "@/types/commerce";
import { useUiStore } from "@/store/ui-store";

export type ReelItem = {
  product: Product;
  /** Dosya public/media/ altında; verilmezse ürün görseli gösterilir */
  videoUrl?: string;
  posterUrl?: string;
};

/**
 * Video şeridi — kartlar yan yana dizilmiyor, ÜST ÜSTE duruyor.
 *
 * Ortadaki kart tam boy ve net; bir önceki ve bir sonraki kart onun altından
 * sağa/sola taşıyor, küçülüyor ve karartılıyor. Geri kalanlar ortada küçülmüş
 * halde saklı bekliyor, sıra gelince oradan büyüyerek çıkıyor.
 *
 * Hepsi tek bir "transform" ile yapılıyor: konum, ölçek ve parlaklık aynı
 * geçişte değiştiği için kartlar tek bir hareket gibi akıyor.
 *
 * Video yoksa ürün görseli gösteriliyor; videolar public/media/ altına konup
 * lib/slick-theme.ts'teki listeye yazıldıkça kartlar kendiliğinden videoya döner.
 */


const mod = (n: number, m: number) => ((n % m) + m) % m;

export function ActionReel({
  items,
  eyebrow = "Shop the reel",
  title = "Marmara in action",
}: {
  items: ReelItem[];
  eyebrow?: string;
  title?: string;
}) {
  const add = useShopifyCartStore((s) => s.add);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const [aktif, setAktif] = useState(0);
  const [eklenen, setEklenen] = useState<string | null>(null);
  const dokunusX = useRef<number | null>(null);

  if (!items.length) return null;

  const adet = items.length;
  const git = (yon: -1 | 1) => setAktif((i) => mod(i + yon, adet));

  return (
    <section
      className="w-full overflow-hidden bg-white"
      style={{ paddingTop: "clamp(48px, 4.4vw, 76px)", paddingBottom: "clamp(48px, 4.4vw, 76px)" }}
    >
      <div className="sg-container text-center">
        <p className="lx-eyebrow mb-2">{eyebrow}</p>
        <h2 className="lx-title">{title}</h2>
      </div>

      {/* Dokunmatikte parmakla kaydırma — mobilde oklar kartın üstüne biniyor,
          tek yol onlar olmasın diye */}
      <div
        className="lx-reel-sahne"
        onTouchStart={(e) => {
          dokunusX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const bas = dokunusX.current;
          dokunusX.current = null;
          if (bas == null) return;
          const fark = (e.changedTouches[0]?.clientX ?? bas) - bas;
          if (Math.abs(fark) < 45) return;
          git(fark < 0 ? 1 : -1);
        }}
      >
        {items.map((item, i) => {
          const p = item.product;
          const fark = mod(i - aktif, adet);
          const konum =
            fark === 0 ? "aktif" : fark === 1 ? "sonraki" : fark === adet - 1 ? "onceki" : "gizli";
          const eklendi = eklenen === p.handle;

          return (
            <div
              key={p.handle}
              className={`lx-reel-kart lx-reel-kart--${konum}`}
              aria-hidden={konum !== "aktif"}
            >
              {item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  poster={item.posterUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl ?? p.imageUrl}
                  alt={p.title}
                  /* Ürün görselleri beyaz zeminli paket çekimi — yatay kutuda
                     kırpılmasın diye sığdırılıyor. Video gelince kutuyu doldurur. */
                  className="absolute inset-0 h-full w-full object-contain p-8"
                />
              ) : null}

              {/* Ürün kartı — yalnızca ortadaki kartta */}
              {konum === "aktif" ? (
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 sm:bottom-4 sm:left-4">
                  <Link
                    href={`/products/${p.handle}`}
                    className="flex min-w-0 max-w-[150px] items-center gap-2 bg-white/95 p-1.5 backdrop-blur sm:max-w-[280px] sm:gap-2.5 sm:p-2"
                    style={{ boxShadow: "0 6px 24px rgba(20,17,15,0.18)" }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="h-8 w-8 shrink-0 object-contain sm:h-11 sm:w-11"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] leading-tight text-[var(--lx-ink)] sm:text-[12px]">
                        {p.title}
                      </span>
                      <span
                        className="block text-[12px] leading-tight sm:text-[13px]"
                        style={{ fontFamily: "var(--font-owners-black)", color: "var(--lx-ink)" }}
                      >
                        {formatMoney(p.price, p.currencyCode)}
                      </span>
                    </span>
                  </Link>

                  <button
                    type="button"
                    disabled={!p.availableForSale}
                    title={p.availableForSale ? "Add to cart" : "Sold out"}
                    aria-label={p.availableForSale ? `Add ${p.title} to cart` : "Sold out"}
                    onClick={() => {
                      if (!p.availableForSale) return;
                      add(p);
                    openCartDrawer();
                      setEklenen(p.handle);
                      setTimeout(() => setEklenen((h) => (h === p.handle ? null : h)), 1600);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center active:scale-95 disabled:opacity-40 sm:h-11 sm:w-11"
                    style={{
                      background: eklendi ? "var(--sg-red)" : "var(--lx-ink)",
                      color: "#ffffff",
                      boxShadow: "0 6px 24px rgba(20,17,15,0.18)",
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      {eklendi ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        <button type="button" aria-label="Previous" onClick={() => git(-1)} className="lx-reel-ok lx-reel-ok--sol">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18 9 12l6-6" />
          </svg>
        </button>
        <button type="button" aria-label="Next" onClick={() => git(1)} className="lx-reel-ok lx-reel-ok--sag">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
