"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { PageHero } from "@/components/slick/page-hero";
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
      <>
        <PageHero eyebrow="Cart" title="Your cart" subline="Nothing here yet." />
        <div className="bg-white py-20 text-center">
          <div className="sg-container">
            <Link href="/products" className="lx-btn inline-flex">
              Start shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  const amount = total();

  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="Your cart"
        subline={`${lines.length} ${lines.length === 1 ? "item" : "items"}`}
      />
      <div className="bg-white py-12 md:py-16">
      <div className="sg-container max-w-5xl">

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
                  <p className="sg-price mt-2 text-[15px]">{formatMoney(line.price, currencyCode)}</p>
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
                {formatMoney(line.price * line.quantity, currencyCode)}
              </p>
            </li>
          ))}
        </ul>

        {/* Total + Checkout — sağa hizalı (Slick) */}
        <div className="mt-10 flex flex-col items-end gap-5">
          <div
            className="flex w-full max-w-[320px] items-baseline justify-between pt-5"
            style={{ borderTop: "1px solid rgba(20,17,15,0.15)" }}
          >
            <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "rgba(20,17,15,0.55)" }}>
              Total
            </span>
            <span
              style={{
                fontFamily: "var(--font-owners-black)",
                fontWeight: 900,
                fontSize: "24px",
                color: "var(--lx-ink)",
              }}
            >
              {formatMoney(amount, currencyCode)}
            </span>
          </div>

          {/* Ödeme Shopify'ın kendi kasasında tamamlanır: kart, 3D Secure,
              vergi, kargo ve sipariş oluşturma orada yönetilir. */}
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              className="flex w-full max-w-[320px] items-center justify-center uppercase tracking-[0.16em]"
              style={{
                minHeight: 54,
                background: "var(--sg-red)",
                color: "#ffffff",
                fontFamily: "var(--font-owners)",
                fontSize: "12px",
              }}
            >
              Checkout
            </a>
          ) : (
            <span
              className="flex w-full max-w-[320px] cursor-not-allowed items-center justify-center uppercase tracking-[0.16em] opacity-40"
              style={{
                minHeight: 54,
                background: "var(--lx-ink)",
                color: "#ffffff",
                fontFamily: "var(--font-owners)",
                fontSize: "12px",
              }}
            >
              Checkout
            </span>
          )}
          <Link href="/products" className="text-[12px] uppercase tracking-[0.14em]" style={{ color: "rgba(20,17,15,0.55)" }}>
            Continue shopping
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
