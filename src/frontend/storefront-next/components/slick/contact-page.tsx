"use client";

import Link from "next/link";
import { useState } from "react";
import { COMPANY } from "@/lib/legal-content";
import { PageHero } from "@/components/slick/page-hero";
import { LxEtiket, LxHata, lxAlan, lxAlanStil } from "@/components/slick/auth-form";
import { useT } from "@/lib/i18n/dil";

const HELP_WIDE = [
  { label: "Return / Refund?", href: "/iade-ve-degisim" },
  { label: "Issue with order placed or received?", href: "/iletisim#contact-form" },
];

const HELP_GRID = [
  { label: "Track order", href: "/account", icon: TrackIcon },
  { label: "Return order", href: "/iade-ve-degisim", icon: ReturnIcon },
  { label: "Cancel order", href: "/iletisim#contact-form", icon: CancelIcon },
  { label: "Report issue", href: "/iletisim#contact-form", icon: ReportIcon },
];

const SUBJECTS = [ // İngilizce anahtarlar; ekranda t() ile çevriliyor
  "Order issue",
  "Return / Refund",
  "Product question",
  "Wholesale / Partner",
  "Other",
];

export function SlickContactPage() {
  const t = useT();
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam" | "hata">("bos");
  const [hata, setHata] = useState("");
  const [veri, setVeri] = useState({ name: "", email: "", subject: "", message: "" });
  const yaz = (ad: keyof typeof veri, deger: string) => setVeri((v) => ({ ...v, [ad]: deger }));

  /* Önceden bu form hiçbir yere göndermiyordu, yalnızca "gönderildi" yazısını
     gösteriyordu. Artık başvuru formlarıyla aynı uçtan Shopify'a "contact"
     etiketli müşteri mesajı olarak gidiyor. Dosya eki ve reCAPTCHA ibaresi
     kaldırıldı: Shopify'ın iletişim formu dosya taşımıyor, sitede reCAPTCHA yok. */
  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor") return;
    setDurum("gonderiliyor");
    setHata("");
    const [firstName, ...kalan] = veri.name.trim().split(/\s+/);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          firstName: firstName ?? "",
          lastName: kalan.join(" "),
          email: veri.email,
          subject: veri.subject,
          message: veri.message,
        }),
      });
      const cevap = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !cevap.ok) {
        setHata(cevap.error ? t(cevap.error) : t("We couldn't send your message right now."));
        setDurum("hata");
        return;
      }
      setDurum("tamam");
    } catch {
      setHata(t("We couldn't send your message right now."));
      setDurum("hata");
    }
  }

  return (
    <>
      <PageHero eyebrow="Help" title="Contact us" subline="Questions about an order, a product or working with us — we're here." />

      <div className="bg-white">
        <div className="mx-auto max-w-[760px] px-5 sm:px-6" style={{ paddingTop: "clamp(40px,5vw,72px)", paddingBottom: "clamp(64px,7vw,110px)" }}>
          {/* Kendi kendine çözülebilecekler */}
          <div className="grid gap-3 sm:grid-cols-2">
            {HELP_WIDE.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="lx-yardim-kart flex items-center justify-between px-5 py-4"
              >
                <span className="text-[14px]" style={{ color: "var(--lx-ink)" }}>{t(item.label)}</span>
                <span aria-hidden style={{ color: "var(--sg-red)" }}>→</span>
              </Link>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HELP_GRID.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="lx-yardim-kart flex flex-col items-center justify-center gap-3 px-3 py-6 text-center"
              >
                <item.icon />
                <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--lx-ink)", fontFamily: "var(--font-owners)" }}>
                  {t(item.label)}
                </span>
              </Link>
            ))}
          </div>

          <div id="contact-form" className="scroll-mt-28 pt-14">
            <p className="lx-eyebrow mb-2">{t("Send a message")}</p>
            <h2 className="lx-title mb-8">{t("Write to us")}</h2>

            {durum === "tamam" ? (
              <div className="px-8 py-12 text-center" style={{ border: "1px solid rgba(20,17,15,0.14)" }}>
                <p className="lx-eyebrow mb-3">{t("Message sent")}</p>
                <p className="text-[15px]" style={{ color: "rgba(20,17,15,0.7)" }}>
                  {t("We'll get back to you as soon as possible.")}
                </p>
              </div>
            ) : (
              <form className="grid gap-6" onSubmit={gonder}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <LxEtiket htmlFor="c-name" zorunlu>{t("Full name")}</LxEtiket>
                    <input id="c-name" type="text" required autoComplete="name" value={veri.name}
                      onChange={(e) => yaz("name", e.target.value)} className={lxAlan} style={lxAlanStil} />
                  </div>
                  <div>
                    <LxEtiket htmlFor="c-email" zorunlu>{t("Email")}</LxEtiket>
                    <input id="c-email" type="email" required autoComplete="email" placeholder="you@example.com" value={veri.email}
                      onChange={(e) => yaz("email", e.target.value)} className={lxAlan} style={lxAlanStil} />
                  </div>
                </div>

                <div>
                  <LxEtiket htmlFor="c-subject" zorunlu>{t("Subject")}</LxEtiket>
                  <select id="c-subject" required value={veri.subject} onChange={(e) => yaz("subject", e.target.value)}
                    className={`${lxAlan} appearance-none`} style={lxAlanStil}>
                    <option value="" disabled>{t("Select a subject")}</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{t(s)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <LxEtiket htmlFor="c-message" zorunlu>{t("Message")}</LxEtiket>
                  <textarea id="c-message" required rows={6} value={veri.message}
                    onChange={(e) => yaz("message", e.target.value)} className={`${lxAlan} resize-y`} style={lxAlanStil} />
                </div>

                {hata ? <LxHata mesaj={hata} /> : null}

                <button
                  type="submit"
                  disabled={durum === "gonderiliyor"}
                  className="w-full uppercase tracking-[0.16em] disabled:opacity-60"
                  style={{ minHeight: 54, background: "var(--sg-red)", color: "#fff", fontFamily: "var(--font-owners)", fontSize: "12px" }}
                >
                  {durum === "gonderiliyor" ? t("Sending…") : t("Send")}
                </button>

                <p className="text-center text-[12px]" style={{ color: "rgba(20,17,15,0.5)" }}>
                  {t("Or email us directly:")}{" "}
                  <a href={`mailto:${COMPANY.email}`} style={{ color: "var(--lx-ink)" }} className="underline underline-offset-4">
                    {COMPANY.email}
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TrackIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 8h12v10H4z" />
      <path d="M16 11h3l1 2v5h-4v-7z" />
      <circle cx="8" cy="19.5" r="1.5" />
      <circle cx="18" cy="19.5" r="1.5" />
      <circle cx="11" cy="12" r="2.5" />
      <path d="M13 14.5 15 16.5" strokeLinecap="round" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h10v9H5z" />
      <path d="M9 5v3M11 5v3" strokeLinecap="round" />
      <path d="M15 14a4 4 0 1 0-1.2 2.8" strokeLinecap="round" />
      <path d="M13.5 15.5H16v-2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CancelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h12v10H5z" />
      <path d="M9 5v3M13 5v3" strokeLinecap="round" />
      <path d="M9 13.5 13 17.5M13 13.5 9 17.5" strokeLinecap="round" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h12v10H5z" />
      <path d="M12 11v3.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M12 4.5 14.5 8H9.5L12 4.5z" />
    </svg>
  );
}
