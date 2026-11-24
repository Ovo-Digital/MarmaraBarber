"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/dil";
import { LxEtiket, LxHata, lxAlan, lxAlanKoyu, lxAlanStil } from "@/components/slick/auth-form";
import "@/components/slick/berber.css";

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

export function ApplicationForm({
  type,
  /** Hangi program için başvuruluyor — /wholesale kademelerinden gelir,
   *  başvuru notuna eklenir. */
  program,
  /** Koyu zeminde mi duruyor (ör. /wholesale ortak portalı) */
  koyu = false,
}: {
  type: "barber" | "wholesale" | "ambassador";
  program?: string;
  koyu?: boolean;
}) {
  const t = useT();
  const alanSinifi = koyu ? lxAlanKoyu : lxAlan;
  const alanStili = koyu ? undefined : lxAlanStil;
  const [veri, setVeri] = useState<Record<string, string>>({});
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam" | "hata">("bos");
  const [hata, setHata] = useState("");

  const alanlar = ALANLAR[type];
  const yaz = (ad: string, deger: string) => setVeri((v) => ({ ...v, [ad]: deger }));

  /* İş ortağı başvurusunda tek bir şey isteniyor: vergi kimlik numarası.
     Belge yükletmiyoruz, kod sormuyoruz — VKN işletmenin kayıtlı olduğunu
     göstermeye yetiyor, elimizde kimlik taşıyan belge arşivi birikmiyor. */
  const dogrulamaIster = type === "barber" || type === "wholesale";

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor") return;

    /* VKN asıl kanıt; eksik ya da hatalıysa göndermiyoruz ki panele
       sorgulanamayacak bir başvuru düşmesin. Türkiye'de vergi kimlik
       numarası 10 hane; şahıs işletmelerinde TC kimlik numarası (11 hane)
       vergi numarası yerine geçiyor, ikisi de kabul ediliyor. */
    if (dogrulamaIster) {
      const vkn = (veri.taxNumber ?? "").replace(/\D/g, "");
      if (!vkn) {
        setHata(t("Please enter your tax number."));
        setDurum("hata");
        return;
      }
      if (vkn.length !== 10 && vkn.length !== 11) {
        setHata(t("A tax number is 10 digits; a personal ID number is 11."));
        setDurum("hata");
        return;
      }
    }

    setDurum("gonderiliyor");
    setHata("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...veri, type, program }),
      });
      const cevap = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !cevap.ok) {
        setHata(cevap.error ? t(cevap.error) : t("We couldn't send your application right now."));
        setDurum("hata");
        return;
      }
      setDurum("tamam");
    } catch {
      setHata(t("We couldn't send your application right now."));
      setDurum("hata");
    }
  }

  if (durum === "tamam") {
    return (
      <div
        className="mx-auto w-full max-w-[640px] px-8 py-14 text-center"
        style={{ border: `1px solid ${koyu ? "rgba(255,255,255,0.18)" : "rgba(20,17,15,0.14)"}` }}
      >
        <p className="lx-eyebrow mb-3">{t("Application received")}</p>
        <h2
          className="uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(24px,2.6vw,34px)",
            color: koyu ? "#fff" : "var(--lx-ink)",
          }}
        >
          {t("Thanks — we'll be in touch")}
        </h2>
        <p
          className="mx-auto mt-4 max-w-[46ch] text-[14px]"
          style={{ color: koyu ? "rgba(255,255,255,0.65)" : "rgba(20,17,15,0.6)" }}
        >
          {dogrulamaIster
            ? t("We check your code against the official record and come back the same business day.")
            : t("We review applications in the order they arrive and reply by email.")}
        </p>
        {dogrulamaIster ? (
          <p
            className="mx-auto mt-6 max-w-[46ch] text-[13px]"
            style={{ color: koyu ? "rgba(255,255,255,0.5)" : "rgba(20,17,15,0.5)" }}
          >
            {t("Until it is approved your account stays on retail pricing.")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={gonder} className="mx-auto w-full max-w-[640px]">
      {dogrulamaIster ? (
        <fieldset className="brb-dog mb-10 border-0 p-0" data-koyu={koyu ? "" : undefined}>
          <legend className="brb-dog-baslik">{t("Verify your business")}</legend>
          <p className="brb-dog-giris">
            {t(
              "Partner pricing is for registered businesses, so we ask for your tax number and check it against the official record.",
            )}
          </p>

          <div className="mt-7">
            <LxEtiket htmlFor="taxNumber" zorunlu koyu={koyu}>
              {t("Tax number")}
            </LxEtiket>
            <input
              id="taxNumber"
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              placeholder="1234567890"
              value={veri.taxNumber ?? ""}
              onChange={(e) => yaz("taxNumber", e.target.value.replace(/\D/g, ""))}
              className={alanSinifi}
              style={alanStili}
            />
            <p className="brb-dog-nerede">
              {t("10 digits. Sole traders can use their personal ID number instead.")}
            </p>
          </div>

          <p className="brb-dog-kvkk">
            {t(
              "We check this number against the official record and keep only the result — no documents are uploaded or stored.",
            )}
          </p>
        </fieldset>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        {alanlar.map((a) => (
          <div key={a.ad} className={a.genis ? "sm:col-span-2" : ""}>
            <LxEtiket htmlFor={a.ad} zorunlu={a.zorunlu} koyu={koyu}>
              {t(a.etiket)}
            </LxEtiket>
            {a.cokSatir ? (
              <textarea
                id={a.ad}
                rows={4}
                value={veri[a.ad] ?? ""}
                onChange={(e) => yaz(a.ad, e.target.value)}
                placeholder={a.ipucu ? t(a.ipucu) : undefined}
                className={`${alanSinifi} resize-y`}
                style={alanStili}
              />
            ) : (
              <input
                id={a.ad}
                type={a.tur ?? "text"}
                required={a.zorunlu}
                value={veri[a.ad] ?? ""}
                onChange={(e) => yaz(a.ad, e.target.value)}
                placeholder={a.ipucu ? t(a.ipucu) : undefined}
                className={alanSinifi}
                style={alanStili}
              />
            )}
          </div>
        ))}
      </div>

      {hata ? (
        <div className="mt-6">
          <LxHata mesaj={hata} koyu={koyu} />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={durum === "gonderiliyor"}
        className="lx-btn-kirmizi mt-8 w-full"
        style={{ minHeight: 54 }}
      >
        {durum === "gonderiliyor" ? t("Sending…") : t("Submit application")}
      </button>

      <p
        className="mt-4 text-center text-[12px]"
        style={{ color: koyu ? "rgba(255,255,255,0.45)" : "rgba(20,17,15,0.5)" }}
      >
        {t("We only use these details to review your application and get back to you.")}
      </p>
    </form>
  );
}
