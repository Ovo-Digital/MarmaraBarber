"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlickProductCard } from "@/components/slick/product-card";
import type { Product } from "@/types/commerce";

/**
 * Otomatik kayan ürün şeridi.
 *
 * Sonsuz döngü: ürün listesi iki kez basılır. Kaydırma yarıya ulaşınca
 * scrollLeft'ten yarı genişlik çıkarılır — içerik birebir aynı olduğu için
 * kullanıcı hiçbir sıçrama görmez, şerit sonsuza kadar akıyormuş gibi olur.
 *
 * Otomatik akış; fare üstündeyken, odaklanıldığında ve kullanıcı elle
 * kaydırdıktan kısa süre sonra durur. İşletim sisteminde "hareketi azalt"
 * açıksa hiç başlamaz.
 */

/** Otomatik akış hızı (saniyede piksel) */
const SPEED_PX_PER_SEC = 42;
/** Elle müdahaleden sonra otomatik akışın tekrar başlaması için beklenen süre */
const RESUME_AFTER_MS = 2500;

export function ProductCarousel({
  title,
  eyebrow,
  products,
}: {
  title: string;
  /** Başlığın üstünde küçük, harfleri açılmış etiket (luxury street imzası) */
  eyebrow?: string;
  products: Product[];
  /** Kullanılmıyor — referans tasarımda şeridin altında buton yok. */
  viewAllHref?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [paused, setPaused] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Sonsuz akış için liste iki kez basılıyor
  const loop = products.length ? [...products, ...products] : [];

  const normalize = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft < 0) el.scrollLeft += half;
  }, []);

  /** Elle müdahale: otomatik akışı geçici durdur */
  const nudge = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  }, []);

  // Otomatik akış döngüsü
  useEffect(() => {
    if (reducedMotion || paused || !products.length) return;

    const step = (ts: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;

      if (last != null) {
        const dt = Math.min(64, ts - last); // sekme arka plandayken sıçramasın
        el.scrollLeft += (SPEED_PX_PER_SEC * dt) / 1000;
        normalize();
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [reducedMotion, paused, products.length, normalize]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => setCanPrev(el.scrollLeft > 8);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    nudge();
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section style={{ paddingTop: "clamp(40px, 3.2vw, 60px)", paddingBottom: "clamp(40px, 3.2vw, 60px)" }}>
      <div className="sg-container">
        {/* Editoryal başlık: küçük etiket üstte, büyük başlık altta, sola hizalı.
            Ortalı başlık yerine bu — lüks markalarda okuma ritmi soldan başlar. */}
        <div className="text-center">
          {eyebrow ? <p className="lx-eyebrow mb-2">{eyebrow}</p> : null}
          <h2 className="lx-title">{title}</h2>
        </div>

        <div
          className="relative"
          style={{ marginTop: "clamp(20px, 2vw, 30px)" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            ref={scrollerRef}
            onWheel={nudge}
            onPointerDown={nudge}
            className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loop.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                className="w-[70%] shrink-0 sm:w-[42%] md:w-[30%] lg:w-[23%]"
                aria-hidden={i >= products.length}
              >
                <SlickProductCard product={product} showAddToCart />
              </div>
            ))}
          </div>

          {/* Yuvarlak oklar — görsel hizasında, şeridin kenarlarında */}
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => scrollByCard(-1)}
            className={`lx-arrow absolute left-0 top-[36%] z-10 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full md:flex ${
              canPrev ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => scrollByCard(1)}
            className="lx-arrow absolute right-0 top-[36%] z-10 hidden h-11 w-11 translate-x-1/2 items-center justify-center rounded-full md:flex"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}

/** İşletim sisteminde "hareketi azalt" açıksa otomatik akışı kapat. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return reduced;
}
