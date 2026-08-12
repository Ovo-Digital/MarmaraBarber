"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PROMO_MESSAGES } from "@/lib/parfois-theme";

export function PromoBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PROMO_MESSAGES.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  if (!visible) return null;

  const current = PROMO_MESSAGES[index];

  return (
    <div className="relative bg-[var(--pf-utility-bg)] text-[var(--pf-black)]">
      <div className="mx-auto flex min-h-[36px] max-w-[1440px] items-center justify-center px-10 py-2 pr-9 text-center sm:px-12">
        {current.href ? (
          <Link
            href={current.href}
            className={`line-clamp-2 text-[9px] font-medium uppercase leading-snug tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em] ${
              current.highlight ? "text-[var(--pf-pink)]" : ""
            }`}
          >
            {current.text.includes("%10") ? (
              <>
                ÜYELERE ÖZEL İLK ALIŞVERİŞTE GEÇERLİ <strong>%10 İNDİRİM!</strong>
              </>
            ) : (
              current.text
            )}
          </Link>
        ) : (
          <span className="line-clamp-2 text-[9px] font-medium uppercase leading-snug tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em]">{current.text}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100"
        aria-label="Kapat"
      >
        <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
          <path d="M2.25 2.25L12.75 12.75M2.25 12.75L12.75 2.25" stroke="currentColor" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
