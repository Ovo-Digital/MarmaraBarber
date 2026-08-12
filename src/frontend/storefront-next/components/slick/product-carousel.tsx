"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SlickProductCard } from "@/components/slick/product-card";
import type { Product } from "@/types/commerce";

export function ProductCarousel({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-16">
      <div className="sg-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="sg-section-title !mb-0 !text-left">{title}</h2>
          <div className="flex items-center gap-2">
            {viewAllHref && (
              <Link href={viewAllHref} className="sg-nav mr-2 text-[11px] underline underline-offset-4">
                View all
              </Link>
            )}
            <button
              type="button"
              aria-label="Önceki"
              disabled={!canPrev}
              onClick={() => scrollBy(-1)}
              className="flex h-10 w-10 items-center justify-center border border-black/20 bg-white disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Sonraki"
              disabled={!canNext}
              onClick={() => scrollBy(1)}
              className="flex h-10 w-10 items-center justify-center border border-black/20 bg-white disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[70%] shrink-0 sm:w-[42%] md:w-[30%] lg:w-[23%]">
              <SlickProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
