"use client";

/**
 * Abonelik bloğunun ÇERÇEVE denemeleri — seçim yapmak için iç sayfa.
 * Menüde yok, siteden bağlantı verilmiyor.
 *
 * Bilet tasarımı ve kademeli fiyat mantığı seçildi; burada değişen tek şey
 * bloğun beyaz ürün sayfasına nasıl oturduğu.
 */

import { AbonelikBlok, type Kademe, type Plan } from "@/components/slick/abonelik-cerceve";

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

const FIYAT = 349;
const PARA = "TRY";

const DENEMELER = [
  {
    ad: "A — Krem panel",
    aciklama:
      "Blok, sayfanın zaten kullandığı sıcak krem zemine oturuyor. Beyazdan ayrılıyor ama kopmuyor; seçilen kutu beyaza dönerek öne çıkıyor. En sakin ayrım.",
    cerceve: "ac--krem",
    isima: false,
  },
  {
    ad: "B — Panelsiz",
    aciklama:
      "Hiç panel yok. İki seçenek doğrudan beyaz sayfanın üstünde duruyor, sayfanın geri kalanıyla aynı dilde. Renk sadece kuponda. En bütünleşik hâli.",
    cerceve: "ac--panelsiz",
    isima: false,
  },
  {
    ad: "C — Koyu, yukarı doğru eriyen",
    aciklama:
      "Koyu zemin duruyor ama sert bir dikdörtgen olarak başlamıyor: üst kenarı beyazdan kreme, oradan koyuya eriyor. Alttan kırmızı ışıma geliyor. Koyunun gücü var, kopukluğu yok.",
    cerceve: "ac--erisen",
    isima: true,
  },
  {
    ad: "D — Kırmızı panel",
    aciklama:
      "Zemin doğrudan marka kırmızısı, yazılar beyaz, kupon koyu. En yüksek sesli seçenek. Sayfada başka kırmızı zemin olmadığı için dikkat tamamen buraya geliyor.",
    cerceve: "ac--kirmizi",
    isima: false,
  },
  {
    ad: "E — Beyaz kart + kırmızı üst şerit",
    aciklama:
      "Beyaz kart, üstünde ince kırmızı şerit ve yumuşak gölge. Sayfadan kopmadan yükseliyor. Kırmızı şerit bloğu işaretliyor, zemini ele geçirmiyor.",
    cerceve: "ac--kart",
    isima: false,
  },
];

export default function AbonelikCerceveDenemeleri() {
  return (
    <main style={{ background: "#fff", minHeight: "100vh", padding: "clamp(28px,5vw,64px) 0 120px" }}>
      <div className="mx-auto w-full max-w-[680px] px-5">
        <p className="lx-eyebrow mb-3">Deneme</p>
        <h1
          className="uppercase"
          style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.03, color: "var(--lx-ink)" }}
        >
          Abonelik bloğu · çerçeve
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.65)" }}>
          Bilet tasarımı ve kademeli fiyat aynı. Değişen tek şey bloğun beyaz ürün
          sayfasına nasıl oturduğu. Hepsi çalışıyor — tıkla, sıklığı değiştir.
          Beğendiğinin harfini söyle.
        </p>

        {DENEMELER.map(({ ad, aciklama, cerceve, isima }) => (
          <section key={ad} className="mt-14 border-t pt-10" style={{ borderColor: "rgba(20,17,15,0.12)" }}>
            <h2
              className="uppercase"
              style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "20px", color: "var(--lx-ink)" }}
            >
              {ad}
            </h2>
            <p className="mb-8 mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(20,17,15,0.6)" }}>
              {aciklama}
            </p>
            <AbonelikBlok
              cerceve={cerceve}
              isima={isima}
              fiyat={FIYAT}
              paraBirimi={PARA}
              planlar={PLANLAR}
              kademeler={KADEMELER}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
