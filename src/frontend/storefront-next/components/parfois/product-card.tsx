"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/parfois-theme";
import type { Product } from "@/types/commerce";

function extractSizeLabels(product: Product): string[] {
  const labels = product.variants
    .map((v) => v.title)
    .filter((t) => t && t !== "Default Title");
  return [...new Set(labels)].slice(0, 6);
}

export function ParfoisProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const sizes = extractSizeLabels(product);

  return (
    <article className="group relative bg-white">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wider text-[#999]">
              Görsel yok
            </div>
          )}

          {!product.availableForSale && (
            <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">
              Tükendi
            </span>
          )}

          <div className="pointer-events-none absolute bottom-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-[#ddd] bg-white/95 opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
            <span className="h-2 w-2 rounded-full bg-[#ccc]" />
          </div>

          {sizes.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-3 bg-white/95 px-2 py-2.5 transition-transform duration-300 group-hover:translate-y-0">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#666]"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 pb-4 pt-3 md:px-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="pf-product-title mt-0 line-clamp-2 flex-1 normal-case md:text-[12px]">
              {product.title}
            </h3>
            <button
              type="button"
              className="mt-0.5 shrink-0 p-0.5 text-black hover:opacity-60"
              aria-label="Favorilere ekle"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/wishlist");
              }}
            >
              <BookmarkIcon />
            </button>
          </div>
          <p className="pf-product-price mt-1.5">{formatPrice(product.price, product.currencyCode)}</p>
        </div>
      </Link>
    </article>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.15">
      <path d="M2 1.5h12v15l-6-4-6 4V1.5z" strokeLinejoin="round" />
    </svg>
  );
}

export function ParfoisProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="w-full bg-[#ebebeb]">
      <div className="grid grid-cols-2 gap-px md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ParfoisProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export function ParfoisProductGridSkeleton() {
  return (
    <div className="w-full bg-[#ebebeb]">
      <div className="grid grid-cols-2 gap-px md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white">
            <div className="aspect-[3/4] bg-[#e8e8e8]" />
            <div className="space-y-2 px-3 py-3">
              <div className="h-3 w-4/5 bg-[#e8e8e8]" />
              <div className="h-3 w-1/3 bg-[#e8e8e8]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
