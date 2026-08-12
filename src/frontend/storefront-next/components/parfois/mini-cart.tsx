"use client";

import Link from "next/link";
import { useCartStore, useUiStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/parfois-theme";

export function MiniCart({ light = false }: { light?: boolean }) {
  const cart = useCartStore((s) => s.cart);
  const toggle = useUiStore((s) => s.toggleMiniCart);
  const open = useUiStore((s) => s.miniCartOpen);
  const close = useUiStore((s) => s.closeMiniCart);
  const count = cart?.lines.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className={`relative flex items-center gap-2 ${light ? "text-white" : "text-[var(--pf-black)]"}`}
        aria-label="Sepet"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M6 6h15l-1.5 9h-12z" />
          <circle cx="9" cy="20" r="1" fill="currentColor" />
          <circle cx="18" cy="20" r="1" fill="currentColor" />
          <path d="M6 6L5 3H2" />
        </svg>
        <span className="hidden text-[11px] font-medium tracking-[0.02em] md:inline">Sepet</span>
        {count > 0 && (
          <span
            className={`absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold ${
              light ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/35" onClick={close} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-white text-[var(--pf-black)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                Sepet {count > 0 ? `(${count})` : ""}
              </h3>
              <button type="button" onClick={close} className="p-1" aria-label="Kapat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!cart || cart.lines.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[13px] text-[#666]">Sepetiniz boş.</p>
                  <Link
                    href="/products"
                    onClick={close}
                    className="mt-6 inline-block text-[11px] uppercase tracking-[0.12em] underline"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {cart.lines.map((line) => (
                    <li key={line.id} className="flex gap-4">
                      <div className="h-24 w-[72px] shrink-0 overflow-hidden bg-[#f5f5f5]">
                        {line.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={line.imageUrl} alt={line.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col justify-between text-[12px]">
                        <div>
                          <p className="uppercase tracking-wide">{line.title}</p>
                          {line.variantTitle && line.variantTitle !== "Default Title" && (
                            <p className="mt-1 text-[11px] text-[#666]">{line.variantTitle}</p>
                          )}
                          <p className="mt-1 text-[#666]">Adet: {line.quantity}</p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(line.price * line.quantity, cart.currencyCode)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart && cart.lines.length > 0 && (
              <div className="space-y-3 border-t border-[#e5e5e5] px-6 py-5">
                <div className="flex justify-between text-[12px] font-semibold uppercase tracking-wider">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(cart.totalAmount, cart.currencyCode)}</span>
                </div>
                <Link href="/cart" onClick={close} className="pf-btn-primary block text-center">
                  Sepete Git
                </Link>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="block border border-black py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-black hover:text-white"
                >
                  Ödemeye Geç
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
