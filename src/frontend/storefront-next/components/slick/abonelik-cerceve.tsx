"use client";

/**
 * Abonelik bloğunun ÇERÇEVE denemeleri.
 *
 * Bilet ve kademeli fiyat mantığı sabit; değişen tek şey bloğun beyaz ürün
 * sayfasına nasıl oturduğu. Koyu panel tek başına sayfadan kopuk duruyordu,
 * alternatifleri burada yan yana görülüyor.
 *
 * Her çerçeve `.ac-<ad>` sınıfıyla ayrılıyor; ortak iskelet aynı.
 */

import { useState } from "react";
import { formatMoney } from "@/lib/money";

export type Plan = { id: string; name: string; kisa: string };
export type Kademe = { siparis: number | null; yuzde: number };

const para = (v: number, b: string) => formatMoney(v, b);
const indirimli = (fiyat: number, yuzde: number) => fiyat * (1 - yuzde / 100);

export function AbonelikBlok({
  cerceve,
  fiyat,
  paraBirimi,
  planlar,
  kademeler,
  isima = false,
}: {
  cerceve: string;
  fiyat: number;
  paraBirimi: string;
  planlar: Plan[];
  kademeler: Kademe[];
  /** Koyu çerçevelerde alttan kırmızı ışıma */
  isima?: boolean;
}) {
  const [secili, setSecili] = useState<string | null>(null);
  const [plan, setPlan] = useState(planlar[0]);
  const abone = secili !== null;
  const ilk = kademeler[0];
  const devam = kademeler[kademeler.length - 1];
  const kademeliMi = ilk.yuzde !== devam.yuzde;

  return (
    <div className={`ac ${cerceve}`}>
      {isima ? <span aria-hidden="true" className="ac-isima" /> : null}

      <div className="ac-ic">
        {/* Tek seferlik */}
        <button
          type="button"
          onClick={() => setSecili(null)}
          className={`ac-tek ${!abone ? "ac-secili" : ""}`}
          aria-pressed={!abone}
        >
          <span className="ac-isaret" aria-hidden="true" />
          <span className="flex-1 text-left">
            <span className="ac-etiket">One-time purchase</span>
            <span className="ac-fiyat">{para(fiyat, paraBirimi)}</span>
          </span>
        </button>

        {/* Bilet */}
        <div className={`ac-bilet ${abone ? "ac-secili" : ""}`}>
          <button
            type="button"
            onClick={() => setSecili(plan.id)}
            className="ac-kupon"
            aria-label="Subscribe and save"
          >
            {kademeliMi ? <span className="ac-kupon-kadar">up to</span> : null}
            <span className="ac-kupon-oran">{Math.round(devam.yuzde)}</span>
            <span className="ac-kupon-yuzde">% off</span>
          </button>

          <span className="ac-perfore" aria-hidden="true" />

          <div className="ac-govde">
            <button type="button" onClick={() => setSecili(plan.id)} className="w-full text-left">
              <span className="flex items-start gap-3.5">
                <span className="ac-isaret" aria-hidden="true" />
                <span className="flex-1">
                  <span className="ac-etiket">Subscribe &amp; save</span>
                  <span className="ac-fiyat">
                    <span className="ac-eski">{para(fiyat, paraBirimi)}</span>
                    {para(indirimli(fiyat, abone ? ilk.yuzde : devam.yuzde), paraBirimi)}
                  </span>
                </span>
              </span>
            </button>

            <div className="ac-ac" data-acik={abone}>
              <div>
                <div className="pt-4">
                  <div className="ac-siklik">
                    {planlar.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`ac-chip ${plan.id === p.id ? "ac-chip--secili" : ""}`}
                        onClick={() => { setPlan(p); setSecili(p.id); }}
                      >
                        {p.kisa}
                      </button>
                    ))}
                  </div>
                  <p className="ac-ozet">
                    {para(indirimli(fiyat, ilk.yuzde), paraBirimi)} on your first order, then{" "}
                    {para(indirimli(fiyat, devam.yuzde), paraBirimi)} — {plan.name.toLowerCase()}
                  </p>
                  <p className="ac-not">Cancel or change anytime from your account.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
