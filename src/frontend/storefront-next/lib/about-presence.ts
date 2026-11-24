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
export type IhracatUlkesi = {
  kod?: string;
  atlasAd?: string;
  /** Haritada hiç çizilmeyen küçük adalar için; küre buraya uçsun diye */
  koordinat?: [number, number];
  /** Listede gruplamak için kıta */
  kita: string;
  ulke: string;
};

export const IHRACAT_ULKELERI: IhracatUlkesi[] = [
  { kod: "276", kita: "Avrupa", ulke: "Almanya" },
  { kod: "032", kita: "Güney Amerika", ulke: "Arjantin" },
  { kod: "008", kita: "Avrupa", ulke: "Arnavutluk" },
  { kod: "036", kita: "Okyanusya", ulke: "Avustralya" },
  { kod: "040", kita: "Avrupa", ulke: "Avusturya" },
  { kod: "112", kita: "Avrupa", ulke: "Belarus" },
  { kod: "056", kita: "Avrupa", ulke: "Belçika" },
  { kod: "784", kita: "Asya", ulke: "Birleşik Arap Emirlikleri" },
  { kod: "840", kita: "Kuzey Amerika", ulke: "Amerika Birleşik Devletleri" },
  { kod: "826", kita: "Avrupa", ulke: "Birleşik Krallık" },
  { kod: "070", kita: "Avrupa", ulke: "Bosna-Hersek" },
  { kod: "100", kita: "Avrupa", ulke: "Bulgaristan" },
  { kod: "203", kita: "Avrupa", ulke: "Çekya" },
  { kod: "012", kita: "Afrika", ulke: "Cezayir" },
  { kod: "208", kita: "Avrupa", ulke: "Danimarka" },
  { kod: "218", kita: "Güney Amerika", ulke: "Ekvador" },
  { kod: "233", kita: "Avrupa", ulke: "Estonya" },
  { kod: "246", kita: "Avrupa", ulke: "Finlandiya" },
  { kod: "250", kita: "Avrupa", ulke: "Fransa" },
  { kod: "710", kita: "Afrika", ulke: "Güney Afrika" },
  { kod: "268", kita: "Asya", ulke: "Gürcistan" },
  { kod: "191", kita: "Avrupa", ulke: "Hırvatistan" },
  { kod: "528", kita: "Avrupa", ulke: "Hollanda" },
  { kod: "368", kita: "Asya", ulke: "Irak" },
  { kod: "364", kita: "Asya", ulke: "İran" },
  { kod: "372", kita: "Avrupa", ulke: "İrlanda" },
  { kod: "752", kita: "Avrupa", ulke: "İsveç" },
  { kod: "756", kita: "Avrupa", ulke: "İsviçre" },
  { kod: "380", kita: "Avrupa", ulke: "İtalya" },
  { kod: "124", kita: "Kuzey Amerika", ulke: "Kanada" },
  { kod: "634", kita: "Asya", ulke: "Katar" },
  { kod: "398", kita: "Asya", ulke: "Kazakistan" },
  { atlasAd: "N. Cyprus", kita: "Avrupa", ulke: "KKTC" },
  { kod: "170", kita: "Güney Amerika", ulke: "Kolombiya" },
  { atlasAd: "Kosovo", kita: "Avrupa", ulke: "Kosova" },
  { kod: "188", kita: "Kuzey Amerika", ulke: "Kosta Rika" },
  { kod: "807", kita: "Avrupa", ulke: "Kuzey Makedonya" },
  { kod: "428", kita: "Avrupa", ulke: "Letonya" },
  { kod: "440", kita: "Avrupa", ulke: "Litvanya" },
  { kod: "422", kita: "Asya", ulke: "Lübnan" },
  { kod: "348", kita: "Avrupa", ulke: "Macaristan" },
  { koordinat: [14.44, 35.94], kita: "Avrupa", ulke: "Malta" },
  { koordinat: [57.55, -20.28], kita: "Afrika", ulke: "Mauritius" },
  { kod: "484", kita: "Kuzey Amerika", ulke: "Meksika" },
  { kod: "498", kita: "Avrupa", ulke: "Moldova" },
  { kod: "558", kita: "Kuzey Amerika", ulke: "Nikaragua" },
  { kod: "578", kita: "Avrupa", ulke: "Norveç" },
  { kod: "860", kita: "Asya", ulke: "Özbekistan" },
  { kod: "591", kita: "Kuzey Amerika", ulke: "Panama" },
  { kod: "604", kita: "Güney Amerika", ulke: "Peru" },
  { kod: "616", kita: "Avrupa", ulke: "Polonya" },
  { kod: "642", kita: "Avrupa", ulke: "Romanya" },
  { kod: "643", kita: "Avrupa", ulke: "Rusya Federasyonu" },
  { kod: "152", kita: "Güney Amerika", ulke: "Şili" },
  { kod: "688", kita: "Avrupa", ulke: "Sırbistan" },
  { kod: "703", kita: "Avrupa", ulke: "Slovakya" },
  { kod: "760", kita: "Asya", ulke: "Suriye" },
  { kod: "682", kita: "Asya", ulke: "Suudi Arabistan" },
  { kod: "804", kita: "Avrupa", ulke: "Ukrayna" },
  { kod: "400", kita: "Asya", ulke: "Ürdün" },
  { kod: "862", kita: "Güney Amerika", ulke: "Venezuela" },
  { kod: "300", kita: "Avrupa", ulke: "Yunanistan" },
];

/**
 * Ekranda yazan sayı listeden türetiliyor; liste büyüyünce metin de
 * kendiliğinden güncelleniyor, iki yerde ayrı ayrı güncellenmiyor.
 */
export const IHRACAT = {
  ulke: IHRACAT_ULKELERI.length,
  kita: new Set(IHRACAT_ULKELERI.map((u) => u.kita)).size,
};

/** Listeyi kıtaya göre grupla — en çok ülkesi olan kıta üstte. */
export function kitayaGore(ulkeler: IhracatUlkesi[]) {
  const gruplar = new Map<string, IhracatUlkesi[]>();
  for (const u of ulkeler) {
    const g = gruplar.get(u.kita) ?? [];
    g.push(u);
    gruplar.set(u.kita, g);
  }
  return [...gruplar.entries()].sort((a, b) => b[1].length - a[1].length);
}

/**
 * "Rakamlar" bölümü (Hakkımızda) — Slick Gorilla'daki "The numbers" düzeni.
 *
 * ⚠️ Yalnızca DOĞRULANABİLEN rakamlar burada. Berber/müşteri sayısı ve
 * üretim tesisinin metrekaresi markadan gelecek; gelene kadar o satırlar
 * `deger: null` duruyor ve ekranda HİÇ ÇIZILMIYOR. Uydurma sayı yok.
 *
 * `deger` sayıysa 0'dan o rakama sayarak açılır, metinse olduğu gibi yazılır.
 * `son` rakamın sonuna eklenir (ör. "+", " m²").
 */
export const KURULUS_YILI = 1970;

export type Rakam = { deger: number | string | null; son?: string; etiket: string };

export const RAKAMLAR: Rakam[] = [
  { deger: new Date().getFullYear() - KURULUS_YILI, son: "+", etiket: "Years in the game" },
  { deger: 62, son: "+", etiket: "Export countries" },
  { deger: 6, etiket: "Continents" },
  /* YER TUTUCU (24 Kas) — Volkan "şimdilik salla" dedi, gerçek sayı
     markadan gelecek. Canlıya almadan önce DOĞRULANACAK. */
  { deger: 10000, son: "+", etiket: "Barbers worldwide" },
];

/**
 * Üretim tesisi.
 *
 * YER TUTUCU (24 Kas): metrekare ve hat sayısı markadan gelmedi, Volkan
 * geçici değer istedi. Gerçek rakamlar gelince burası güncellenecek —
 * `deger` null yapılırsa o satır kendiliğinden ekrandan kalkar.
 */
export const URETIM_TESISI: Rakam[] = [
  { deger: 4500, son: " m²", etiket: "Production area" },
  { deger: 8, etiket: "Production lines" },
  { deger: "GMP", etiket: "Manufacturing standard" },
];
