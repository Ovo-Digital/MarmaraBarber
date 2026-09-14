/**
 * About sayfasındaki dünya küresinin verisi.
 *
 * Yalnızca KAMUYA AÇIK kaynaklarla doğrulanabilen noktalar burada.
 * Marka "54 ülkeye ihracat" diyor ama ülke listesi hiçbir yerde
 * yayınlanmamış; listeyi uydurmak yerine bu dosya markadan gelecek listeyle
 * genişletilecek. Yeni ülke eklemek için PAZARLAR'a satır eklemek yeterli.
 *
 * `kod`: ISO 3166-1 sayısal ülke kodu (world-atlas bu kodu kullanıyor).
 * `koordinat`: [boylam, enlem].
 *
 * Kaynaklar (2026-09-14):
 *  - Merkez ve üretim adresleri: lib/legal-content.ts (COMPANY)
 *  - Avustralya resmi distribütörü: marmarabarber.com.au
 *  - İngiltere stokçu: solosalonsupplies.co.uk
 *  - ABD stokçular: saloncentric.com, vipbarbersupply.com, buybarber.com
 */

export type Merkez = {
  id: string;
  sehir: string;
  /** Arayüzde t() ile çevrilir */
  rol: string;
  koordinat: [number, number];
};

export type Pazar = {
  kod: string;
  /** Arayüzde t() ile çevrilir */
  ulke: string;
  not: string;
  koordinat: [number, number];
};

export const MERKEZLER: Merkez[] = [
  { id: "hq", sehir: "Istanbul", rol: "Head office", koordinat: [29.13, 41.1] },
  { id: "uretim", sehir: "Düzce", rol: "Production", koordinat: [31.16, 40.84] },
];

export const PAZARLAR: Pazar[] = [
  { kod: "792", ulke: "Türkiye", not: "Home market", koordinat: [35, 39] },
  { kod: "840", ulke: "United States", not: "Barber supply stockists", koordinat: [-98, 39] },
  { kod: "826", ulke: "United Kingdom", not: "Salon & barber stockists", koordinat: [-2, 54] },
  { kod: "036", ulke: "Australia", not: "Official distributor", koordinat: [134, -25] },
];

/** Markanın kendi açıkladığı toplam (legal-content'teki "Who we are" metni) */
export const IHRACAT = { ulke: 54, kita: 6 };
