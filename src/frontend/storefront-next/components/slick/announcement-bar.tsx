"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ANNOUNCEMENT_SIDE_LINK, ANNOUNCEMENT_SLIDES } from "@/lib/slick-theme";

export function AnnouncementBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ANNOUNCEMENT_SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const slide = ANNOUNCEMENT_SLIDES[i];
  const prev = () => setI((x) => (x - 1 + ANNOUNCEMENT_SLIDES.length) % ANNOUNCEMENT_SLIDES.length);
  const next = () => setI((x) => (x + 1) % ANNOUNCEMENT_SLIDES.length);

  return (
    <div className="relative flex h-[var(--sg-promo-h)] items-center bg-[var(--sg-red)] text-white">
      <button
        type="button"
        aria-label="Önceki"
        onClick={prev}
        className="absolute left-2 z-10 px-2 text-sm opacity-90 hover:opacity-100 sm:left-3"
      >
        ‹
      </button>

      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-center px-12 sm:px-24">
        <Link href={slide.href} className="sg-promo-text truncate text-center">
          {slide.text}
        </Link>
      </div>

      <Link
        href={ANNOUNCEMENT_SIDE_LINK.href}
        className="sg-promo-text absolute right-10 hidden underline underline-offset-4 sm:right-12 sm:inline lg:right-14"
      >
        {ANNOUNCEMENT_SIDE_LINK.label}
      </Link>

      <button
        type="button"
        aria-label="Sonraki"
        onClick={next}
        className="absolute right-2 z-10 px-2 text-sm opacity-90 hover:opacity-100 sm:right-3"
      >
        ›
      </button>
    </div>
  );
}
