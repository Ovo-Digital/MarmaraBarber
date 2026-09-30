"use client";

/**
 * Abonelik seçici tasarım denemeleri.
 *
 * Volkan seçim yapsın diye altı ayrı tasarım. Hepsi aynı arayüzü alıyor,
 * seçilen /products/[handle] sayfasına taşınacak. Ortak kural: kare kenar,
 * sıcak nötr zemin, kırmızı yalnızca vurgu, geçişler uzun ve yavaşlayan.
 */

import { useState } from "react";
import { formatMoney } from "@/lib/money";

export type Plan = { id: string; name: string; kisa: string; indirim: number };

/** Kademeli indirim: hangi dönemde yüzde kaç. Son kademe "ve sonrası". */
export type Kademe = { donem: string; yuzde: number };

export type VaryantProps = {
  fiyat: number;
  paraBirimi: string;
  planlar: Plan[];
  secili: string | null;
  onSec: (id: string | null) => void;
};

const para = (v: number, b: string) => formatMoney(v, b);
const indirimli = (fiyat: number, yuzde: number) => fiyat * (1 - yuzde / 100);

/* ────────────────────────────────────────────────────────────────────────
   01 — KOYU PANEL
   Abonelik kutusu sitenin imza koyu zeminine ve kırmızı ışımasına oturuyor.
   Beyaz sayfanın içinde tek koyu blok: göz doğrudan oraya gidiyor.
   ──────────────────────────────────────────────────────────────────────── */
export function KoyuPanel({ fiyat, paraBirimi, planlar, secili, onSec }: VaryantProps) {
  const [plan, setPlan] = useState(planlar[0]);
  const abone = secili !== null;

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => onSec(null)}
        className={`av-sade ${!abone ? "av-sade--secili" : ""}`}
      >
        <span className="av-isaret" aria-hidden="true" />
        <span className="flex-1 text-left">
          <span className="av-etiket">One-time purchase</span>
          <span className="av-fiyat">{para(fiyat, paraBirimi)}</span>
        </span>
      </button>

      <div className={`av-koyu ${abone ? "av-koyu--secili" : ""}`}>
        <span aria-hidden="true" className="lx-kirmizi-isik" />
        <button type="button" onClick={() => onSec(plan.id)} className="av-koyu-ust">
          <span className="av-isaret av-isaret--koyu" aria-hidden="true" />
          <span className="flex-1 text-left">
            <span className="av-etiket" style={{ color: "#fff" }}>Subscribe &amp; save</span>
            <span className="av-fiyat" style={{ color: "#fff" }}>
              <span className="av-eski" style={{ color: "rgba(255,255,255,0.45)" }}>{para(fiyat, paraBirimi)}</span>
              {para(indirimli(fiyat, plan.indirim), paraBirimi)}
            </span>
          </span>
          <span className="av-rozet">−{plan.indirim}%</span>
        </button>

        <div className="av-ac" data-acik={abone}>
          <div>
            <div className="pt-4">
              <div className="av-chip-satir">
                {planlar.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`av-chip av-chip--koyu ${plan.id === p.id ? "av-chip--secili" : ""}`}
                    onClick={() => { setPlan(p); onSec(p.id); }}
                  >
                    {p.kisa}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                {plan.name} · billed automatically · cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   02 — KAYAN SEKME
   İki seçenek tek şeritte; siyah gösterge altlarında kayıyor. Sıklık
   aşağıda yatay şerit hâlinde — açılır liste yok.
   ──────────────────────────────────────────────────────────────────────── */
export function KayanSekme({ fiyat, paraBirimi, planlar, secili, onSec }: VaryantProps) {
  const [plan, setPlan] = useState(planlar[0]);
  const abone = secili !== null;

  return (
    <div>
      <div className="av-sekme" data-sag={abone}>
        <span className="av-sekme-gosterge" aria-hidden="true" />
        <button type="button" className="av-sekme-btn" onClick={() => onSec(null)} data-aktif={!abone}>
          One-time
        </button>
        <button type="button" className="av-sekme-btn" onClick={() => onSec(plan.id)} data-aktif={abone}>
          Subscribe · save {plan.indirim}%
        </button>
      </div>

      <div className="av-ac" data-acik={abone}>
        <div>
          <div className="av-chip-satir pt-4">
            {planlar.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`av-chip ${plan.id === p.id ? "av-chip--secili" : ""}`}
                onClick={() => { setPlan(p); onSec(p.id); }}
              >
                <span className="av-chip-ust">{p.kisa}</span>
                <span className="av-chip-alt">−{p.indirim}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="av-toplam">
        {abone ? (
          <>
            <span className="av-eski">{para(fiyat, paraBirimi)}</span>
            {para(indirimli(fiyat, plan.indirim), paraBirimi)}
            <span className="av-toplam-not">{plan.name.toLowerCase()}</span>
          </>
        ) : (
          para(fiyat, paraBirimi)
        )}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   03 — SIKLIK KARTLARI
   Açılır liste yok. Tek seferlik dahil her seçenek tek satırda kart.
   Seçilen kart siyaha dönüyor. Her şey tek bakışta görünüyor.
   ──────────────────────────────────────────────────────────────────────── */
export function SiklikKartlari({ fiyat, paraBirimi, planlar, secili, onSec }: VaryantProps) {
  const secenekler = [{ id: null as string | null, kisa: "Once", alt: "One-time", indirim: 0 },
    ...planlar.map((p) => ({ id: p.id as string | null, kisa: p.kisa, alt: p.name.replace(/^Delivered every /, "every "), indirim: p.indirim }))];

  return (
    <div className="av-kart-izgara">
      {secenekler.map((s) => {
        const aktif = secili === s.id;
        return (
          <button key={s.id ?? "tek"} type="button" onClick={() => onSec(s.id)} className={`av-kart ${aktif ? "av-kart--secili" : ""}`}>
            {s.indirim ? <span className="av-kart-rozet">−{s.indirim}%</span> : null}
            <span className="av-kart-sure">{s.kisa}</span>
            <span className="av-kart-alt">{s.alt}</span>
            <span className="av-kart-fiyat">{para(indirimli(fiyat, s.indirim), paraBirimi)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   04 — BİLET
   Abonelik bir bilet gibi: kenarlarda oyuk, ortada kesik çizgi, sol tarafta
   dev indirim oranı. Koleksiyon hissi veriyor.
   ──────────────────────────────────────────────────────────────────────── */
export function Bilet({ fiyat, paraBirimi, planlar, secili, onSec }: VaryantProps) {
  const [plan, setPlan] = useState(planlar[0]);
  const abone = secili !== null;

  return (
    <div className="grid gap-3">
      <button type="button" onClick={() => onSec(null)} className={`av-sade ${!abone ? "av-sade--secili" : ""}`}>
        <span className="av-isaret" aria-hidden="true" />
        <span className="flex-1 text-left">
          <span className="av-etiket">One-time purchase</span>
          <span className="av-fiyat">{para(fiyat, paraBirimi)}</span>
        </span>
      </button>

      <div className={`av-bilet ${abone ? "av-bilet--secili" : ""}`}>
        <button type="button" onClick={() => onSec(plan.id)} className="av-bilet-sol">
          <span className="av-bilet-oran">{plan.indirim}</span>
          <span className="av-bilet-yuzde">% off</span>
        </button>
        <span className="av-bilet-cizgi" aria-hidden="true" />
        <div className="av-bilet-sag">
          <button type="button" onClick={() => onSec(plan.id)} className="block w-full text-left">
            <span className="av-etiket">Subscribe &amp; save</span>
            <span className="av-fiyat">
              <span className="av-eski">{para(fiyat, paraBirimi)}</span>
              {para(indirimli(fiyat, plan.indirim), paraBirimi)}
            </span>
          </button>
          <div className="av-ac" data-acik={abone}>
            <div>
              <div className="av-chip-satir pt-3">
                {planlar.map((p) => (
                  <button key={p.id} type="button" className={`av-chip ${plan.id === p.id ? "av-chip--secili" : ""}`}
                    onClick={() => { setPlan(p); onSec(p.id); }}>
                    {p.kisa}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   05 — NUMARALI LİSTE
   Kutu yok. Sadece ince çizgiler ve numaralar. Seçilen satırın solunda
   kırmızı şerit açılıyor, detayı altında beliriyor. Sakin ve pahalı duruyor.
   ──────────────────────────────────────────────────────────────────────── */
export function NumaraliListe({ fiyat, paraBirimi, planlar, secili, onSec }: VaryantProps) {
  const satirlar = [{ id: null as string | null, ad: "One-time purchase", not: "Single delivery", indirim: 0 },
    ...planlar.map((p) => ({ id: p.id as string | null, ad: p.name, not: `Billed ${p.kisa.toLowerCase()}`, indirim: p.indirim }))];

  return (
    <ul className="av-liste">
      {satirlar.map((s, i) => {
        const aktif = secili === s.id;
        return (
          <li key={s.id ?? "tek"}>
            <button type="button" onClick={() => onSec(s.id)} className={`av-liste-satir ${aktif ? "av-liste-satir--secili" : ""}`}>
              <span className="av-liste-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-left">
                <span className="av-etiket">{s.ad}</span>
                <span className="av-liste-not">{s.not}</span>
              </span>
              <span className="av-liste-fiyat">
                {s.indirim ? <span className="av-eski">{para(fiyat, paraBirimi)}</span> : null}
                {para(indirimli(fiyat, s.indirim), paraBirimi)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   06 — TESLİMAT ÇİZELGESİ
   Sıklığı yazıyla değil, çizelgeyle anlatıyor: ay ay noktalar, teslimat
   düşen aylar kırmızı doluyor. Ne aldığını görüyorsun.
   ──────────────────────────────────────────────────────────────────────── */
export function TeslimatCizelgesi({ fiyat, paraBirimi, planlar, secili, onSec }: VaryantProps) {
  const [plan, setPlan] = useState(planlar[0]);
  const abone = secili !== null;
  /* Plan adındaki ay sayısı: "Delivered every 2 months" → 2 */
  const aralik = Number(plan.kisa.match(/\d+/)?.[0] ?? 1);
  const aylar = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="grid gap-2">
      <button type="button" onClick={() => onSec(null)} className={`av-sade ${!abone ? "av-sade--secili" : ""}`}>
        <span className="av-isaret" aria-hidden="true" />
        <span className="flex-1 text-left">
          <span className="av-etiket">One-time purchase</span>
          <span className="av-fiyat">{para(fiyat, paraBirimi)}</span>
        </span>
      </button>

      <div className={`av-sade av-sade--blok ${abone ? "av-sade--secili" : ""}`}>
        <button type="button" onClick={() => onSec(plan.id)} className="flex w-full items-start gap-3.5 text-left">
          <span className="av-isaret" aria-hidden="true" />
          <span className="flex-1">
            <span className="av-etiket">Subscribe &amp; save</span>
            <span className="av-fiyat">
              <span className="av-eski">{para(fiyat, paraBirimi)}</span>
              {para(indirimli(fiyat, plan.indirim), paraBirimi)}
            </span>
          </span>
          <span className="av-rozet">−{plan.indirim}%</span>
        </button>

        <div className="av-ac" data-acik={abone}>
          <div>
            <div className="pt-5">
              <div className="av-cizelge">
                {aylar.map((a, i) => (
                  <span key={i} className={`av-cizelge-ay ${i % aralik === 0 ? "av-cizelge-ay--dolu" : ""}`}>
                    <span className="av-cizelge-nokta" aria-hidden="true" />
                    {a}
                  </span>
                ))}
              </div>
              <div className="av-chip-satir mt-5">
                {planlar.map((p) => (
                  <button key={p.id} type="button" className={`av-chip ${plan.id === p.id ? "av-chip--secili" : ""}`}
                    onClick={() => { setPlan(p); onSec(p.id); }}>
                    {p.kisa}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ────────────────────────────────────────────────────────────────────────
   07 — KADEMELİ İNDİRİM
   Abonelik tek bir orana değil, artan bir çizelgeye bağlı: ilk ay az,
   sonraki aylar daha çok. Müşteri ne kazanacağını ay ay görüyor; bu da
   "ilk siparişi indirimli al, iptal et" davranışını kırıyor.
   ──────────────────────────────────────────────────────────────────────── */
export function KademeliIndirim({
  fiyat,
  paraBirimi,
  planlar,
  secili,
  onSec,
  kademeler,
}: VaryantProps & { kademeler: Kademe[] }) {
  const [plan, setPlan] = useState(planlar[0]);
  const abone = secili !== null;
  const sonKademe = kademeler[kademeler.length - 1];

  return (
    <div className="grid gap-2">
      <button type="button" onClick={() => onSec(null)} className={`av-sade ${!abone ? "av-sade--secili" : ""}`}>
        <span className="av-isaret" aria-hidden="true" />
        <span className="flex-1 text-left">
          <span className="av-etiket">One-time purchase</span>
          <span className="av-fiyat">{para(fiyat, paraBirimi)}</span>
        </span>
      </button>

      <div className={`av-koyu ${abone ? "av-koyu--secili" : ""}`}>
        <span aria-hidden="true" className="lx-kirmizi-isik" />
        <button type="button" onClick={() => onSec(plan.id)} className="av-koyu-ust">
          <span className="av-isaret av-isaret--koyu" aria-hidden="true" />
          <span className="flex-1 text-left">
            <span className="av-etiket" style={{ color: "#fff" }}>Subscribe &amp; save</span>
            <span className="av-fiyat" style={{ color: "#fff" }}>
              {para(indirimli(fiyat, kademeler[0].yuzde), paraBirimi)}
              <span className="av-kademe-not">then up to −{sonKademe.yuzde}%</span>
            </span>
          </span>
        </button>

        <div className="av-ac" data-acik={abone}>
          <div>
            <div className="pt-5">
              {/* Kademe çizelgesi: her dönemde ne ödeyeceği */}
              <ol className="av-kademe">
                {kademeler.map((k, i) => (
                  <li key={k.donem} className="av-kademe-adim" style={{ transitionDelay: `${i * 70}ms` }} data-acik={abone}>
                    <span className="av-kademe-cizgi" aria-hidden="true" />
                    <span className="av-kademe-donem">{k.donem}</span>
                    <span className="av-kademe-oran">−{k.yuzde}%</span>
                    <span className="av-kademe-fiyat">{para(indirimli(fiyat, k.yuzde), paraBirimi)}</span>
                  </li>
                ))}
              </ol>

              <div className="av-chip-satir mt-5">
                {planlar.map((p) => (
                  <button key={p.id} type="button" className={`av-chip av-chip--koyu ${plan.id === p.id ? "av-chip--secili" : ""}`}
                    onClick={() => { setPlan(p); onSec(p.id); }}>
                    {p.kisa}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                {plan.name} · discount grows with every order · cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
