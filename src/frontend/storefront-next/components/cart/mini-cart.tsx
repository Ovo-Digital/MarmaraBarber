"use client";

import Link from "next/link";
import { useCartStore, useUiStore } from "@/store/cart-store";

export function MiniCart() {
  const cart = useCartStore((s) => s.cart);
  const toggle = useUiStore((s) => s.toggleMiniCart);
  const open = useUiStore((s) => s.miniCartOpen);
  const close = useUiStore((s) => s.closeMiniCart);
  const count = cart?.lines.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        Sepet ({count})
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Mini Sepet</h3>
            <button onClick={close} className="text-zinc-400 hover:text-zinc-600">✕</button>
          </div>
          {!cart || cart.lines.length === 0 ? (
            <p className="text-sm text-zinc-500">Sepetiniz boş.</p>
          ) : (
            <ul className="space-y-2">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex justify-between text-sm">
                  <span>{line.title} × {line.quantity}</span>
                  <span>{line.price.toFixed(2)} {cart.currencyCode}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <Link href="/cart" onClick={close} className="flex-1 rounded-lg bg-zinc-900 py-2 text-center text-sm text-white">
              Sepete Git
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
