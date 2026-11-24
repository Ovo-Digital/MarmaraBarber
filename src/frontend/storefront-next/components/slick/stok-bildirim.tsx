"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/dil";

/**
 * "Stoğa gelince haber ver" formu.
 *
 * Shopify'ın Storefront API'sinde stok bildirimi diye bir kayıt yok. Talep,
 * başvurularla aynı yoldan (`/api/apply`) mağazanın kendi müşteri formuna
 * `stok-bildirim` etiketiyle düşüyor: mağaza sahibi Shopify panelinde
 * etikete göre süzüyor, ek uygulama ya da abonelik gerekmiyor.
 *
 * Notun içinde hangi ürün ve hangi varyantın beklendiği yazıyor — stok
 * gelince kime haber verileceği belirsiz kalmasın.
 *
 * Otomatik e-posta GÖNDERMİYOR: haber verme işini mağaza sahibi yapıyor.
 * Burada söz verilen şey de bu, "otomatik bildirim" denmiyor.
 */
export function StokBildirim({
  urunAdi,
  urunHandle,
  varyant,
}: {
  urunAdi: string;
  urunHandle: string;
  varyant?: string | null;
}) {
  const t = useT();
  const [acik, setAcik] = useState(false);
  const [email, setEmail] = useState("");
  const [ad, setAd] = useState("");
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam">("bos");
  const [hata, setHata] = useState("");

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor") return;
    setHata("");
    if (!ad.trim()) {
      setHata(t("Please enter your name."));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setHata(t("Please enter a valid email address."));
      return;
    }
    setDurum("gonderiliyor");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "restock",
          firstName: ad.trim(),
          lastName: "",
          email: email.trim(),
          product: urunAdi,
          productHandle: urunHandle,
          variant: varyant ?? "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setHata(data.error ? t(data.error) : t("We couldn't save your request right now."));
        setDurum("bos");
        return;
      }
      setDurum("tamam");
    } catch {
      setHata(t("We couldn't save your request right now."));
      setDurum("bos");
    }
  }

  if (durum === "tamam") {
    return (
      <div
        className="mt-4 p-4"
        role="status"
        style={{ border: "1px solid var(--sg-red)", background: "rgba(225,6,0,0.04)" }}
      >
        <p
          className="uppercase"
          style={{ fontFamily: "var(--font-owners)", fontWeight: 800, fontSize: "14px", color: "var(--sg-red)" }}
        >
          {t("You're on the list.")}
        </p>
        <p className="mt-2 text-[13px]" style={{ color: "rgba(20,17,15,0.7)" }}>
          {t("We'll email {email} when this one is back.", { email: email.trim() })}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-[13px]" style={{ color: "rgba(20,17,15,0.65)" }}>
        {t("Out of stock right now.")}
      </p>

      {!acik ? (
        <button
          type="button"
          onClick={() => setAcik(true)}
          className="mt-3 w-full"
          style={{
            minHeight: 52,
            border: "1px solid var(--lx-ink)",
            background: "transparent",
            color: "var(--lx-ink)",
            fontFamily: "var(--font-owners)",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {t("Tell me when it's back")}
        </button>
      ) : (
        <form onSubmit={gonder} noValidate className="mt-3 space-y-3">
          <input
            type="text"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            placeholder={t("Your name")}
            aria-label={t("Your name")}
            className="w-full px-4 outline-none focus:border-black"
            style={{
              height: 48,
              border: "1px solid rgba(20,17,15,0.25)",
              background: "transparent",
              fontFamily: "var(--font-geist)",
              fontSize: "15px",
              color: "var(--lx-ink)",
            }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("Email")}
            aria-label={t("Email")}
            className="w-full px-4 outline-none focus:border-black"
            style={{
              height: 48,
              border: "1px solid rgba(20,17,15,0.25)",
              background: "transparent",
              fontFamily: "var(--font-geist)",
              fontSize: "15px",
              color: "var(--lx-ink)",
            }}
          />
          {hata ? (
            <p className="text-[13px]" style={{ color: "var(--sg-red)" }} role="alert">
              {hata}
            </p>
          ) : null}
          <button type="submit" disabled={durum === "gonderiliyor"} className="lx-btn-kirmizi w-full" style={{ minHeight: 52 }}>
            {durum === "gonderiliyor" ? t("Sending…") : t("Tell me when it's back")}
          </button>
          <p className="text-[12px]" style={{ color: "rgba(20,17,15,0.5)" }}>
            {t("One email when it's back in stock — nothing else.")}
          </p>
        </form>
      )}
    </div>
  );
}
