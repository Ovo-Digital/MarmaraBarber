"use client";

import { useMutation } from "@tanstack/react-query";
import { addToCart, createCart } from "@/services/shopify/commerce-api";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/commerce";

export function AddToCartButton({ product }: { product: Product }) {
  const { cartId, setCart, setCartId } = useCartStore();

  const mutation = useMutation({
    mutationFn: async () => {
      const variantId = product.variants[0]?.id;
      if (!variantId) throw new Error("Varyant bulunamadı");

      if (!cartId) {
        const cart = await createCart();
        setCartId(cart.id);
        return addToCart(cart.id, variantId, 1);
      }
      return addToCart(cartId, variantId, 1);
    },
    onSuccess: (cart) => setCart(cart),
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={!product.availableForSale || mutation.isPending}
      className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
    >
      {mutation.isPending ? "Ekleniyor..." : "Sepete Ekle"}
    </button>
  );
}
