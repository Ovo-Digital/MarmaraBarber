import Link from "next/link";
import type { Product } from "@/types/commerce";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-lg"
    >
      <div className="aspect-square bg-zinc-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">Görsel yok</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-zinc-900">{product.title}</h3>
        <p className="mt-1 text-sm text-zinc-600">
          {product.price.toFixed(2)} {product.currencyCode}
        </p>
      </div>
    </Link>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-zinc-200">
          <div className="aspect-square bg-zinc-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-zinc-200" />
            <div className="h-3 w-1/2 rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
