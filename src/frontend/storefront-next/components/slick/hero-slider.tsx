"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/services/shopify/storefront-direct";

/**
 * Tam ekran hero slider — solda dikey olarak "yuvarlanan" başlık listesi.
 *
 * Konum SÜREKLİ bir sayı (offset). Hedef değiştiğinde her karede hedefe doğru
 * yumuşakça yaklaşır; adım adım zıplamaz.
 *
 * Sonsuz döngü: sabit sayıda satır çizilir ve her satırın içeriği
 * slides[(mutlak sıra) mod (slayt sayısı)] ile bulunur. Yani liste hiç
 * "bitmez", geri sarma ya da boşluk oluşmaz — konum sonsuza kadar artabilir.
 */

const AUTOPLAY_MS = 5000;
/** Aktif satırın üstünde/altında kaç satır görünecek */
const VISIBLE_EACH_SIDE = 3;
/** Her karede hedefe yaklaşma oranı — küçük değer = daha yumuşak, daha uzun süren */
const EASE = 0.075;
/** Kaç piksel tekerlek hareketi bir satıra denk gelsin (büyük = daha yumuşak) */
const WHEEL_PER_ROW = 118;
/** Tekerlek durduktan sonra en yakın satıra oturma gecikmesi */
const WHEEL_SETTLE_MS = 210;
/** Tek bir tekerlek olayının hedefi en fazla kaç satır ilerletebileceği —
 *  sert/ani girdilerde listenin fırlamasını engeller */
const WHEEL_MAX_STEP = 0.62;

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function HeroSlider({
  slides,
  intervalMs = AUTOPLAY_MS,
  brandImage,
  height = "min(100svh, 900px)",
  minHeight = "480px",
}: {
  slides: HeroSlide[];
  intervalMs?: number;
  /** Bölüm yüksekliği — hero tam ekran, kategori bölümü daha kısa kullanır */
  height?: string;
  minHeight?: string;
  /** Verilirse hero arka planı bu marka görseli olur (siyah zemin + ortada logo);
   *  verilmezse koleksiyon görselleri çapraz geçişle döner. */
  brandImage?: string;
}) {
  const count = slides.length;

  const sectionRef = useRef<HTMLElement | null>(null);
  const rollerRef = useRef<HTMLDivElement | null>(null);

  const offsetRef = useRef(0); // o anki sürekli konum
  const targetRef = useRef(0); // gitmek istediği konum
  const rafRef = useRef<number | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [, forceRender] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  /** Animasyon döngüsünü başlat (zaten dönüyorsa hiçbir şey yapmaz) */
  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;

    const step = () => {
      const diff = targetRef.current - offsetRef.current;

      if (Math.abs(diff) < 0.0008) {
        offsetRef.current = targetRef.current;
        rafRef.current = null;
        forceRender((n) => n + 1);
        return;
      }

      offsetRef.current += diff * EASE;
      forceRender((n) => n + 1);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      targetRef.current = next;
      if (reducedMotion) {
        offsetRef.current = next;
        forceRender((n) => n + 1);
        return;
      }
      startLoop();
    },
    [reducedMotion, startLoop],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  // Otomatik ilerleme
  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const t = setInterval(() => goTo(Math.round(targetRef.current) + 1), intervalMs);
    return () => clearInterval(t);
  }, [count, paused, reducedMotion, intervalMs, goTo]);

  /**
   * Tekerlek: imleç başlık listesinin üzerindeyken sayfa kaymaz, liste akar.
   *
   * Dinleyici hero'nun tamamına bağlı ve imlecin liste kutusunda olup olmadığı
   * koordinatla ölçülüyor — olayın hangi iç elemana düştüğüne güvenmek kırılgan.
   * preventDefault en başta çağrılıyor: Mac trackpad'i harekete 0.5-1 gibi minik
   * değerlerle başlar, onları atlarsak sayfa kayar.
   *
   * Hareket satır satır değil, tekerleğin gerçek mesafesine oranlı ilerler —
   * bu yüzden "tık tık" değil, akıcı hissettirir. Tekerlek durunca en yakın
   * satıra yumuşakça oturur.
   */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count < 2) return;

    const onWheel = (e: WheelEvent) => {
      const box = rollerRef.current?.getBoundingClientRect();
      if (!box) return;

      const inside =
        e.clientX >= box.left &&
        e.clientX <= box.right &&
        e.clientY >= box.top &&
        e.clientY <= box.bottom;
      if (!inside) return;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY === 0) return;

      const raw = e.deltaY / WHEEL_PER_ROW;
      const step = Math.max(-WHEEL_MAX_STEP, Math.min(WHEEL_MAX_STEP, raw));
      goTo(targetRef.current + step);

      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(
        () => goTo(Math.round(targetRef.current)),
        WHEEL_SETTLE_MS,
      );
    };

    section.addEventListener("wheel", onWheel, { passive: false });
    return () => section.removeEventListener("wheel", onWheel);
  }, [count, goTo]);

  if (!count) return null;

  const offset = offsetRef.current;
  const base = Math.floor(offset);
  const frac = offset - base;
  const activeIndex = mod(Math.round(offset), count);
  const current = slides[activeIndex];

  // Görünen satırlar: mutlak sıra numarasından içeriği mod ile buluyoruz,
  // bu yüzden liste hiç bitmiyor.
  const rows = [];
  for (let d = -(VISIBLE_EACH_SIDE + 1); d <= VISIBLE_EACH_SIDE + 1; d++) {
    const absolute = base + d;
    const slide = slides[mod(absolute, count)];
    const distance = Math.abs(d - frac); // merkeze uzaklık (satır cinsinden)
    rows.push({ absolute, slide, d, distance });
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ height, minHeight }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {brandImage ? (
        <div className="absolute inset-0 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandImage}
            alt="Marmara Barber"
            draggable={false}
            /* Mobilde logo yukarı alınıyor: aşağıda kayan başlık listesi var,
               ortada dursa üst üste biniyorlar. */
            className="absolute left-1/2 top-[26%] w-[62%] max-w-[440px] -translate-x-1/2 -translate-y-1/2 select-none object-contain md:top-1/2 md:w-[30%]"
            /* Logo dosyası siyah çizim; siyah zeminde görünmesi için beyaza çevriliyor */
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      ) : (
        slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.handle}
            src={s.imageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-[900ms] ease-out"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))
      )}

      {/* Masaüstü: soldan sağa karartma (metin solda) — marka zemininde gerekmez */}
      <div
        className={`absolute inset-0 ${brandImage ? "hidden" : "hidden md:block"}`}
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) 38%, rgba(0,0,0,.15) 65%, rgba(0,0,0,.45) 100%)",
        }}
      />
      {/* Mobil: görsel dar olduğu için yatay karartma yetmiyor — metnin
          bulunduğu orta bant ve alt buton bölgesi ayrıca karartılıyor. */}
      <div
        className={`absolute inset-0 ${brandImage ? "hidden" : "md:hidden"}`}
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.20) 22%, rgba(0,0,0,.62) 48%, rgba(0,0,0,.30) 72%, rgba(0,0,0,.60) 100%)",
        }}
      />

      <div className="sg-container relative flex h-full items-center">
        <div
          ref={rollerRef}
          data-hero-roller
          className="relative w-full max-w-[86vw] overflow-hidden sm:max-w-[min(380px,60vw)] md:max-w-[min(460px,42vw)]"
          style={{
            // Masaüstünde 24px punto / 24px satır / 0 harf aralığı; küçük ekranda orantılı iner.
            ["--row" as string]: "clamp(17px, 4.4vw, 24px)",
            height: `calc(var(--row) * ${VISIBLE_EACH_SIDE * 2 + 1})`,
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          }}
        >
          {rows.map(({ absolute, slide, d, distance }) => {
            const isActive = distance < 0.5;
            const opacity = isActive
              ? 1
              : Math.max(0.12, 0.55 - (distance - 0.5) * 0.24);
            const blur = Math.min(4, distance * 1.25);

            return (
              <Link
                key={absolute}
                href={slide.href}
                data-hero-row={isActive ? "active" : undefined}
                data-no-transition="true"
                onClick={(e) => {
                  if (!isActive) {
                    e.preventDefault();
                    goTo(absolute);
                  }
                }}
                tabIndex={isActive ? 0 : -1}
                aria-current={isActive ? "true" : undefined}
                aria-hidden={!isActive}
                className="sg-display absolute inset-x-0 block truncate text-left outline-none focus-visible:underline"
                style={{
                  top: `calc(var(--row) * ${VISIBLE_EACH_SIDE + d - frac})`,
                  height: "var(--row)",
                  fontSize: "var(--row)",
                  lineHeight: "var(--row)",
                  letterSpacing: "0",
                  color: isActive ? "var(--sg-red)" : "#ffffff",
                  opacity,
                  filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                }}
              >
                {slide.title}
              </Link>
            );
          })}
        </div>

        <Link
          href={current.href}
          className="absolute right-[var(--sg-gutter)] top-1/2 hidden -translate-y-1/2 px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition-transform duration-200 hover:scale-[1.04] md:block"
          style={{ background: "var(--sg-red)", color: "#ffffff" }}
        >
          View
        </Link>
      </div>

      <Link
        href={current.href}
        className="absolute bottom-8 left-1/2 min-h-11 -translate-x-1/2 px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-white md:hidden"
        style={{ background: "var(--sg-red)", color: "#ffffff" }}
      >
        View
      </Link>

      <span className="sr-only" aria-live="polite">
        {`${activeIndex + 1} / ${count}: ${current.title}`}
      </span>
    </section>
  );
}

/** İşletim sisteminde "hareketi azalt" açıksa animasyonları kapat. */
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
