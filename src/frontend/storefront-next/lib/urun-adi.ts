/**
 * Ürün adını ikiye ayırır: öne çıkan ad + kalan tanım.
 *
 *   "Hangover Edp Erkek Parfüm 100 ML"  →  ad: "Hangover"   detay: "Edp Erkek Parfüm 100 ML"
 *   "No.1 EDC Kolonya Cam Şişe 250 ML"  →  ad: "No.1"       detay: "EDC Kolonya Cam Şişe 250 ML"
 *   "Space Wax 100 ML"                  →  ad: "Space Wax"  detay: "100 ML"
 *   "Bej Önlük"                         →  ad: "Bej Önlük"  detay: ""
 *
 * Nasıl: baştan başlanır, ilk "tanımlayıcı" kelimede durulur. Tanımlayıcı
 * kelime üç şeyden biridir: ürün tipinin kelimeleri (Shopify'dan gelir),
 * hacim/ağırlık (100 ML, 50 gr), ya da TANIM_KELIMELERI listesi.
 *
 * Marka adı baştaysa atılır: "Marmara Barber Kolonya No 5" ürününde öne
 * çıkan ad marka değil, "Kolonya No 5" olmalı.
 *
 * Hiçbir şey kalmazsa ad = başlığın hacimden önceki kısmı; o da yoksa
 * başlığın tamamı. Yani her durumda ekranda bir ad vardır, metin uydurulmaz
 * ve hiçbir kelime kaybolmaz — kalan kısım `detay` olarak gösterilir.
 */

/** Ürün adının parçası sayılmayan, tanım bildiren kelimeler. */
const TANIM_KELIMELERI = [
  "edp", "edc", "edt", "eau", "de", "parfum", "parfüm",
  "erkek", "kadın", "kadin", "men", "women",
  "cam", "şişe", "sise", "pet", "pompalı", "pompali",
  "sprey", "spray", "bottle", "glass",
];

/** "100 ML", "50 gr", "1 LT" — sayı ve birim ayrı kelime de olabiliyor */
const BIRIM = /^(ml|cl|lt|l|g|gr|kg|oz|cc)\.?$/i;
const SAYI = /^\d+([.,]\d+)?$/;
/** "2x150 ML" gibi çoklu paketler */
const COKLU = /^\d+\s*[x×]\s*\d+([.,]\d+)?$/i;
const HACIM_BITISIK = /^\d+([.,]\d+)?\s*(ml|cl|lt|l|g|gr|kg|oz|cc)\.?$/i;

function sadelestir(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[.,]/g, "")
    .replace(/[çğıöşü]/g, (h) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[h] ?? h);
}

export function urunAdiParcala(
  baslik: string,
  urunTipi?: string | null,
  markaAdi?: string,
): { ad: string; detay: string } {
  const kelimeler = baslik.trim().split(/\s+/).filter(Boolean);
  if (kelimeler.length === 0) return { ad: baslik, detay: "" };

  const tipKelimeleri = new Set((urunTipi ?? "").split(/[\s>]+/).map(sadelestir).filter(Boolean));
  const markaKelimeleri = (markaAdi ?? "").split(/\s+/).map(sadelestir).filter(Boolean);
  const tanim = new Set(TANIM_KELIMELERI.map(sadelestir));

  // 1) Baştaki marka adını at
  let bas = 0;
  while (bas < kelimeler.length && markaKelimeleri.includes(sadelestir(kelimeler[bas]))) bas++;
  if (bas === kelimeler.length) bas = 0; // başlık sadece markaysa geri al

  // 2) Hacmi bul: "100 ML" ya da "100ML"
  let hacimBas = kelimeler.length;
  for (let i = bas; i < kelimeler.length; i++) {
    const k = kelimeler[i];
    if (HACIM_BITISIK.test(k) || ((SAYI.test(k) || COKLU.test(k)) && i + 1 < kelimeler.length && BIRIM.test(kelimeler[i + 1]))) {
      hacimBas = i;
      break;
    }
  }

  // Hacim yoksa bölme. "Siyah Boyun Bandı" gibi adlarda ürün tipi kelimeleri
  // adın kendisidir; soyunca "Siyah Boyun" / "Bandı" gibi saçma bir ayrım çıkıyor.
  if (hacimBas === kelimeler.length) {
    return { ad: kelimeler.slice(bas).join(" "), detay: "" };
  }

  // 3) Hacimden önceki kısmın SONUNDAN tanım kelimelerini soy
  let son = hacimBas;
  const tanimlayiciMi = (k: string) => {
    const s = sadelestir(k);
    return tipKelimeleri.has(s) || tanim.has(s);
  };
  while (son > bas + 1 && tanimlayiciMi(kelimeler[son - 1])) son--;

  const ad = kelimeler.slice(bas, son).join(" ");
  const detay = kelimeler.slice(son).join(" ");
  return ad ? { ad, detay } : { ad: baslik, detay: "" };
}
