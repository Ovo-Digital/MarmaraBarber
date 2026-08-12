"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Breadcrumb } from "@/components/parfois/breadcrumb";
import { formatPrice } from "@/lib/parfois-theme";
import { getCart, removeFromCart, updateCartLine } from "@/services/shopify/commerce-api";
import { useCartStore } from "@/store/cart-store";
import type { Cart } from "@/types/commerce";

function CartLineItem({
  cartId,
  line,
  currency,
  onUpdated,
}: {
  cartId: string;
  line: Cart["lines"][0];
  currency: string;
  onUpdated: (cart: Cart) => void;
}) {
  const updateMutation = useMutation({
    mutationFn: (quantity: number) => updateCartLine(cartId, line.id, quantity),
    onSuccess: onUpdated,
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromCart(cartId, line.id),
    onSuccess: onUpdated,
  });

  const busy = updateMutation.isPending || removeMutation.isPending;

  return (
    <div className={`flex gap-3 border-b border-[#e5e5e5] py-5 sm:gap-4 sm:py-6 ${busy ? "opacity-60" : ""}`}>
      <Link
        href={line.productHandle ? `/products/${line.productHandle}` : "#"}
        className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-[#f5f5f5] sm:h-28 sm:w-20"
      >
        {line.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={line.imageUrl} alt={line.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-[#999]">—</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={line.productHandle ? `/products/${line.productHandle}` : "#"}
            className="text-[12px] font-medium uppercase tracking-wide hover:underline line-clamp-2"
          >
            {line.title}
          </Link>
          {line.variantTitle && line.variantTitle !== "Default Title" && (
            <p className="mt-1 text-[11px] text-[#666]">{line.variantTitle}</p>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center border border-[#e5e5e5] self-start">
            <button
              type="button"
              disabled={busy || line.quantity <= 1}
              onClick={() => updateMutation.mutate(line.quantity - 1)}
              className="px-3 py-1.5 text-[14px] hover:bg-[#f5f5f5] disabled:opacity-30"
              aria-label="Azalt"
            >
              −
            </button>
            <span className="min-w-[32px] text-center text-[12px]">{line.quantity}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => updateMutation.mutate(line.quantity + 1)}
              className="px-3 py-1.5 text-[14px] hover:bg-[#f5f5f5] disabled:opacity-30"
              aria-label="Artır"
            >
              +
            </button>
          </div>

          <p className="text-[13px] font-medium">
            {formatPrice(line.price * line.quantity, currency)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => removeMutation.mutate()}
          disabled={busy}
          className="mt-2 self-start text-[10px] uppercase tracking-[0.1em] text-[#666] underline hover:text-black disabled:opacity-40"
        >
          Kaldır
        </button>
      </div>
    </div>
  );
}

export function CartPageClient() {
  const { cartId, cart, setCart, clearCart } = useCartStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => getCart(cartId!),
    enabled: !!cartId,
    retry: false,
  });

  useEffect(() => {
    if (data) setCart(data);
  }, [data, setCart]);

  useEffect(() => {
    if (isError) clearCart();
  }, [isError, clearCart]);

  const activeCart = data ?? cart;

  const handleCartUpdated = (updated: Cart) => {
    setCart(updated);
    queryClient.setQueryData(["cart", cartId], updated);
    if (updated.lines.length === 0) clearCart();
  };

  if (!cartId && !activeCart) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
        <h1 className="text-[13px] font-semibold uppercase tracking-[0.15em] mb-4">Sepetiniz Boş</h1>
        <p className="text-[12px] text-[#666] mb-8">Henüz sepetinize ürün eklemediniz.</p>
        <Link
          href="/products"
          className="inline-block border border-black px-10 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-black hover:text-white transition"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  if (isLoading && !activeCart) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-[#e5e5e5] mb-8" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-6 border-b border-[#e5e5e5]">
            <div className="h-28 w-20 bg-[#e5e5e5]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/3 bg-[#e5e5e5]" />
              <div className="h-4 w-1/3 bg-[#e5e5e5]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activeCart || activeCart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
        <h1 className="text-[13px] font-semibold uppercase tracking-[0.15em] mb-4">Sepetiniz Boş</h1>
        <Link
          href="/products"
          className="inline-block border border-black px-10 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-black hover:text-white transition"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const itemCount = activeCart.lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 py-6 sm:py-8 lg:mx-auto lg:max-w-[1000px] lg:px-8 lg:py-12">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Sepet" }]} />
      <h1 className="mb-2 text-[16px] font-light uppercase tracking-[0.12em] sm:text-[20px] sm:tracking-[0.15em]">Sepet</h1>
      <p className="mb-6 text-[11px] uppercase tracking-wider text-[#666] sm:mb-8">{itemCount} ürün</p>

      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        <div className="border-t border-[#e5e5e5] lg:col-span-2">
          {activeCart.lines.map((line) => (
            <CartLineItem
              key={line.id}
              cartId={activeCart.id}
              line={line}
              currency={activeCart.currencyCode}
              onUpdated={handleCartUpdated}
            />
          ))}
        </div>

        <div className="mt-8 lg:mt-0">
          <div className="sticky top-20 border border-[#e5e5e5] p-4 sm:top-28 sm:p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-6">Sipariş Özeti</h2>
            <div className="space-y-3 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#666]">Ara Toplam</span>
                <span>{formatPrice(activeCart.totalAmount, activeCart.currencyCode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Kargo</span>
                <span className="text-[#666]">Hesaplanacak</span>
              </div>
            </div>
            <div className="mt-6 flex justify-between border-t border-[#e5e5e5] pt-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">Toplam</span>
              <span className="text-[15px] font-medium">
                {formatPrice(activeCart.totalAmount, activeCart.currencyCode)}
              </span>
            </div>
            <Link href="/checkout" className="pf-btn-primary mt-6 block text-center">
              Ödemeye Geç
            </Link>
            <Link
              href="/products"
              className="mt-4 block text-center text-[11px] uppercase tracking-[0.1em] text-[#666] hover:text-black underline"
            >
              Alışverişe Devam Et
            </Link>
            <p className="mt-6 text-[10px] text-[#999] leading-relaxed">
              Ücretsiz kargo kampanyası ödeme adımında uygulanır. Güvenli ödeme Shopify altyapısı ile sağlanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
