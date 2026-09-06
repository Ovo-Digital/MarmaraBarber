"use client";

import Link from "next/link";
import { formatTry } from "@/lib/marmara-catalog";
import { formatMoney } from "@/lib/money";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

export default function CartPage() {
  const lines = useShopifyCartStore((s) => s.lines);
  const update = useShopifyCartStore((s) => s.update);
  const remove = useShopifyCartStore((s) => s.remove);
  const total = useShopifyCartStore((s) => s.total);
  const checkoutUrl = useShopifyCartStore((s) => s.checkoutUrl);
  const currencyCode = useShopifyCartStore((s) => s.currencyCode);

  if (lines.length === 0) {
    return (
      <div className="bg-white py-24 text-center">
        <div className="sg-container">
          <h1 className="sg-heading text-[36px]">Cart</h1>
          <p className="sg-body mt-6 text-[#666]">Your cart is empty</p>
          <Link href="/products" className="sg-btn mt-8 inline-flex">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  const amount = total();

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="sg-container max-w-5xl">
        <h1 className="sg-heading mb-10 text-center text-[40px] md:text-[48px]">Cart</h1>

        {/* Kolon başlıkları */}
        <div className="hidden grid-cols-[1fr_140px_100px] border-b border-black/15 pb-3 text-[11px] uppercase tracking-[0.08em] text-[#888] md:grid">
          <span>Product</span>
          <span className="text-center">Quantity</span>
          <span className="text-right">Total</span>
        </div>

        <ul>
          {lines.map((line) => (
            <li
              key={line.id}
              className="grid grid-cols-1 gap-4 border-b border-black/10 py-6 md:grid-cols-[1fr_140px_100px] md:items-center md:gap-6"
            >
              {/* Product */}
              <div className="flex gap-4">
                <Link
                  href={`/products/${line.handle}`}
                  className="h-20 w-20 shrink-0 bg-[var(--sg-off)] sm:h-24 sm:w-24"
                >
                  {line.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.imageUrl} alt="" className="h-full w-full object-contain p-1.5" />
                  ) : null}
                </Link>
                <div className="min-w-0 pt-1">
                  <Link
                    href={`/products/${line.handle}`}
                    className="sg-body text-[15px] font-medium text-black hover:underline"
                  >
                    {line.title}
                  </Link>
                  <p className="sg-price mt-2 text-[15px]">{formatTry(line.price)}</p>
                </div>
              </div>

              {/* Quantity + Remove */}
              <div className="flex flex-col items-start md:items-center">
                <div className="inline-flex items-stretch border border-black/25">
                  <button
                    type="button"
                    className="px-3 py-2 text-[14px] hover:bg-[var(--sg-off)]"
                    onClick={() => update(line.id, line.quantity - 1)}
                    aria-label="Azalt"
                  >
                    −
                  </button>
                  <span className="flex min-w-10 items-center justify-center border-x border-black/25 text-[13px]">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-2 text-[14px] hover:bg-[var(--sg-off)]"
                    onClick={() => update(line.id, line.quantity + 1)}
                    aria-label="Artır"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-2 text-[12px] text-[#444] underline underline-offset-2 hover:text-black"
                  onClick={() => remove(line.id)}
                >
                  Remove
                </button>
              </div>

              {/* Line total */}
              <p className="sg-price text-left text-[15px] md:text-right">
                {formatTry(line.price * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        {/* Total + Checkout — sağa hizalı (Slick) */}
        <div className="mt-8 flex flex-col items-end gap-4">
          <p className="text-[16px]">
            <span className="text-[#333]">Total: </span>
            <span className="sg-price text-[18px]">
              {formatMoney(amount, currencyCode)}
            </span>
          </p>

          {/* Ödeme Shopify'ın kendi kasasında tamamlanır: kart, 3D Secure,
              vergi, kargo ve sipariş oluşturma orada yönetilir. */}
          {checkoutUrl ? (
            <a href={checkoutUrl} className="sg-btn min-w-[200px] text-center">
              Checkout
            </a>
          ) : (
            <span className="sg-btn min-w-[200px] cursor-not-allowed text-center opacity-40">
              Checkout
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
