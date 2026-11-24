"use client";

import Link from "next/link";
import { useState } from "react";
import { FOOTER_COLUMNS, FOOTER_NEWSLETTER, SITE_NAME } from "@/lib/slick-theme";
import { DilSecici, useT } from "@/lib/i18n/dil";
import { OvoImza } from "@/components/slick/ovo-imza";
import { NewsletterBand } from "@/components/slick/newsletter-band";

/* Ölçüler slickgorilla.co.uk alt bilgisinden gerçek tarayıcıda okundu
   (hesaplanmış stil, 2026-11-24): başlık Owners 28/36.4 w800 kırmızı,
   bağlantı Owners 15/19.5 w500 beyaz, telif Geist 13/16.9 w400 beyaz. */

/** Alt bilgi sütun başlığı */
const BASLIK_STILI: React.CSSProperties = {
  fontFamily: "var(--font-owners)",
  fontWeight: 800,
  fontSize: "28px",
  lineHeight: "36.4px",
  letterSpacing: "normal",
  color: "var(--sg-red)",
};

/** Alt bilgi bağlantısı */
const BAGLANTI_STILI: React.CSSProperties = {
  fontFamily: "var(--font-owners)",
  fontWeight: 500,
  fontSize: "15px",
  lineHeight: "19.5px",
  letterSpacing: "normal",
  color: "#ffffff",
};

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/marmarabarber/", icon: InstagramIcon },
  { label: "Facebook", href: "https://www.facebook.com/", icon: FacebookIcon },
  { label: "YouTube", href: "https://www.youtube.com/", icon: YouTubeIcon },
  { label: "TikTok", href: "https://www.tiktok.com/", icon: TikTokIcon },
];

/**
 * Alt bilgi sütunu. Küçük ekranda başlık bir düğme, liste katlanıyor;
 * sm ve üstünde düğme yok, liste hep açık.
 */
function FooterSutun({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  const [acik, setAcik] = useState(false);
  return (
    <div className="border-b border-white/12 py-4 sm:border-0 sm:py-0">
      <button
        type="button"
        className="flex w-full items-center justify-between sm:pointer-events-none sm:mb-[13px] sm:block"
        aria-expanded={acik}
        onClick={() => setAcik((a) => !a)}
      >
        <h3 className="uppercase" style={BASLIK_STILI}>
          {baslik}
        </h3>
        <span aria-hidden="true" className="text-lg leading-none text-white/60 sm:hidden">
          {acik ? "−" : "+"}
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out sm:!grid-rows-[1fr]"
        style={{ gridTemplateRows: acik ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2 pt-4 sm:pt-0">{children}</ul>
        </div>
      </div>
    </div>
  );
}

export function SlickFooter() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-white/20 bg-black text-white">
      {/* Üst: 3 kolon link + dikey çizgi + sosyal hesaplar.
          Bülten kaydı sayfanın hemen üstündeki bantta — iki form üst üste olmasın. */}
      <div className="sg-container grid gap-10 py-10 lg:grid-cols-[1.35fr_1px_1fr] lg:gap-0 lg:py-12">
        {/* Mobilde sütunlar katlanıyor: üç sütun 18 bağlantı demek ve
            küçük ekranda hepsi alt alta dizilip sayfayı uzatıyordu.
            sm ve üstünde her zaman açık, başlıklar tıklanmıyor. */}
        <div className="grid gap-0 sm:grid-cols-3 sm:gap-10 lg:pr-12">
          {FOOTER_COLUMNS.map((col) => (
            <FooterSutun key={col.title} baslik={t(col.title)}>
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="hover:opacity-70" style={BAGLANTI_STILI}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </FooterSutun>
          ))}
        </div>

        <div className="hidden bg-white/25 lg:block" aria-hidden />

        {/* Sağ sütun: bülten kaydı + sosyal hesaplar — Slick Gorilla'daki düzen. */}
        <div className="lg:pl-12">
          <NewsletterBand
            varyant="footer"
            title={FOOTER_NEWSLETTER.title}
            body={FOOTER_NEWSLETTER.body}
            placeholder="Your email"
            ctaLabel="Subscribe"
          />
          <div className="mt-8 flex flex-wrap items-center gap-7">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="text-white/85 hover:text-white"
              >
                <s.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Alt: ortada marka işareti, altında copyright / dil / Ovo imzası.
          md altında alt boşluk geniş: sağ alttaki sabit sohbet düğmesi
          (16px + 56px) dar ekranda imzanın üstüne biniyordu. */}
      <div className="sg-container pb-24 pt-2 md:pb-7">
        <div className="flex flex-col items-center gap-4">
          {/* Ovo Digital imzası telif satırında. Sağ alt köşede sohbet düğmesi
              sabit durduğu için köşeye değil, ortalanmış bu satıra kondu.
              Mobilde satır alt alta dizildiği için imza en alta iner. */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "16.9px",
                color: "#ffffff",
              }}
            >
              Copyright © {new Date().getFullYear()} {SITE_NAME}
            </p>
            <DilSecici koyu />
            <OvoImza />
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 12.2s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C18.8 5 12 5 12 5s-6.8 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.8 1 12.2 1 12.2s0 3.4.4 5c.2.9.9 1.6 1.8 1.8C5.2 19.4 12 19.4 12 19.4s6.8 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="22" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.6 7.4c-1.5-.1-2.9-.8-3.9-1.9V15a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 1 0 1.9 2.6V2.5h2.6c.2 2.4 2 4.4 4 4.9v2z" />
    </svg>
  );
}
