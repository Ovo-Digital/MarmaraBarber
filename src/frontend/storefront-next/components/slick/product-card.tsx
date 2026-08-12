"use client";

import Link from "next/link";
import { formatTry } from "@/lib/marmara-catalog";
import { useLocalCartStore } from "@/store/local-cart-store";
import type { Product } from "@/types/commerce";

function StarRow({ rating, count }: { rating: number; count: number }) {
  const full = Math.round(rating);
  return (
    <p className="sg-star mt-2">
      {"★".repeat(Math.min(5, full))}
      {"☆".repeat(Math.max(0, 5 - full))}
      <span className="ml-1.5 text-[11px] text-[#666]">
        {rating.toFixed(1)} ({count})
      </span>
    </p>
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
  const add = useLocalCartStore((s) => s.add);
  const rating = product.rating ?? 4.9;
  const reviewCount = product.reviewCount ?? 0;
  const hasCompare =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  return (
    <article className="group flex h-full flex-col bg-white">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[var(--sg-off)]">
          {badge ? (
            <span className="absolute left-0 top-0 z-10 bg-[var(--sg-red)] px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              {badge}
            </span>
          ) : null}
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`absolute inset-0 h-full w-full object-contain p-5 transition duration-500 ${
                product.secondaryImageUrl ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-wider text-[#999]">
              No image
            </div>
          )}
          {product.secondaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.secondaryImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-contain p-5 opacity-0 transition duration-500 group-hover:opacity-100"
            />
          ) : null}
          {!product.availableForSale && (
            <span className="absolute left-3 top-3 bg-black px-2 py-1 text-[9px] font-bold tracking-[0.08em] text-white uppercase">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4 pb-1 text-left">
        <Link href={`/products/${product.handle}`}>
          <h3 className="sg-product-title line-clamp-2 min-h-[2.5em]">{product.title}</h3>
        </Link>
        <StarRow rating={rating} count={reviewCount} />
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasCompare ? (
            <span className="sg-nav text-[12px] text-[#888] line-through">
              RRP {formatTry(product.compareAtPrice!)}
            </span>
          ) : null}
          <p className="sg-price">{formatTry(product.price)}</p>
        </div>
        {showAddToCart && (
          <button
            type="button"
            disabled={!product.availableForSale}
            className="sg-btn mt-4 w-full !py-2.5 text-[11px]"
            onClick={() => add(product)}
          >
            {product.availableForSale ? "Add to cart" : "Sold out"}
          </button>
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
