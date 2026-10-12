/**
 * About sayfasındaki dünya küresinin verisi.
 *
 * Yalnızca KAMUYA AÇIK kaynaklarla doğrulanabilen noktalar burada.
 * İhracat ülkelerinin tam listesi aşağıda (markadan gelen dosya).
 * PAZARLAR ise rolü doğrulanabilen pazarlar: listede ayrıca gösteriliyor
 * ve kürede daha belirgin boyanıyor.
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

/**
 * Son 4 yılda ihracat yapılan ülkeler.
 *
 * Kaynak: markadan gelen "son 4 yıl ihracat yapılan ülkeler güncel.xlsx"
 * (2026-10-12). Liste uydurulmadı; satırlar dosyadaki sırayla alındı.
 *
 * `kod`: ISO 3166-1 sayısal kod — haritadaki ülkeyi bununla buluyoruz.
 * `atlasAd`: haritada sayısal kodu olmayan birkaç yer için ad eşlemesi
 *   (Kosova ve KKTC ayrı poligon olarak var ama kodsuz).
 * İkisi de yoksa ülke listede ve sayıda var ama haritada boyanmıyor:
 *   Malta ve Mauritius bu çözünürlükteki haritada hiç çizilmiyor.
 */
export type IhracatUlkesi = { kod?: string; atlasAd?: string; ulke: string };

export const IHRACAT_ULKELERI: IhracatUlkesi[] = [
  { kod: "276", ulke: "Almanya" },
  { kod: "032", ulke: "Arjantin" },
  { kod: "008", ulke: "Arnavutluk" },
  { kod: "036", ulke: "Avustralya" },
  { kod: "040", ulke: "Avusturya" },
  { kod: "112", ulke: "Belarus" },
  { kod: "056", ulke: "Belçika" },
  { kod: "784", ulke: "Birleşik Arap Emirlikleri" },
  { kod: "840", ulke: "Amerika Birleşik Devletleri" },
  { kod: "826", ulke: "Birleşik Krallık" },
  { kod: "070", ulke: "Bosna-Hersek" },
  { kod: "100", ulke: "Bulgaristan" },
  { kod: "203", ulke: "Çekya" },
  { kod: "012", ulke: "Cezayir" },
  { kod: "208", ulke: "Danimarka" },
  { kod: "218", ulke: "Ekvador" },
  { kod: "233", ulke: "Estonya" },
  { kod: "246", ulke: "Finlandiya" },
  { kod: "250", ulke: "Fransa" },
  { kod: "710", ulke: "Güney Afrika" },
  { kod: "268", ulke: "Gürcistan" },
  { kod: "191", ulke: "Hırvatistan" },
  { kod: "528", ulke: "Hollanda" },
  { kod: "368", ulke: "Irak" },
  { kod: "364", ulke: "İran" },
  { kod: "372", ulke: "İrlanda" },
  { kod: "752", ulke: "İsveç" },
  { kod: "756", ulke: "İsviçre" },
  { kod: "380", ulke: "İtalya" },
  { kod: "124", ulke: "Kanada" },
  { kod: "634", ulke: "Katar" },
  { kod: "398", ulke: "Kazakistan" },
  { atlasAd: "N. Cyprus", ulke: "KKTC" },
  { kod: "170", ulke: "Kolombiya" },
  { atlasAd: "Kosovo", ulke: "Kosova" },
  { kod: "188", ulke: "Kosta Rika" },
  { kod: "807", ulke: "Kuzey Makedonya" },
  { kod: "428", ulke: "Letonya" },
  { kod: "440", ulke: "Litvanya" },
  { kod: "422", ulke: "Lübnan" },
  { kod: "348", ulke: "Macaristan" },
  { ulke: "Malta" },
  { ulke: "Mauritius" },
  { kod: "484", ulke: "Meksika" },
  { kod: "498", ulke: "Moldova" },
  { kod: "558", ulke: "Nikaragua" },
  { kod: "578", ulke: "Norveç" },
  { kod: "860", ulke: "Özbekistan" },
  { kod: "591", ulke: "Panama" },
  { kod: "604", ulke: "Peru" },
  { kod: "616", ulke: "Polonya" },
  { kod: "642", ulke: "Romanya" },
  { kod: "643", ulke: "Rusya Federasyonu" },
  { kod: "152", ulke: "Şili" },
  { kod: "688", ulke: "Sırbistan" },
  { kod: "703", ulke: "Slovakya" },
  { kod: "760", ulke: "Suriye" },
  { kod: "682", ulke: "Suudi Arabistan" },
  { kod: "804", ulke: "Ukrayna" },
  { kod: "400", ulke: "Ürdün" },
  { kod: "862", ulke: "Venezuela" },
  { kod: "300", ulke: "Yunanistan" },
];

/**
 * Ekranda yazan sayı listeden türetiliyor; liste büyüyünce metin de
 * kendiliğinden güncelleniyor, iki yerde ayrı ayrı güncellenmiyor.
 */
export const IHRACAT = { ulke: IHRACAT_ULKELERI.length, kita: 6 };
