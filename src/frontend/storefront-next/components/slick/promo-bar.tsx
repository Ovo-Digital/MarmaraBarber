"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PROMO_MESSAGES } from "@/lib/slick-theme";

export function SlickPromoBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (PROMO_MESSAGES.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % PROMO_MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const msg = PROMO_MESSAGES[i];
  const prev = () => setI((x) => (x - 1 + PROMO_MESSAGES.length) % PROMO_MESSAGES.length);
  const next = () => setI((x) => (x + 1) % PROMO_MESSAGES.length);

  return (
    <div className="relative flex h-[var(--sg-promo-h)] items-center justify-center bg-[var(--sg-red)] px-10 text-center text-white">
      <button
        type="button"
        aria-label="Önceki"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/90 hover:text-white text-sm"
      >
        ‹
      </button>
      {msg.href ? (
        <Link
          href={msg.href}
          className="sg-nav text-[var(--text-promo)] font-medium"
        >
          {msg.text}
        </Link>
      ) : (
        <span className="sg-nav text-[var(--text-promo)] font-medium">
          {msg.text}
        </span>
      )}
      <button
        type="button"
        aria-label="Sonraki"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90 hover:text-white text-sm"
      >
        ›
      </button>
    </div>
  );
}
