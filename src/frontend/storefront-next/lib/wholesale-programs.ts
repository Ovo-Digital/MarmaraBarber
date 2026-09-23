/**
 * Toptan satış programları (/wholesale).
 *
 * ⚠️ İÇERİK YER TUTUCU. Kademeler, avantaj listeleri ve koşullar marka
 * tarafından verilecek. Buradaki metinler sitede zaten kullanılan, doğrulanmış
 * ifadelerden derlendi; minimum sipariş tutarı, iskonto oranı, vade gibi
 * RAKAMLAR BİLEREK BOŞ bırakıldı — uydurulmadı.
 *
 * `kosul` alanı boş bırakılırsa kartta koşul satırı hiç görünmez.
 *
 * `gorsel` boş bırakılırsa kartın görsel alanında tasarlanmış bir boşluk
 * (dev kademe numarası + kırmızı ışıma) çıkar. Marka fotoğrafı geldiğinde
 * dosyayı public/media/ altına koyup yolunu yazmak yeterli:
 *     gorsel: "/media/wholesale-barbershop.jpg"
 *
 * Metinler İngilizce anahtar; ekranda t() ile çevriliyor (lib/i18n/es.ts).
 */

export type Program = {
  id: string;
  /** Kartta sağ üstte küçük etiket (ör. "Most popular") — boşsa görünmez */
  rozet?: string;
  baslik: string;
  ozet: string;
  avantajlar: string[];
  /** Ör. "Minimum first order applies" — rakam markadan gelecek */
  kosul?: string;
  /** Boşsa tasarlanmış boşluk gösterilir */
  gorsel?: string;
};

export const PROGRAMLAR: Program[] = [
  {
    id: "barbershop",
    rozet: "Most popular",
    baslik: "Barbershops & salons",
    ozet: "Stock the range behind your own chair.",
    avantajlar: [
      "Professional pricing on the full range",
      "Fast, reliable restocking",
      "Priority on new releases",
      "A direct contact for stock questions",
    ],
    kosul: "Business details required with your application",
    gorsel: "/media/learn-the-craft.jpg",
  },
  {
    id: "retail",
    baslik: "Retailers & stockists",
    ozet: "Put Marmara Barber on your shelf.",
    avantajlar: [
      "Professional pricing on the full range",
      "Display and shelf support",
      "Product training for your staff",
      "Marketing assets for your channels",
    ],
    kosul: "Minimum first order applies",
  },
  {
    id: "distribution",
    baslik: "Distribution",
    ozet: "Represent the brand across a market.",
    avantajlar: [
      "Best available pricing",
      "Territory discussed case by case",
      "Own production, GMP standards, consistent supply",
      "Support on launches, events and education",
    ],
    kosul: "Business plan and market details required",
  },
  {
    id: "education",
    baslik: "Academies & schools",
    ozet: "Train on the products students will use at work.",
    avantajlar: [
      "Professional pricing for institutions",
      "Product training and technique support",
      "Materials for demos and shows",
      "Student and graduate offers",
    ],
    kosul: "Institution details required with your application",
  },
];
