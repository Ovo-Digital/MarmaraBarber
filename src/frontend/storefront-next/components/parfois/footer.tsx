"use client";

import { useState } from "react";
import Link from "next/link";
import { FOOTER_COLUMNS, SITE_NAME } from "@/lib/parfois-theme";

export function ParfoisFooter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [openCol, setOpenCol] = useState<string | null>(null);

  return (
    <footer className="mt-auto border-t border-[#e5e5e5] bg-white">
      {/* Newsletter — Parfois style */}
      <div id="newsletter" className="border-b border-[#e5e5e5] px-4 py-14">
        <div className="mx-auto max-w-[520px] text-center">
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.16em]">E-Bültenimize Kayıt Olun</h2>
          <p className="mt-2 text-[12px] text-[#666]">Yeniliklerden ilk sizin haberiniz olsun!</p>

          {done ? (
            <p className="mt-8 text-[12px] text-[#666]">Teşekkürler! E-bülten kaydınız alındı.</p>
          ) : (
            <form
              className="mt-8 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!consent) return;
                setDone(true);
                setEmail("");
              }}
            >
              <div className="flex border border-black">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-4 py-3.5 text-[12px] outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-black px-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#333]"
                >
                  Üye Ol
                </button>
              </div>
              <label className="flex items-start gap-2 text-left text-[10px] leading-relaxed text-[#666]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                <span>
                  E-posta ile tarafıma ticari elektronik ileti gönderilmesine izin veriyorum.{" "}
                  <Link href="/kvkk" className="underline">
                    Aydınlatma Metni
                  </Link>
                </span>
              </label>
            </form>
          )}
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8 lg:py-14">
        {/* Mobile accordion */}
        <div className="md:hidden">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="border-b border-[#e5e5e5]">
              <button
                type="button"
                className="flex w-full items-center justify-between py-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em]"
                onClick={() => setOpenCol(openCol === col.title ? null : col.title)}
              >
                {col.title}
                <span>{openCol === col.title ? "−" : "+"}</span>
              </button>
              {openCol === col.title && (
                <ul className="space-y-2.5 pb-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[12px] text-[#666] hover:text-black">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden gap-8 md:grid md:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em]">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[12px] text-[#666] hover:text-black">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-[#e5e5e5] pt-8 md:flex-row md:items-center">
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]">Sosyal Medya</h3>
            <div className="flex gap-5">
              {["Instagram", "Facebook", "TikTok", "Pinterest"].map((s) => (
                <span
                  key={s}
                  className="cursor-pointer text-[11px] uppercase tracking-wider text-[#666] hover:text-black"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-[#999]">Türkiye — Türkçe</p>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] py-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#999]">
          © {new Date().getFullYear()} {SITE_NAME}. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
