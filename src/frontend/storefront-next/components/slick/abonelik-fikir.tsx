"use client";

/**
 * Abonelik bloğu — yeni bakış açısı denemeleri.
 *
 * Önceki denemelerde indirim, kutunun içinde küçük bir rakamdı; kimse merak
 * etmiyordu. Burada indirim bloğun KAHRAMANI: dev tipografi, ışıma, hareket.
 * Seçim satırları geri çekiliyor, kutu sayısı azalıyor.
 *
 * Teknikler (Magic UI / React Bits'te de geçen kalıplar, hepsi kendi
 * CSS'imizle; yeni paket yok):
 *   - shimmer: metnin üstünden geçen ışık (background-clip: text)
 *   - glow/bloom: drop-shadow ile yumuşak hale, nefes alan nabız
 *   - border beam: kenarda dönen ışık huzmesi (conic-gradient + mask)
 *   - number ticker: rakamın sayarak gelmesi
 *
 * prefers-reduced-motion açıkken hareketler duruyor (CSS tarafında).
 */

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/money";

export type Plan = { id: string; name: string; kisa: string };
export type Kademe = { siparis: number | null; yuzde: number };

const para = (v: number, b: string) => formatMoney(v, b);
const indirimli = (fiyat: number, yuzde: number) => fiyat * (1 - yuzde / 100);

type Ortak = {
  fiyat: number;
  paraBirimi: string;
  planlar: Plan[];
  kademeler: Kademe[];
};

/** Seçim satırları — her fikirde ortak, sade. Kutu yerine çizgi. */
function Secimler({
  fiyat,
  paraBirimi,
  planlar,
  kademeler,
  secili,
  onSec,
  plan,
  onPlan,
  koyu = false,
}: Ortak & {
  secili: string | null;
  onSec: (id: string | null) => void;
  plan: Plan;
  onPlan: (p: Plan) => void;
  koyu?: boolean;
}) {
  const abone = secili !== null;
  const ilk = kademeler[0];
  const devam = kademeler[kademeler.length - 1];

  return (
    <div className={`af-secim ${koyu ? "af-secim--koyu" : ""}`}>
      <button type="button" className={`af-satir ${!abone ? "af-satir--secili" : ""}`} onClick={() => onSec(null)}>
        <span className="af-tik" aria-hidden="true" />
        <span className="af-satir-ad">One-time</span>
        <span className="af-satir-fiyat">{para(fiyat, paraBirimi)}</span>
      </button>

      <button type="button" className={`af-satir ${abone ? "af-satir--secili" : ""}`} onClick={() => onSec(plan.id)}>
        <span className="af-tik" aria-hidden="true" />
        <span className="af-satir-ad">Subscribe</span>
        <span className="af-satir-fiyat">
          <span className="af-eski">{para(fiyat, paraBirimi)}</span>
          {para(indirimli(fiyat, abone ? ilk.yuzde : devam.yuzde), paraBirimi)}
        </span>
      </button>

      <div className="af-ac" data-acik={abone}>
        <div>
          <div className="af-siklik">
            {planlar.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`af-chip ${plan.id === p.id ? "af-chip--secili" : ""}`}
                onClick={() => { onPlan(p); onSec(p.id); }}
              >
                {p.kisa}
              </button>
            ))}
          </div>
          <p className="af-ozet">
            {para(indirimli(fiyat, ilk.yuzde), paraBirimi)} first order, then{" "}
            {para(indirimli(fiyat, devam.yuzde), paraBirimi)} · {plan.name.toLowerCase()} · cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

/** Rakamı sayarak getiren küçük kanca — ekrana girince bir kez çalışıyor. */
function useSayac(hedef: number, calis: boolean) {
  const [deger, setDeger] = useState(0);
  useEffect(() => {
    if (!calis) { setDeger(0); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDeger(hedef); return; }
    let iptal = false;
    const sure = 900;
    const bas = performance.now();
    const adim = (t: number) => {
      if (iptal) return;
      const o = Math.min(1, (t - bas) / sure);
      // sona doğru yavaşlayan eğri
      setDeger(Math.round(hedef * (1 - Math.pow(1 - o, 3))));
      if (o < 1) requestAnimationFrame(adim);
    };
    requestAnimationFrame(adim);
    return () => { iptal = true; };
  }, [hedef, calis]);
  return deger;
}

/** Ekrana girdi mi? */
function useGorunur<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [gorunur, setGorunur] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([g]) => { if (g.isIntersecting) setGorunur(true); }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, gorunur };
}

/* ────────────────────────────────────────────────────────────────────────
   1 — DEV RAKAM
   Kutu yok. İndirim dev bir tipografi; üstünden düzenli aralıklarla ışık
   geçiyor. Altında iki satır seçim, çizgiyle ayrılmış.
   ──────────────────────────────────────────────────────────────────────── */
export function DevRakam(p: Ortak) {
  const [secili, setSecili] = useState<string | null>(null);
  const [plan, setPlan] = useState(p.planlar[0]);
  const devam = p.kademeler[p.kademeler.length - 1];

  return (
    <div className="af af--dev">
      <p className="af-ust">Subscribe &amp; save</p>
      <p className="af-dev-rakam">
        <span className="af-shimmer">{Math.round(devam.yuzde)}%</span>
        <span className="af-dev-off">off</span>
      </p>
      <p className="af-dev-alt">every order after the first</p>
      <Secimler {...p} secili={secili} onSec={setSecili} plan={plan} onPlan={setPlan} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   2 — NEON MÜHÜR
   Yuvarlak bir damga, hafif eğik, arkasında nefes alan kırmızı hale.
   Çıkartma gibi satırların üstüne binmiş.
   ──────────────────────────────────────────────────────────────────────── */
export function NeonMuhur(p: Ortak) {
  const [secili, setSecili] = useState<string | null>(null);
  const [plan, setPlan] = useState(p.planlar[0]);
  const devam = p.kademeler[p.kademeler.length - 1];

  return (
    <div className="af af--muhur">
      <span aria-hidden="true" className="lx-kirmizi-isik" />
      <div className="af-muhur">
        <span className="af-muhur-hale" aria-hidden="true" />
        <span className="af-muhur-ic">
          <span className="af-muhur-oran">{Math.round(devam.yuzde)}</span>
          <span className="af-muhur-yuzde">% off</span>
        </span>
      </div>
      <div className="af-muhur-govde">
        <p className="af-ust af-ust--koyu">Subscribe &amp; save</p>
        <Secimler {...p} secili={secili} onSec={setSecili} plan={plan} onPlan={setPlan} koyu />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   3 — DÖNEN IŞIK HUZMESİ
   Sakin bir kart, ama kenarında sürekli dönen bir ışık var. Kutu gürültüsü
   yok; hareketi gören göz duruyor ve bakıyor.
   ──────────────────────────────────────────────────────────────────────── */
export function IsikHuzmesi(p: Ortak) {
  const [secili, setSecili] = useState<string | null>(null);
  const [plan, setPlan] = useState(p.planlar[0]);
  const devam = p.kademeler[p.kademeler.length - 1];

  return (
    <div className="af af--huzme">
      <span className="af-huzme-kenar" aria-hidden="true" />
      <div className="af-huzme-ic">
        <div className="af-huzme-ust">
          <p className="af-ust">Subscribe &amp; save</p>
          <p className="af-huzme-oran">
            <span className="af-shimmer">{Math.round(devam.yuzde)}%</span>
          </p>
        </div>
        <Secimler {...p} secili={secili} onSec={setSecili} plan={plan} onPlan={setPlan} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   4 — PARLAYAN ŞERİT
   Üstte tam genişlik kırmızı şerit; üzerinden düzenli aralıklarla parlama
   geçiyor. Altı bembeyaz ve sakin.
   ──────────────────────────────────────────────────────────────────────── */
export function ParlayanSerit(p: Ortak) {
  const [secili, setSecili] = useState<string | null>(null);
  const [plan, setPlan] = useState(p.planlar[0]);
  const devam = p.kademeler[p.kademeler.length - 1];

  return (
    <div className="af af--serit">
      <div className="af-serit">
        <span className="af-serit-parla" aria-hidden="true" />
        <span className="af-serit-yazi">
          Subscribe &amp; save up to <strong>{Math.round(devam.yuzde)}%</strong>
        </span>
      </div>
      <div className="af-serit-govde">
        <Secimler {...p} secili={secili} onSec={setSecili} plan={plan} onPlan={setPlan} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   5 — SAYAN RAKAM
   Rakam ekrana girince 0'dan hedefe sayıyor, arkasında kırmızı hale bir kez
   açılıyor. Hareket bir kez oluyor, sonra sakin kalıyor.
   ──────────────────────────────────────────────────────────────────────── */
export function SayanRakam(p: Ortak) {
  const [secili, setSecili] = useState<string | null>(null);
  const [plan, setPlan] = useState(p.planlar[0]);
  const devam = p.kademeler[p.kademeler.length - 1];
  const { ref, gorunur } = useGorunur<HTMLDivElement>();
  const sayi = useSayac(Math.round(devam.yuzde), gorunur);

  return (
    <div className="af af--sayac" ref={ref}>
      <div className="af-sayac-ust">
        <span className={`af-sayac-hale ${gorunur ? "af-sayac-hale--acik" : ""}`} aria-hidden="true" />
        <p className="af-sayac-rakam" aria-label={`${Math.round(devam.yuzde)} percent off`}>
          <span aria-hidden="true">{sayi}</span>
          <span className="af-sayac-yuzde" aria-hidden="true">%</span>
        </p>
        <p className="af-ust af-ust--koyu">off every order after the first</p>
      </div>
      <Secimler {...p} secili={secili} onSec={setSecili} plan={plan} onPlan={setPlan} koyu />
    </div>
  );
}
