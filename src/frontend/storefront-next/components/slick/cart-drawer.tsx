"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatMoney } from "@/lib/money";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

/**
 * Mini sepet — sağ üstte, header'ın altında yüzen buzlu panel.
 *
 * Tam boy çekmece değil: eklenen ürünü göstermek ve sepete/ödemeye geçirmek
 * için var. Zemini donuk değil, arkadaki sayfa bulanık olarak geçiyor — mega
 * menü paneliyle aynı dil.
 *
 * Adet değiştirme burada yok, sepet sayfasında. Burası "eklendi" onayı.
 */
export function CartDrawer({
  open,
  onClose,
  hoverIleAcildi = false,
}: {
  open: boolean;
  onClose: () => void;
  /** İmleçle açıldıysa imleç panelden ayrılınca kapanır. Sepete eklendiğinde
   *  açıldıysa açık kalır — kullanıcı fareyi çekince kaybolmasın. */
  hoverIleAcildi?: boolean;
}) {
  const lines = useShopifyCartStore((s) => s.lines);
  const remove = useShopifyCartStore((s) => s.remove);
  const total = useShopifyCartStore((s) => s.total);
  const checkoutUrl = useShopifyCartStore((s) => s.checkoutUrl);
  const currencyCode = useShopifyCartStore((s) => s.currencyCode);

  const panelRef = useRef<HTMLDivElement | null>(null);

  /**
   * İmleçle açıldıysa: imleç panelden de hapdan da uzaklaşınca kapansın.
   *
   * Panelin üstüne onMouseLeave koymak yetmiyor — imleç panele hiç girmemiş
   * olabiliyor (sepet ikonunun üzerinde dururken panel altta açılıyor).
   */
  useEffect(() => {
    if (!open || !hoverIleAcildi) return;
    const izle = (e: PointerEvent) => {
      const kutular: DOMRect[] = [];
      if (panelRef.current) kutular.push(panelRef.current.getBoundingClientRect());
      const hap = document.querySelector(".lx-hap");
      if (hap) kutular.push(hap.getBoundingClientRect());
      const pay = 16;
      const icinde = kutular.some(
        (r) =>
          e.clientX >= r.left - pay &&
          e.clientX <= r.right + pay &&
          e.clientY >= r.top - pay &&
          e.clientY <= r.bottom + pay,
      );
      if (!icinde) onClose();
    };
    document.addEventListener("pointermove", izle);
    return () => document.removeEventListener("pointermove", izle);
  }, [open, hoverIleAcildi, onClose]);

  // Escape ile kapansın
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const adet = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    /* İmleçle açıldığında hiçbir katman tıklamayı yakalamıyor; header ve sayfa
       kullanılabilir kalıyor. Sepete eklenince açıldığında ise dışarı tıklama
       kapatsın diye yakalıyor. */
    <div className={`fixed inset-0 z-[80] ${hoverIleAcildi ? "pointer-events-none" : ""}`}>
      {/* Dışarı tıklayınca kapanır; zemin karartılmıyor ki sayfa görünsün */}
      <button
        type="button"
        className={`absolute inset-0 cursor-default ${hoverIleAcildi ? "pointer-events-none" : ""}`}
        aria-label="Close"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--sg-header-h)+12px)] px-3 sm:px-5">
        <div
          ref={panelRef}
          className="pointer-events-auto mx-auto w-full max-w-[680px] overflow-hidden rounded-[22px] sm:rounded-[26px]"
          style={{
            background: "rgba(16,14,13,0.82)",
            backdropFilter: "blur(28px) saturate(140%)",
            WebkitBackdropFilter: "blur(28px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            color: "#ffffff",
          }}
        >
          <div className="flex items-center justify-between px-5 pt-5 sm:px-7">
            <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {adet > 0 ? "Added to cart" : "Cart"}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-[11px] uppercase tracking-[0.16em]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Close
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-7">
              <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                Your cart is empty
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-6 inline-flex items-center justify-center px-8 uppercase tracking-[0.16em]"
                style={{
                  minHeight: 48,
                  background: "#ffffff",
                  color: "var(--lx-ink)",
                  fontFamily: "var(--font-owners)",
                  fontSize: "12px",
                }}
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="m-0 max-h-[46vh] list-none overflow-y-auto px-5 pt-4 sm:px-7">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-start gap-4 py-4">
                    {/* Ürün görseli kendi beyaz zemininde — panelin zemini değil */}
                    <Link
                      href={`/products/${line.handle}`}
                      onClick={onClose}
                      className="h-[74px] w-[74px] shrink-0 overflow-hidden rounded-lg bg-white"
                    >
                      {line.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={line.imageUrl} alt="" className="h-full w-full object-contain p-1.5" />
                      ) : null}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          href={`/products/${line.handle}`}
                          onClick={onClose}
                          className="min-w-0 uppercase"
                          style={{
                            fontFamily: "var(--font-owners-black)",
                            fontWeight: 900,
                            fontSize: "15px",
                            lineHeight: 1.15,
                            color: "#ffffff",
                          }}
                        >
                          {line.title}
                        </Link>
                        <span
                          className="shrink-0"
                          style={{ fontFamily: "var(--font-owners-black)", fontSize: "15px", color: "#ffffff" }}
                        >
                          {formatMoney(line.price * line.quantity, currencyCode)}
                        </span>
                      </div>

                      <p
                        className="mt-1 text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        {line.variantTitle && line.variantTitle !== "Default Title"
                          ? line.variantTitle
                          : `Qty ${line.quantity}`}
                      </p>

                      <button
                        type="button"
                        onClick={() => remove(line.id)}
                        className="mt-2.5 text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: "var(--sg-red)", fontFamily: "var(--font-owners)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-5 pb-5 sm:px-7 sm:pb-6">
                <div
                  className="flex flex-wrap items-end justify-between gap-4 pt-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.22)" }}
                >
                  <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Subtotal • {adet} {adet === 1 ? "item" : "items"}
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "26px", color: "#ffffff" }}
                  >
                    {formatMoney(total(), currencyCode)}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {checkoutUrl ? (
                    <a
                      href={checkoutUrl}
                      className="flex flex-1 items-center justify-center uppercase tracking-[0.16em]"
                      style={{
                        minHeight: 50,
                        background: "var(--sg-red)",
                        color: "#ffffff",
                        fontFamily: "var(--font-owners)",
                        fontSize: "12px",
                      }}
                    >
                      Checkout
                    </a>
                  ) : null}
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex flex-1 items-center justify-center uppercase tracking-[0.16em]"
                    style={{
                      minHeight: 50,
                      border: "1px solid rgba(255,255,255,0.45)",
                      color: "#ffffff",
                      fontFamily: "var(--font-owners)",
                      fontSize: "12px",
                    }}
                  >
                    View cart
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
