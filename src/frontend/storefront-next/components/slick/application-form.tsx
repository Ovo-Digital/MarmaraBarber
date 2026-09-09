"use client";

import { useState } from "react";
import { LxEtiket, LxHata, lxAlan, lxAlanStil } from "@/components/slick/auth-form";

/**
 * Berber ve toptan başvuru formu.
 *
 * Tek bileşen, iki başvuru türü. Alanların hangisinin görüneceği türe göre
 * değişiyor — iki ayrı form dosyası tutmak yerine.
 *
 * Gönderim /api/apply üzerinden Shopify'a etiketli müşteri kaydı olarak
 * gidiyor; mağaza sahibi panelden etikete göre süzüyor.
 */
type Alan = {
  ad: string;
  etiket: string;
  tur?: string;
  zorunlu?: boolean;
  ipucu?: string;
  genis?: boolean;
  cokSatir?: boolean;
};

const ORTAK: Alan[] = [
  { ad: "firstName", etiket: "First name", zorunlu: true },
  { ad: "lastName", etiket: "Last name", zorunlu: true },
  { ad: "email", etiket: "Email", tur: "email", zorunlu: true, ipucu: "you@example.com" },
  { ad: "phone", etiket: "Phone", tur: "tel" },
];

const ALANLAR: Record<"barber" | "wholesale" | "ambassador", Alan[]> = {
  barber: [
    ...ORTAK,
    { ad: "business", etiket: "Shop name", zorunlu: true },
    { ad: "role", etiket: "Your role", ipucu: "Barber, owner, educator…" },
    { ad: "city", etiket: "City" },
    { ad: "country", etiket: "Country" },
    { ad: "website", etiket: "Website or Instagram", genis: true },
    { ad: "message", etiket: "Anything else?", genis: true, cokSatir: true },
  ],
  ambassador: [
    ...ORTAK,
    { ad: "website", etiket: "Instagram / TikTok / YouTube", zorunlu: true, genis: true },
    { ad: "audience", etiket: "Followers", ipucu: "Across your main platform" },
    { ad: "focus", etiket: "What do you post?", ipucu: "Barbering, grooming, lifestyle…" },
    { ad: "city", etiket: "City" },
    { ad: "country", etiket: "Country" },
    { ad: "message", etiket: "Tell us about you", genis: true, cokSatir: true },
  ],

  wholesale: [
    ...ORTAK,
    { ad: "business", etiket: "Company name", zorunlu: true },
    { ad: "role", etiket: "Your role", ipucu: "Owner, buyer, distributor…" },
    { ad: "city", etiket: "City" },
    { ad: "country", etiket: "Country", zorunlu: true },
    { ad: "volume", etiket: "Expected monthly volume", ipucu: "Units or value" },
    { ad: "website", etiket: "Website", genis: true },
    { ad: "message", etiket: "Which product ranges are you interested in?", genis: true, cokSatir: true },
  ],
};

export function ApplicationForm({ type }: { type: "barber" | "wholesale" | "ambassador" }) {
  const [veri, setVeri] = useState<Record<string, string>>({});
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam" | "hata">("bos");
  const [hata, setHata] = useState("");

  const alanlar = ALANLAR[type];
  const yaz = (ad: string, deger: string) => setVeri((v) => ({ ...v, [ad]: deger }));

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor") return;
    setDurum("gonderiliyor");
    setHata("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...veri, type }),
      });
      const cevap = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !cevap.ok) {
        setHata(cevap.error ?? "We couldn't send your application right now.");
        setDurum("hata");
        return;
      }
      setDurum("tamam");
    } catch {
      setHata("We couldn't send your application right now.");
      setDurum("hata");
    }
  }

  if (durum === "tamam") {
    return (
      <div
        className="mx-auto w-full max-w-[640px] px-8 py-14 text-center"
        style={{ border: "1px solid rgba(20,17,15,0.14)" }}
      >
        <p className="lx-eyebrow mb-3">Application received</p>
        <h2
          className="uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(24px,2.6vw,34px)",
            color: "var(--lx-ink)",
          }}
        >
          Thanks — we&apos;ll be in touch
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-[14px]" style={{ color: "rgba(20,17,15,0.6)" }}>
          We review applications in the order they arrive and reply by email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} className="mx-auto w-full max-w-[640px]">
      <div className="grid gap-6 sm:grid-cols-2">
        {alanlar.map((a) => (
          <div key={a.ad} className={a.genis ? "sm:col-span-2" : ""}>
            <LxEtiket htmlFor={a.ad} zorunlu={a.zorunlu}>
              {a.etiket}
            </LxEtiket>
            {a.cokSatir ? (
              <textarea
                id={a.ad}
                rows={4}
                value={veri[a.ad] ?? ""}
                onChange={(e) => yaz(a.ad, e.target.value)}
                placeholder={a.ipucu}
                className={`${lxAlan} resize-y`}
                style={lxAlanStil}
              />
            ) : (
              <input
                id={a.ad}
                type={a.tur ?? "text"}
                required={a.zorunlu}
                value={veri[a.ad] ?? ""}
                onChange={(e) => yaz(a.ad, e.target.value)}
                placeholder={a.ipucu}
                className={lxAlan}
                style={lxAlanStil}
              />
            )}
          </div>
        ))}
      </div>

      {hata ? (
        <div className="mt-6">
          <LxHata mesaj={hata} />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={durum === "gonderiliyor"}
        className="mt-8 w-full uppercase tracking-[0.16em] disabled:opacity-60"
        style={{
          minHeight: 54,
          background: "var(--sg-red)",
          color: "#fff",
          fontFamily: "var(--font-owners)",
          fontSize: "12px",
        }}
      >
        {durum === "gonderiliyor" ? "Sending…" : "Submit application"}
      </button>

      <p className="mt-4 text-center text-[12px]" style={{ color: "rgba(20,17,15,0.5)" }}>
        We only use these details to review your application and get back to you.
      </p>
    </form>
  );
}
