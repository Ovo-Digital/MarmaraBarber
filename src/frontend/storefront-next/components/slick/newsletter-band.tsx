"use client";

import { useState } from "react";

/**
 * Kırmızı bülten bandı — solda başlık, sağda e-posta alanı.
 *
 * Form gerçekten Shopify'a gidiyor (/api/newsletter). Hiçbir yere gitmeyen
 * "teşekkürler" ekranı göstermiyoruz; hata olursa hata yazıyor.
 *
 * Metinler prop — indirim vaadi gibi bir söz ancak mağaza sahibi gerçekten
 * kodu tanımlarsa buraya yazılır.
 */
export function NewsletterBand({
  title = "Become one of us",
  body = "New drops, limited runs and barber-chair know-how. No noise, just the good stuff.",
  placeholder = "Your email address",
  ctaLabel = "Sign up",
}: {
  title?: string;
  body?: string;
  placeholder?: string;
  ctaLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam" | "hata">("bos");
  const [hata, setHata] = useState("");

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor") return;
    setDurum("gonderiliyor");
    setHata("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setHata(data.error ?? "Sign-up is unavailable right now.");
        setDurum("hata");
        return;
      }
      setDurum("tamam");
      setEmail("");
    } catch {
      setHata("Sign-up is unavailable right now.");
      setDurum("hata");
    }
  }

  return (
    <section className="w-full bg-black text-white">
      <div
        className="sg-container grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
        style={{ paddingTop: "clamp(52px, 5vw, 88px)", paddingBottom: "clamp(52px, 5vw, 88px)" }}
      >
        <div>
          <h2
            className="uppercase"
            style={{
              fontFamily: "var(--font-owners-black)",
              fontWeight: 900,
              fontSize: "clamp(28px, 3.6vw, 52px)",
              lineHeight: 1.02,
              color: "#ffffff",
            }}
          >
            {title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
            {body}
          </p>
        </div>

        <div>
          {durum === "tamam" ? (
            <p
              className="text-[13px] uppercase tracking-[0.14em]"
              style={{ fontFamily: "var(--font-owners)", color: "#ffffff" }}
              role="status"
            >
              You&apos;re in — thanks for signing up.
            </p>
          ) : (
            <form onSubmit={gonder} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 px-5 text-[15px] outline-none placeholder:text-white/45"
                style={{
                  height: 56,
                  background: "transparent",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.45)",
                }}
              />
              <button
                type="submit"
                disabled={durum === "gonderiliyor"}
                className="shrink-0 px-9 transition-transform duration-200 hover:scale-[1.03] disabled:opacity-70"
                style={{
                  height: 56,
                  background: "var(--sg-red)",
                  color: "#ffffff",
                  fontFamily: "var(--font-owners)",
                  fontSize: "13px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {durum === "gonderiliyor" ? "Sending…" : ctaLabel}
              </button>
            </form>
          )}

          {durum === "hata" ? (
            <p className="mt-3 text-[13px]" style={{ color: "#ffffff" }} role="alert">
              {hata}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
