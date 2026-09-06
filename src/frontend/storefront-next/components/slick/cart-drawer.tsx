"use client";

import Link from "next/link";
import { formatTry } from "@/lib/marmara-catalog";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useShopifyCartStore((s) => s.lines);
  const update = useShopifyCartStore((s) => s.update);
  const remove = useShopifyCartStore((s) => s.remove);
  const total = useShopifyCartStore((s) => s.total);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Kapat" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white text-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="sg-nav text-[13px]">Cart ({lines.reduce((n, l) => n + l.quantity, 0)})</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none" aria-label="Kapat">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="sg-body py-16 text-center text-[#666]">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3 border-b border-black/5 pb-4">
                  <div className="h-20 w-20 shrink-0 bg-[var(--sg-off)]">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${line.handle}`} onClick={onClose} className="sg-product-title text-[12px] hover:underline">
                      {line.title}
                    </Link>
                    <p className="mt-1 text-[13px] font-[family-name:var(--font-owners)] font-extrabold">
                      {formatTry(line.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center border border-black">
                        <button type="button" className="px-2 py-0.5" onClick={() => update(line.id, line.quantity - 1)}>
                          −
                        </button>
                        <span className="min-w-6 text-center text-[12px]">{line.quantity}</span>
                        <button type="button" className="px-2 py-0.5" onClick={() => update(line.id, line.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <button type="button" className="text-[10px] uppercase underline" onClick={() => remove(line.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-black/10 p-5">
          <div className="mb-4 flex justify-between text-[14px]">
            <span>Subtotal</span>
            <span className="font-[family-name:var(--font-owners)] font-extrabold">{formatTry(total())}</span>
          </div>
          <Link href="/cart" onClick={onClose} className="sg-btn mb-2 w-full">
            View cart
          </Link>
          <Link href="/checkout" onClick={onClose} className="sg-btn-red w-full">
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
