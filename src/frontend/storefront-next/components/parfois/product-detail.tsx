"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addToCart, createCart } from "@/services/shopify/commerce-api";
import { useCartStore, useUiStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/parfois-theme";
import type { Product } from "@/types/commerce";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const { cartId, setCart, setCartId } = useCartStore();
  const openMiniCart = useUiStore((s) => s.toggleMiniCart);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant) throw new Error("Varyant seçin");
      if (!cartId) {
        const cart = await createCart();
        setCartId(cart.id);
        return addToCart(cart.id, selectedVariant, 1);
      }
      return addToCart(cartId, selectedVariant, 1);
    },
    onSuccess: (cart) => {
      setError(null);
      setCart(cart);
      openMiniCart();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Sepete eklenemedi"),
  });

  const variant = product.variants.find((v) => v.id === selectedVariant);

  return (
    <div className="lg:sticky lg:top-32">
      <h1 className="text-[18px] font-normal uppercase tracking-[0.08em] leading-snug">
        {product.title}
      </h1>
      <p className="mt-4 text-[16px] font-medium">
        {formatPrice(variant?.price ?? product.price, product.currencyCode)}
      </p>

      {product.variants.length > 1 && (
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3">Beden / Varyant</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v.id)}
                disabled={!v.availableForSale}
                className={`min-w-[48px] border px-4 py-2 text-[11px] uppercase tracking-wider transition ${
                  selectedVariant === v.id
                    ? "border-black bg-black text-white"
                    : "border-[#e5e5e5] hover:border-black"
                } ${!v.availableForSale ? "opacity-30 line-through" : ""}`}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setError(null);
          mutation.mutate();
        }}
        disabled={!product.availableForSale || mutation.isPending}
        className="pf-btn-primary mt-8"
      >
        {mutation.isPending ? "Ekleniyor..." : "Sepete Ekle"}
      </button>
      {error && <p className="mt-3 text-[11px] text-red-600">{error}</p>}

      {product.description && (
        <div className="mt-10 border-t border-[#e5e5e5] pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4">Ürün Açıklaması</p>
          <p className="text-[12px] text-[#666] leading-relaxed whitespace-pre-line">
            {product.description.replace(/<[^>]*>/g, "")}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3 text-[11px] text-[#666] uppercase tracking-wider">
        <p>✓ Ücretsiz kargo — 500 TL üzeri siparişlerde</p>
        <p>✓ 30 gün içinde ücretsiz iade</p>
      </div>
    </div>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="space-y-2">
      <div className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#999]">Görsel yok</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img} alt="" className="aspect-square object-cover border border-[#e5e5e5]" />
          ))}
        </div>
      )}
    </div>
  );
}
