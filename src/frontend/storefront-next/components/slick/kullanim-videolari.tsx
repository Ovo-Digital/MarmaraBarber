"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/dil";

/**
 * Kullanım videoları bölümü — 9:16 kartlar.
 *
 * Videolar Shopify'ın ÜRÜN MEDYASINDAN geliyor (`product.videolar`); kodda
 * hiçbir video adresi sabit değil. Mağazaya video yüklenince bu bölüm
 * kendiliğinden dolar.
 *
 * Henüz video yokken sahte bir oynat düğmesi göstermiyoruz: ürünün kendi
 * görselleri kapak olarak duruyor ve üstünde "Yakında" etiketi var. Tıklanacak
 * bir şey yok, çünkü oynatılacak bir şey de yok.
 *
 * Ölçüler KANAR sunumunun film bloğundan: 9:16, 30px yarıçap, derin gölge,
 * sessiz otomatik oynatma, sağ üstte "sesi aç" hapı. iPhone'da aynı anda
 * birden fazla video çökmeye yol açtığı için EKRANDA GÖRÜNEN TEK VİDEO
 * oynuyor, diğerleri duruyor.
 */
export function KullanimVideolari({
  videolar,
  kapaklar,
  urunAdi,
}: {
  videolar?: { url: string; posterUrl?: string }[];
  kapaklar: string[];
  urunAdi: string;
}) {
  const t = useT();
  const varVideo = (videolar ?? []).length > 0;
  const kartlar = varVideo ? videolar!.slice(0, 3) : kapaklar.slice(0, 3).map((u) => ({ url: "", posterUrl: u }));

  if (!kartlar.length) return null;

  return (
    <section className="border-t border-black/10 bg-white">
      <div
        className="sg-container"
        style={{ paddingTop: "clamp(44px,4.5vw,76px)", paddingBottom: "clamp(44px,4.5vw,76px)" }}
      >
        <h2
          className="mb-3 text-center uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(26px, 3.4vw, 44px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "var(--lx-ink)",
          }}
        >
          {t("Watch it work")}
        </h2>
        {!varVideo ? (
          <p
            className="mb-8 text-center"
            style={{ fontFamily: "var(--font-geist)", fontWeight: 300, fontSize: "15px", color: "#666" }}
          >
            {t("Product videos are on the way.")}
          </p>
        ) : (
          <div className="mb-8" />
        )}

        {/* Mobilde kaydırmalı şerit, masaüstünde ortalanmış kartlar.
            Grid yerine ortalanmış flex: tek kart kalınca sayfanın solunda
            asılı durmuyor. Kart genişliği KANAR'ın film bloğundan. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:justify-center md:gap-6 md:overflow-visible md:px-0">
          {kartlar.map((k, i) => (
            <VideoKart
              key={k.url || k.posterUrl || i}
              kaynak={k.url}
              poster={k.posterUrl}
              baslik={urunAdi}
              yakinda={!varVideo}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoKart({
  kaynak,
  poster,
  baslik,
  yakinda,
}: {
  kaynak: string;
  poster?: string;
  baslik: string;
  yakinda: boolean;
}) {
  const t = useT();
  const ref = useRef<HTMLVideoElement | null>(null);
  const [sesli, setSesli] = useState(false);

  /* Ekrana girince oynat, çıkınca durdur. Böylece sayfada hiçbir zaman
     birden fazla video aynı anda çalmıyor. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([giris]) => {
        if (giris.isIntersecting) void el.play().catch(() => {});
        else {
          el.pause();
          setSesli(false);
          el.muted = true;
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function sesAc() {
    const el = ref.current;
    if (!el) return;
    el.muted = sesli;
    setSesli(!sesli);
    if (!sesli) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    }
  }

  return (
    <div
      className="relative w-[78vw] shrink-0 snap-center overflow-hidden md:w-[320px]"
      style={{
        aspectRatio: "9 / 16",
        borderRadius: 30,
        border: "1px solid rgba(0,0,0,0.1)",
        background: "#f3f1ee",
        boxShadow: "0 70px 120px -70px rgba(0,0,0,0.6)",
      }}
    >
      {kaynak ? (
        <video
          ref={ref}
          src={kaynak}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={baslik} className="h-full w-full object-cover" />
      ) : null}

      {/* Alttan karartma — başlık okunabilsin */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,0.7))" }}
      />

      <p
        className="absolute bottom-5 left-5 right-5 uppercase"
        style={{
          fontFamily: "var(--font-owners)",
          fontWeight: 800,
          fontSize: "15px",
          lineHeight: "20px",
          color: "#ffffff",
        }}
      >
        {baslik}
      </p>

      {yakinda ? (
        <span
          className="absolute right-4 top-4 uppercase"
          style={{
            padding: "9px 15px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            color: "#ffffff",
            fontFamily: "var(--font-owners)",
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.1em",
          }}
        >
          {t("Coming soon")}
        </span>
      ) : (
        <button
          type="button"
          onClick={sesAc}
          className="absolute right-4 top-4 uppercase"
          style={{
            padding: "9px 15px",
            borderRadius: 999,
            background: sesli ? "#ffffff" : "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            color: sesli ? "#121212" : "#ffffff",
            fontFamily: "var(--font-owners)",
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.1em",
            transition: "background 250ms ease, color 250ms ease",
          }}
        >
          {sesli ? t("Mute") : t("Sound on")}
        </button>
      )}
    </div>
  );
}
