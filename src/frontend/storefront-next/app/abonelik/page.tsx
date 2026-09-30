"use client";

/**
 * Abonelik seçici tasarım denemeleri — seçim yapmak için iç sayfa.
 * Menüde yok, siteden bağlantı verilmiyor.
 */

import { useState } from "react";
import {
  Bilet,
  KayanSekme,
  KoyuPanel,
  NumaraliListe,
  SiklikKartlari,
  TeslimatCizelgesi,
  type Plan,
  type VaryantProps,
} from "@/components/slick/abonelik-varyant";

const PLANLAR: Plan[] = [
  { id: "p1", name: "Delivered every month", kisa: "1 mo", indirim: 10 },
  { id: "p2", name: "Delivered every 2 months", kisa: "2 mo", indirim: 10 },
  { id: "p3", name: "Delivered every 3 months", kisa: "3 mo", indirim: 15 },
];

const FIYAT = 349;
const PARA = "TRY";

const DENEMELER: { ad: string; aciklama: string; Govde: (p: VaryantProps) => React.ReactElement }[] = [
  {
    ad: "01 — Koyu panel",
    aciklama:
      "Abonelik kutusu sitenin imza koyu zeminine ve alttan yükselen kırmızı ışımasına oturuyor. Beyaz sayfanın içindeki tek koyu blok olduğu için göz doğrudan oraya gidiyor. Seçilince ışıma güçleniyor ve panel gölgeyle kalkıyor.",
    Govde: KoyuPanel,
  },
  {
    ad: "02 — Kayan sekme",
    aciklama:
      "İki seçenek tek şeritte; siyah gösterge altlarında kayıyor. Açılır liste yok, sıklık aşağıda şerit hâlinde. Fiyat en altta tek satırda değişiyor. En az yer kaplayan seçenek.",
    Govde: KayanSekme,
  },
  {
    ad: "03 — Sıklık kartları",
    aciklama:
      "Hiç açılır liste yok. Tek seferlik dahil dört seçenek yan yana kart. Seçilen kart siyaha dönüyor, üstüne gelince kalkıyor. Her şey tek bakışta görünüyor, tıklama sayısı en az.",
    Govde: SiklikKartlari,
  },
  {
    ad: "04 — Bilet",
    aciklama:
      "Abonelik bir bilet gibi: kenarlarda oyuk, ortada kesik çizgi, solda dev indirim oranı. Seçilince sol blok kırmızıya dönüyor. Barber kültürüne yakın, koleksiyon hissi veren seçenek.",
    Govde: Bilet,
  },
  {
    ad: "05 — Numaralı liste",
    aciklama:
      "Kutu yok, sadece ince çizgiler ve numaralar. Seçilen satırın solunda kırmızı şerit açılıyor ve satır içeri kayıyor. En sakin, en pahalı duran seçenek.",
    Govde: NumaraliListe,
  },
  {
    ad: "06 — Teslimat çizelgesi",
    aciklama:
      "Sıklığı yazıyla değil çizelgeyle anlatıyor: on iki ay noktalarla diziliyor, teslimat düşen aylar kırmızıya dönüyor. Sıklığı değiştirince noktalar yeniden diziliyor — ne aldığını görüyorsun.",
    Govde: TeslimatCizelgesi,
  },
];

export default function AbonelikDenemeleri() {
  return (
    <main style={{ background: "#fff", minHeight: "100vh", padding: "clamp(28px,5vw,64px) 0 120px" }}>
      <div className="mx-auto w-full max-w-[720px] px-5">
        <p className="lx-eyebrow mb-3">Deneme</p>
        <h1
          className="uppercase"
          style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.03, color: "var(--lx-ink)" }}
        >
          Abonelik seçici
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.65)" }}>
          Altı ayrı tasarım. Hepsi çalışıyor — tıkla, sıklığı değiştir, dene. Beğendiğinin
          numarasını söyle, ürün sayfasına onu taşıyayım. Fiyat ve oranlar örnek.
        </p>

        {DENEMELER.map(({ ad, aciklama, Govde }) => (
          <section key={ad} className="mt-16 border-t pt-10" style={{ borderColor: "rgba(20,17,15,0.12)" }}>
            <h2
              className="uppercase"
              style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "20px", color: "var(--lx-ink)" }}
            >
              {ad}
            </h2>
            <p className="mb-8 mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(20,17,15,0.6)" }}>
              {aciklama}
            </p>
            <Deneme Govde={Govde} />
          </section>
        ))}
      </div>
    </main>
  );
}

/** Her denemenin kendi seçim durumu — biri diğerini etkilemesin */
function Deneme({ Govde }: { Govde: (p: VaryantProps) => React.ReactElement }) {
  const [secili, setSecili] = useState<string | null>(null);
  return (
    <Govde fiyat={FIYAT} paraBirimi={PARA} planlar={PLANLAR} secili={secili} onSec={setSecili} />
  );
}
