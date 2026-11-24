"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/dil";

/**
 * Hızlı görüşme talebi — partner girişinin yanındaki bölüm.
 *
 * Partner olmayı düşünen ama forma oturmak istemeyen kişi için: dört alan,
 * bir de ne zaman aranmak istediği. Talep `/api/apply` üzerinden Shopify'a
 * `quick-meeting` etiketli müşteri kaydı olarak düşüyor — başvurularla aynı
 * yol, ek araç yok. Mağaza sahibi Shopify panelinde etikete göre süzüyor.
 *
 * Düzen KANAR sunumunun dilinden: solda iki satırlık dev başlık + üç kısa
 * madde, sağda form paneli; buton pill, giriş hareketi sırayla (d1/d2).
 * Hiçbir mağazaya özel değer kodda sabit değil.
 */

/** Ne zaman aranmak istiyor — üç seçenek, takvim entegrasyonu yok. */
const ZAMANLAR = ["This week", "Next week", "Just call me"];

export function QuickMeeting() {
  const t = useT();
  const [veri, setVeri] = useState({ name: "", business: "", city: "", phone: "", email: "" });
  const [zaman, setZaman] = useState(ZAMANLAR[0]);
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam">("bos");
  const [hata, setHata] = useState("");

  const yaz = (k: keyof typeof veri, v: string) => setVeri((o) => ({ ...o, [k]: v }));

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor") return;
    setHata("");

    if (!veri.name.trim()) return setHata(t("Please enter your name."));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(veri.email.trim())) {
      return setHata(t("Please enter a valid email address."));
    }
    if (!veri.phone.trim()) return setHata(t("Please enter a phone number we can reach you on."));

    setDurum("gonderiliyor");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "meeting",
          firstName: veri.name.trim(),
          lastName: "",
          email: veri.email.trim(),
          business: veri.business.trim(),
          city: veri.city.trim(),
          phone: veri.phone.trim(),
          preferredTime: zaman,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setHata(data.error ? t(data.error) : t("We couldn't send your request right now."));
        setDurum("bos");
        return;
      }
      setDurum("tamam");
    } catch {
      setHata(t("We couldn't send your request right now."));
      setDurum("bos");
    }
  }

  const maddeler = [
    "Pricing, margins and the stand — straight answers.",
    "15 minutes, no slides.",
    "You talk to the person who runs the account.",
  ];

  return (
    <section id="gorusme" className="scroll-mt-24 bg-black text-white">
      <div
        className="sg-container grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16"
        style={{ paddingTop: "clamp(52px,5.5vw,92px)", paddingBottom: "clamp(52px,5.5vw,92px)" }}
      >
        {/* Sol: başlık + üç madde */}
        <div>
          <p className="lx-eyebrow mb-3">{t("Not sure yet?")}</p>
          <h2
            className="uppercase"
            style={{
              fontFamily: "var(--font-owners-black)",
              fontWeight: 900,
              fontSize: "clamp(32px, 4.6vw, 64px)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            {t("Book a quick meeting.")}
          </h2>
          <p
            className="mt-5 max-w-[46ch]"
            style={{
              fontFamily: "var(--font-geist)",
              fontWeight: 300,
              fontSize: "16px",
              lineHeight: "24px",
              color: "rgba(255,255,255,0.86)",
            }}
          >
            {t("Leave your number and we'll call you — no application needed first.")}
          </p>

          <ul className="mt-8 m-0 list-none space-y-3 p-0">
            {maddeler.map((m) => (
              <li key={m} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[7px] block shrink-0"
                  style={{ width: 16, height: 2, background: "var(--sg-red)" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-geist)",
                    fontWeight: 400,
                    fontSize: "15px",
                    lineHeight: "22px",
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {t(m)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sağ: form paneli */}
        <div className="lx-cam-panel p-6 sm:p-8">
          {durum === "tamam" ? (
            <div role="status">
              <p
                className="uppercase"
                style={{
                  fontFamily: "var(--font-owners)",
                  fontWeight: 800,
                  fontSize: "22px",
                  lineHeight: "28px",
                  color: "var(--sg-red)",
                }}
              >
                {t("Got it.")}
              </p>
              <p className="mt-3 text-[15px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                {t("We'll call you on {phone}.", { phone: veri.phone.trim() })}
              </p>
            </div>
          ) : (
            <form onSubmit={gonder} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Alan id="qm-name" etiket={t("Your name")} deger={veri.name} onChange={(v) => yaz("name", v)} />
                <Alan
                  id="qm-business"
                  etiket={t("Shop or company")}
                  deger={veri.business}
                  onChange={(v) => yaz("business", v)}
                />
                <Alan id="qm-city" etiket={t("City / country")} deger={veri.city} onChange={(v) => yaz("city", v)} />
                <Alan
                  id="qm-phone"
                  etiket={t("Phone / WhatsApp")}
                  tip="tel"
                  deger={veri.phone}
                  onChange={(v) => yaz("phone", v)}
                />
              </div>
              <div className="mt-4">
                <Alan
                  id="qm-email"
                  etiket={t("Email")}
                  tip="email"
                  deger={veri.email}
                  onChange={(v) => yaz("email", v)}
                />
              </div>

              <fieldset className="mt-6 border-0 p-0">
                <legend
                  className="mb-3 uppercase"
                  style={{
                    fontFamily: "var(--font-owners)",
                    fontWeight: 800,
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  {t("When suits you?")}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {ZAMANLAR.map((z) => {
                    const secili = zaman === z;
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZaman(z)}
                        aria-pressed={secili}
                        className="min-h-11 px-5"
                        style={{
                          borderRadius: 99,
                          border: `1px solid ${secili ? "var(--sg-red)" : "rgba(255,255,255,0.3)"}`,
                          background: secili ? "var(--sg-red)" : "transparent",
                          color: "#ffffff",
                          fontFamily: "var(--font-owners)",
                          fontWeight: 700,
                          fontSize: "13px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          transition: "background 220ms ease, border-color 220ms ease",
                        }}
                      >
                        {t(z)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {hata ? (
                <p className="mt-5 text-[13px]" style={{ color: "#ff8a8a" }} role="alert">
                  {hata}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={durum === "gonderiliyor"}
                className="lx-pill mt-6 w-full"
                style={{ minHeight: 54 }}
              >
                {durum === "gonderiliyor" ? t("Sending…") : t("Request a call")}
              </button>

              <p className="mt-4 text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {t("We only use these details to get in touch about partnership.")}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/** Koyu panelde tek satırlık alan — etiket üstte, çizgi altta. */
function Alan({
  id,
  etiket,
  deger,
  onChange,
  tip = "text",
}: {
  id: string;
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
  tip?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block uppercase"
        style={{
          fontFamily: "var(--font-owners)",
          fontWeight: 700,
          fontSize: "11px",
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {etiket}
      </label>
      <input
        id={id}
        type={tip}
        value={deger}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 outline-none focus:border-white/60"
        style={{
          height: 48,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.28)",
          color: "#ffffff",
          fontFamily: "var(--font-geist)",
          fontSize: "15px",
          transition: "border-color 200ms ease",
        }}
      />
    </div>
  );
}
