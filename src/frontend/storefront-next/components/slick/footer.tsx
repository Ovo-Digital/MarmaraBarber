"use client";

import Link from "next/link";
import { FOOTER_COLUMNS, SITE_NAME } from "@/lib/slick-theme";

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/marmarabarber/", icon: InstagramIcon },
  { label: "Facebook", href: "https://www.facebook.com/", icon: FacebookIcon },
  { label: "YouTube", href: "https://www.youtube.com/", icon: YouTubeIcon },
  { label: "TikTok", href: "https://www.tiktok.com/", icon: TikTokIcon },
];

export function SlickFooter() {
  return (
    <footer className="mt-auto border-t border-white/20 bg-black text-white">
      {/* Üst: 3 kolon link + dikey çizgi + sosyal hesaplar.
          Bülten kaydı sayfanın hemen üstündeki bantta — iki form üst üste olmasın. */}
      <div className="sg-container grid gap-10 py-12 lg:grid-cols-[1.35fr_1px_1fr] lg:gap-0 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-3 lg:pr-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="sg-nav-bold mb-4 text-[12px] text-[var(--sg-red)]">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-[13px] text-white/85 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hidden bg-white/25 lg:block" aria-hidden />

        <div className="lg:pl-12">
          <h3 className="sg-nav-bold text-[12px] text-[var(--sg-red)]">FOLLOW</h3>
          <div className="mt-5 flex flex-wrap items-center gap-5">
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

      {/* Alt: copyright / dil */}
      <div className="sg-container pb-8 pt-2">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5 lg:pb-2">
            <p className="text-[11px] text-white/55">
              Copyright © {new Date().getFullYear()} {SITE_NAME}
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white px-3 py-1.5 text-[12px] font-semibold text-black"
              aria-label="Dil"
            >
              TR
              <span className="text-[#666]">›</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 12.2s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C18.8 5 12 5 12 5s-6.8 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.8 1 12.2 1 12.2s0 3.4.4 5c.2.9.9 1.6 1.8 1.8C5.2 19.4 12 19.4 12 19.4s6.8 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.6 7.4c-1.5-.1-2.9-.8-3.9-1.9V15a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 1 0 1.9 2.6V2.5h2.6c.2 2.4 2 4.4 4 4.9v2z" />
    </svg>
  );
}
