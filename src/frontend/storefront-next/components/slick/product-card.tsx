"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTry } from "@/lib/marmara-catalog";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import type { Product } from "@/types/commerce";
import { useUiStore } from "@/store/ui-store";
import { useT } from "@/lib/i18n/dil";

/** Çanta + artı — başlıktaki arama önerilerindeki sepet ikonuyla aynı çizim */
function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.6 8.6h12.8l-.85 9.6a1.9 1.9 0 0 1-1.9 1.75H8.35a1.9 1.9 0 0 1-1.9-1.75z" />
      <path d="M9.1 10.9V7.8a2.9 2.9 0 0 1 5.8 0v3.1" />
      <path className="lx-sepet-arti" d="M12 12.4v4.2M9.9 14.5h4.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function SlickProductCard({
  product,
  showAddToCart = true,
  badge,
}: {
  product: Product;
  showAddToCart?: boolean;
  badge?: string;
}) {
  const t = useT();
  const add = useShopifyCartStore((s) => s.add);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const hasCompare =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;

  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "Sepete eklendi" onayı kısa süre görünür, sonra kendiliğinden geri döner
  useEffect(() => {
    if (!added) return;
    addedTimer.current = setTimeout(() => setAdded(false), 1600);
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, [added]);

  return (
    <article className="group relative flex h-full flex-col">
      {/* Kırmızı köşe ayracı — hover'da büyüyüp kartın tamamını sarıyor */}
      <span aria-hidden="true" className="lx-corner pointer-events-none absolute left-0 top-0 z-10 block" />

      <Link href={`/products/${product.handle}`} className="block">
        {/* Görsel beyaz bir panel içinde; kart zemininden gölgeyle ayrılıyor */}
        <div className="relative aspect-[7/5] overflow-hidden">
          {badge ? (
            <span className="absolute left-0 top-0 z-10 bg-[var(--sg-red)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {badge}
            </span>
          ) : null}

          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`absolute inset-0 h-full w-full object-contain p-4 transition duration-500 ${
                product.secondaryImageUrl ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-wider text-[#999]">
              {t("No image")}
            </div>
          )}

          {product.secondaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.secondaryImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-contain p-4 opacity-0 transition duration-500 group-hover:opacity-100"
            />
          ) : null}

          {!product.availableForSale && (
            <span className="absolute left-3 top-3 z-10 bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
              {t("Sold out")}
            </span>
          )}
        </div>

        {/* Hover'da sol üstte kırmızı köşe ayracı — tam çerçeveden daha sessiz */}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5 text-center">
        <Link href={`/products/${product.handle}`}>
          {/* Referans: Owners Narrow Black · 21px · 35.7px satır · 0 harf aralığı · #1C1C1C.
              Satır içi stil, projenin katmansız CSS kurallarını aşmak için. */}
          <h3
            className="line-clamp-2 uppercase"
            style={{
              fontFamily: "var(--font-owners-black)",
              fontWeight: 900,
              fontSize: "18px",
              lineHeight: "26px",
              letterSpacing: "-0.005em",
              color: "var(--lx-ink)",
              // İki satırlık sabit yükseklik: kısa ve uzun adlı ürünlerde
              // yıldız/fiyat/buton aynı hizada kalsın.
              minHeight: "52px",
            }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Ürün tipi — Shopify'dan gelir, kodda sabit değildir */}
        {product.productType ? (
          <p
            className="mt-1.5"
            style={{
              fontFamily: "var(--font-geist)",
              fontSize: "15px",
              lineHeight: 1.3,
              color: "var(--lx-stone)",
            }}
          >
            {product.productType}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-baseline justify-center gap-2">
          <p
            style={{
              fontFamily: "var(--font-owners-black)",
              fontWeight: 900,
              fontSize: "19px",
              letterSpacing: "-0.01em",
              color: "var(--lx-ink)",
            }}
          >
            {formatTry(product.price)}
          </p>
          {hasCompare ? (
            <span
              className="line-through"
              style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: "#9a9490" }}
            >
              {formatTry(product.compareAtPrice!)}
            </span>
          ) : null}
        </div>

        {showAddToCart && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              disabled={!product.availableForSale}
              aria-label={
                product.availableForSale ? t("Add {title} to cart", { title: product.title }) : t("Sold out")
              }
              title={product.availableForSale ? t("Add to cart") : t("Sold out")}
              onClick={() => {
                if (!product.availableForSale) return;
                add(product);
                openCartDrawer();
                setAdded(true);
              }}
              className={`lx-sepet-btn ${added ? "lx-sepet-btn--eklendi" : ""}`}
            >
              <span className="lx-sepet-ikon">{added ? <CheckIcon /> : <BagIcon />}</span>
              {/* İmleç gelince ikonun yanından açılan yazı */}
              <span className="lx-sepet-yazi" aria-hidden="true">
                {!product.availableForSale ? t("Sold out") : added ? t("Added") : t("Add to cart")}
              </span>
            </button>
            <span className="sr-only" aria-live="polite">
              {added ? t("{title} added to cart", { title: product.title }) : ""}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function SlickProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <SlickProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
