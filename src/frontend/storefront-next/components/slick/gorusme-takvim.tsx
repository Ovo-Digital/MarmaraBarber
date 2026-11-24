"use client";

import { useMemo, useState } from "react";
import { useDil, useT } from "@/lib/i18n/dil";
import { GORUSME_AYARLARI } from "@/lib/slick-theme";

/**
 * Toplantı ayarlama — takvim + saat + bilgiler.
 *
 * İş ortağı portalının üçüncü sekmesi. Üç adım: gün → saat → bilgiler.
 * Her adım kendi panelinde, geçiş sağdan kayarak.
 *
 * Günler ve saatler `GORUSME_AYARLARI`'ndan geliyor; kodda tarih sabit
 * değil. Ay ve gün adları tarayıcının diline göre (`Intl`) üretiliyor,
 * elle çevrilmiyor.
 *
 * ÖNEMLİ: Bu gerçek bir randevu sistemi DEĞİL — takvime yazan bir servise
 * bağlı değiliz. Seçilen gün/saat TALEP olarak Shopify'a `quick-meeting`
 * etiketiyle düşüyor. Ekranda "randevunuz onaylandı" demiyoruz, "teyit
 * için döneceğiz" diyoruz; aksi tutulamayacak bir söz olurdu.
 *
 * Stiller `globals.css` içindeki `.lx-tk-*` / `.lx-takvim-*` sınıflarında,
 * ölçüler KANAR sunumundan.
 */

/** Yerel saat diliminde gün karşılaştırması için YYYY-AA-GG anahtarı */
function gunAnahtari(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function GorusmeTakvimi() {
  const t = useT();
  const [dil] = useDil();
  const yerel = dil === "tr" ? "tr-TR" : dil === "es" ? "es-ES" : "en-GB";

  const bugun = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /* Seçilebilen aralık: en erken `enErkenSaat` saat sonrası, en geç
     `ileriGun` gün sonrası. Aynı güne randevu verilmiyor. */
  const enErken = useMemo(() => {
    const d = new Date(Date.now() + GORUSME_AYARLARI.enErkenSaat * 3600 * 1000);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const enGec = useMemo(() => {
    const d = new Date(bugun);
    d.setDate(d.getDate() + GORUSME_AYARLARI.ileriGun);
    return d;
  }, [bugun]);

  const [adim, setAdim] = useState<1 | 2 | 3>(1);
  const [ay, setAy] = useState(() => new Date(bugun.getFullYear(), bugun.getMonth(), 1));
  const [gun, setGun] = useState<Date | null>(null);
  const [saat, setSaat] = useState<string | null>(null);
  const [veri, setVeri] = useState({ name: "", business: "", phone: "", email: "" });
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam">("bos");
  const [hata, setHata] = useState("");

  const yaz = (k: keyof typeof veri, v: string) => setVeri((o) => ({ ...o, [k]: v }));

  /* Ayın hücreleri. Hafta pazartesi başlıyor (tr, es ve en-GB böyle). */
  const hucreler = useMemo(() => {
    const ilk = new Date(ay.getFullYear(), ay.getMonth(), 1);
    const kaydir = (ilk.getDay() + 6) % 7;
    const gunSayisi = new Date(ay.getFullYear(), ay.getMonth() + 1, 0).getDate();
    const liste: (Date | null)[] = Array.from({ length: kaydir }, () => null);
    for (let i = 1; i <= gunSayisi; i++) liste.push(new Date(ay.getFullYear(), ay.getMonth(), i));
    return liste;
  }, [ay]);

  const secilebilir = (d: Date) =>
    GORUSME_AYARLARI.gunler.includes(d.getDay()) && d >= enErken && d <= enGec;

  const oncekiVar = ay > new Date(bugun.getFullYear(), bugun.getMonth(), 1);
  const sonrakiVar = new Date(ay.getFullYear(), ay.getMonth() + 1, 1) <= enGec;

  const gunAdlari = useMemo(() => {
    const pazartesi = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(pazartesi);
      d.setDate(pazartesi.getDate() + i);
      return new Intl.DateTimeFormat(yerel, { weekday: "short" }).format(d);
    });
  }, [yerel]);

  const gunYazisi = gun
    ? new Intl.DateTimeFormat(yerel, { weekday: "short", day: "numeric", month: "short" }).format(gun)
    : "";

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (durum === "gonderiliyor" || !gun || !saat) return;
    setHata("");
    if (!veri.name.trim()) return setHata(t("Please enter your name."));
    if (!veri.phone.trim()) return setHata(t("Please enter a phone number we can reach you on."));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(veri.email.trim())) {
      return setHata(t("Please enter a valid email address."));
    }

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
          phone: veri.phone.trim(),
          preferredTime: `${gunAnahtari(gun)} ${saat}`,
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

  if (durum === "tamam" && gun && saat) {
    return (
      <div className="lx-tk-panel py-6 text-center" role="status">
        <p
          className="uppercase"
          style={{ fontFamily: "var(--font-owners)", fontWeight: 800, fontSize: "26px", color: "var(--sg-red)" }}
        >
          {t("Request received.")}
        </p>
        <p className="mx-auto mt-4 max-w-[46ch] text-[15px]" style={{ color: "rgba(255,255,255,0.82)" }}>
          {t("We'll confirm {date} at {time} by phone — if it doesn't work we'll suggest another slot.", {
            date: gunYazisi,
            time: saat,
          })}
        </p>
      </div>
    );
  }

  const adimlar: [1 | 2 | 3, string][] = [
    [1, t("Day")],
    [2, t("Time")],
    [3, t("Details")],
  ];

  return (
    <div>
      {/* Adım çubuğu — tamamlanan adıma geri dönülebiliyor */}
      <div className="lx-tk-adimlar" role="tablist" aria-label={t("Book a meeting")}>
        {adimlar.map(([n, etiket]) => {
          const durumAdi = adim === n ? "aktif" : n < adim ? "bitti" : "bekliyor";
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={adim === n}
              className="lx-tk-adim"
              data-durum={durumAdi}
              disabled={n > adim}
              onClick={() => n < adim && setAdim(n)}
            >
              <span aria-hidden="true">{String(n).padStart(2, "0")}</span>
              {etiket}
              {durumAdi === "bitti" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <path d="m5 13 4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Seçim özeti — 2. ve 3. adımda, tıklanınca o adıma döner */}
      {adim > 1 && gun ? (
        <button type="button" className="lx-tk-ozet mt-6" onClick={() => setAdim(1)}>
          {gunYazisi}
          {saat ? ` · ${saat}` : ""}
          <span aria-hidden="true" style={{ color: "var(--sg-red)" }}>
            ✎
          </span>
        </button>
      ) : null}

      {/* ── 1. Gün ───────────────────────────────────────────────────── */}
      {adim === 1 ? (
        /* Takvim genişliği sınırlı: panel 720px olunca hücreler
           aspect-ratio yüzünden 100px'e çıkıyordu, KANAR ölçüsü 44px. */
        <div className="lx-tk-panel mx-auto mt-6 max-w-[430px]" key="adim1">
          <div className="flex items-center justify-between">
            <p
              className="uppercase"
              style={{ fontFamily: "var(--font-owners)", fontWeight: 800, fontSize: "clamp(20px,2.4vw,28px)", color: "#fff" }}
            >
              {new Intl.DateTimeFormat(yerel, { month: "long", year: "numeric" }).format(ay)}
            </p>
            <div className="flex gap-2">
              <AyOk
                yon="onceki"
                kapali={!oncekiVar}
                etiket={t("Previous month")}
                onClick={() => setAy(new Date(ay.getFullYear(), ay.getMonth() - 1, 1))}
              />
              <AyOk
                yon="sonraki"
                kapali={!sonrakiVar}
                etiket={t("Next month")}
                onClick={() => setAy(new Date(ay.getFullYear(), ay.getMonth() + 1, 1))}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {gunAdlari.map((g) => (
              <span
                key={g}
                className="pb-2 text-center uppercase"
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {g}
              </span>
            ))}
            {hucreler.map((d, i) => {
              if (!d) return <span key={`bos-${i}`} />;
              const acik = secilebilir(d);
              const secili = Boolean(gun && gunAnahtari(gun) === gunAnahtari(d));
              return (
                <button
                  key={gunAnahtari(d)}
                  type="button"
                  disabled={!acik}
                  aria-pressed={secili}
                  className="lx-takvim-gun"
                  data-secili={secili ? "e" : undefined}
                  data-bugun={gunAnahtari(d) === gunAnahtari(bugun) ? "e" : undefined}
                  onClick={() => {
                    setGun(d);
                    setSaat(null);
                    setAdim(2);
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("Weekdays only. Pick a day at least a day ahead.")}
          </p>
        </div>
      ) : null}

      {/* ── 2. Saat ──────────────────────────────────────────────────── */}
      {adim === 2 ? (
        <div className="lx-tk-panel mt-6" key="adim2">
          <p
            className="uppercase"
            style={{ fontFamily: "var(--font-owners)", fontWeight: 800, fontSize: "clamp(20px,2.4vw,28px)", color: "#fff" }}
          >
            {t("Pick a time")}
          </p>
          <div className="mx-auto mt-5 grid max-w-[430px] grid-cols-2 gap-2 sm:grid-cols-3">
            {GORUSME_AYARLARI.saatler.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={saat === s}
                className="lx-takvim-saat"
                data-secili={saat === s ? "e" : undefined}
                onClick={() => {
                  setSaat(s);
                  setAdim(3);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-5 text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("Times are Türkiye time (GMT+3).")}
          </p>
        </div>
      ) : null}

      {/* ── 3. Bilgiler ──────────────────────────────────────────────── */}
      {adim === 3 && gun && saat ? (
        <form onSubmit={gonder} noValidate className="lx-tk-panel mt-6" key="adim3">
          <p
            className="uppercase"
            style={{ fontFamily: "var(--font-owners)", fontWeight: 800, fontSize: "clamp(20px,2.4vw,28px)", color: "#fff" }}
          >
            {t("Who are we calling?")}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Alan id="gt-name" etiket={t("Your name")} deger={veri.name} onChange={(v) => yaz("name", v)} />
            <Alan
              id="gt-business"
              etiket={t("Shop or company")}
              deger={veri.business}
              onChange={(v) => yaz("business", v)}
            />
            <Alan
              id="gt-phone"
              etiket={t("Phone / WhatsApp")}
              tip="tel"
              deger={veri.phone}
              onChange={(v) => yaz("phone", v)}
            />
            <Alan id="gt-email" etiket={t("Email")} tip="email" deger={veri.email} onChange={(v) => yaz("email", v)} />
          </div>

          {hata ? (
            <p className="mt-5 text-[13px]" style={{ color: "#ff8a8a" }} role="alert">
              {hata}
            </p>
          ) : null}

          <button type="submit" disabled={durum === "gonderiliyor"} className="lx-pill mt-6 w-full" style={{ minHeight: 54 }}>
            {durum === "gonderiliyor" ? t("Sending…") : t("Request this slot")}
          </button>

          <p className="mt-4 text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("This is a request, not a confirmed booking — we'll come back to you to lock it in.")}
          </p>
        </form>
      ) : null}
    </div>
  );
}

function AyOk({
  yon,
  kapali,
  etiket,
  onClick,
}: {
  yon: "onceki" | "sonraki";
  kapali: boolean;
  etiket: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={kapali} aria-label={etiket} className="lx-takvim-ok">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={yon === "onceki" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Koyu panelde tek satırlık alan. */
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
      <input id={id} type={tip} value={deger} onChange={(e) => onChange(e.target.value)} className="lx-tk-alan" />
    </div>
  );
}
