"use client";

/**
 * Abonelik bloğu — fikir denemeleri. Seçim yapmak için iç sayfa.
 * Menüde yok, siteden bağlantı verilmiyor.
 *
 * Önceki turda indirim kutunun içinde küçük bir rakamdı ve kimsenin
 * dikkatini çekmiyordu. Burada indirim bloğun kahramanı.
 */

import {
  DevRakam,
  IsikHuzmesi,
  NeonMuhur,
  ParlayanSerit,
  SayanRakam,
  type Kademe,
  type Plan,
} from "@/components/slick/abonelik-fikir";

const PLANLAR: Plan[] = [
  { id: "p1", name: "Delivered every month", kisa: "1 month" },
  { id: "p2", name: "Delivered every 2 months", kisa: "2 months" },
  { id: "p3", name: "Delivered every 3 months", kisa: "3 months" },
];

/* A modeli: ilk sipariş %5, ikinciden itibaren %15 */
const KADEMELER: Kademe[] = [
  { siparis: 1, yuzde: 5 },
  { siparis: null, yuzde: 15 },
];

const ORTAK = { fiyat: 349, paraBirimi: "TRY", planlar: PLANLAR, kademeler: KADEMELER };

const FIKIRLER = [
  {
    ad: "1 — Dev rakam",
    aciklama:
      "Kutu yok. İndirim sayfadaki en büyük tipografi ve üstünden düzenli aralıklarla ışık geçiyor. Seçim satırları altta, ince çizgilerle ayrılmış. Hiçbir şey kutuya hapsedilmemiş.",
    Govde: DevRakam,
  },
  {
    ad: "2 — Neon mühür",
    aciklama:
      "Yuvarlak bir damga, hafif eğik, çıkartma gibi bloğun üstüne binmiş. Arkasında nefes alan kırmızı hale var. Koyu zeminde duruyor, gözle görülür şekilde parlıyor.",
    Govde: NeonMuhur,
  },
  {
    ad: "3 — Dönen ışık huzmesi",
    aciklama:
      "Kart sakin ve beyaz, ama kenarında sürekli dönen bir ışık huzmesi var. Kutu gürültüsü yok; hareketi gören göz kendiliğinden duruyor. En incelikli dikkat çekme yöntemi.",
    Govde: IsikHuzmesi,
  },
  {
    ad: "4 — Parlayan şerit",
    aciklama:
      "Üstte tam genişlik kırmızı şerit; üzerinden belirli aralıklarla bir parlama geçiyor. Altı bembeyaz ve sakin. Kampanya hissi en yüksek olan.",
    Govde: ParlayanSerit,
  },
  {
    ad: "5 — Sayan rakam",
    aciklama:
      "Rakam ekrana girince sıfırdan sayarak yükseliyor, arkasında kırmızı hale bir kez açılıyor. Hareket bir kere oluyor, sonra sakinleşiyor — sürekli oynamıyor ama kaçırılmıyor.",
    Govde: SayanRakam,
  },
];

export default function AbonelikFikirleri() {
  return (
    <main style={{ background: "#fff", minHeight: "100vh", padding: "clamp(28px,5vw,64px) 0 140px" }}>
      <div className="mx-auto w-full max-w-[620px] px-5">
        <p className="lx-eyebrow mb-3">Deneme</p>
        <h1
          className="uppercase"
          style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.03, color: "var(--lx-ink)" }}
        >
          Abonelik · yeni bakış
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.65)" }}>
          İndirim artık kutunun içinde küçük bir rakam değil, bloğun kahramanı.
          Genişlik ürün sayfasındaki sütunla aynı. Hepsi çalışıyor — tıkla,
          sıklığı değiştir. Beğendiğinin numarasını söyle.
        </p>

        {FIKIRLER.map(({ ad, aciklama, Govde }) => (
          <section key={ad} className="mt-16 border-t pt-10" style={{ borderColor: "rgba(20,17,15,0.12)" }}>
            <h2
              className="uppercase"
              style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "20px", color: "var(--lx-ink)" }}
            >
              {ad}
            </h2>
            <p className="mb-10 mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(20,17,15,0.6)" }}>
              {aciklama}
            </p>
            <Govde {...ORTAK} />
          </section>
        ))}
      </div>
    </main>
  );
}
