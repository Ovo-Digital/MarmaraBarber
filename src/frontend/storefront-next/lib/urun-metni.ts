/**
 * Ürün açıklamasından bölüm ayıklama.
 *
 * Shopify açıklamaları tek bir uzun metin: "ÖZELLİKLER … NASIL KULLANILIR …
 * KOKU HİKAYESİ …" gibi büyük harfli başlıklarla bölünmüş. Burada o
 * başlıklardan biri bulunuyor ve BİR SONRAKİ büyük harfli başlığa kadar olan
 * kısım alınıyor.
 *
 * Basit bir "başlıktan sonra 200 karakter al" yaklaşımı denendi; cümlenin
 * ortasından kesiyor ve bir sonraki bölümü de içine alıyordu.
 */

/** İki veya daha fazla büyük harfli kelimeden oluşan bölüm başlığı */
const BASLIK = /(?:^|\s)((?:[A-Z\u00C7\u011E\u0130\u00D6\u015E\u00DC]{2,}[ ]){1,4}[A-Z\u00C7\u011E\u0130\u00D6\u015E\u00DC]{2,})(?=[:\s])/g;

function bolumler(metin: string): { baslik: string; govde: string }[] {
  const bulunan: { ad: string; bas: number; son: number }[] = [];
  for (const m of metin.matchAll(BASLIK)) {
    if (m.index === undefined) continue;
    const ad = m[1].trim();
    const bas = m.index + m[0].indexOf(ad);
    bulunan.push({ ad, bas, son: bas + ad.length });
  }
  return bulunan.map((b, i) => ({
    baslik: b.ad,
    govde: metin.slice(b.son, bulunan[i + 1]?.bas ?? metin.length).replace(/^[:\s]+/, "").trim(),
  }));
}

function bolumBul(metin: string, anahtarlar: RegExp): string {
  const temiz = metin.normalize("NFC").replace(/\s+/g, " ").trim();
  const parca = bolumler(temiz).find((b) => anahtarlar.test(b.baslik));
  if (!parca) return "";
  // Çok uzun bölümler sayfayı boğuyor; ilk cümlelerle yetin
  return parca.govde.length > 420 ? `${parca.govde.slice(0, 400).trim()}…` : parca.govde;
}

/** "NASIL KULLANILIR" bölümü — yoksa boş döner, metin UYDURULMAZ */
export function kullanimMetni(aciklama: string): string {
  return bolumBul(aciklama, /NASIL KULLANILIR|KULLANIM|HOW TO USE|DIRECTIONS/i);
}

/** "İÇİNDEKİLER" bölümü — yoksa boş döner */
export function icindekilerMetni(aciklama: string): string {
  return bolumBul(aciklama, /\u0130\u00C7\u0130NDEK\u0130LER|ICINDEKILER|INGREDIENTS|INCI/i);
}

/* ────────────────────────────────────────────────────────────────────
   Ürün sayfasının Slick Gorilla düzenindeki bölümleri için ayıklayıcılar.
   Hepsi açıklamadan okuyor; bölüm yoksa BOŞ DİZİ dönüyor ve o bölüm
   ekranda hiç çizilmiyor. Metin uydurulmuyor.
   ──────────────────────────────────────────────────────────────────── */

/**
 * Bölüm başlığı tanıyıcı — yukarıdaki `BASLIK`tan daha geniş.
 *
 * `BASLIK` en az iki büyük harfli kelime arıyor ve başlıktan sonra `:` ya da
 * boşluk bekliyor. Marmara açıklamalarında "ÖZELLİKLER" tek kelime,
 * "NE İŞE YARAR?" ise soru işaretiyle bitiyor; ikisi de yakalanmıyordu ve
 * ürün sayfasındaki bölümler boş kalıyordu. Burada 1-5 büyük harfli kelime
 * ve sonunda isteğe bağlı `?` / `:` kabul ediliyor.
 */
/* Her çağrıda yeni nesne: /g'li bir düzenli ifadeyi paylaşmak lastIndex
   taşıması riski taşıyor. */
const baslikDesenI = () => /(?:^|\s)((?:[A-Z\u00C7\u011E\u0130\u00D6\u015E\u00DC0-9.]{2,}[ ]){0,4}[A-Z\u00C7\u011E\u0130\u00D6\u015E\u00DC]{3,})\s*[?:]?(?=\s|$)/g;

/** Bir bölümün tam gövdesi — `bolumBul`un aksine kırpma yok. */
function bolumTamGovde(metin: string, anahtarlar: RegExp): string {
  /* Shopify açıklamaları NFD (ayrışık) gelebiliyor: "İ" harfi I + birleşen
     nokta olarak iki karakter oluyor ve düzenli ifadedeki tek karakterlik
     İ ile eşleşmiyordu — bölümler bu yüzden bulunamıyordu. NFC'ye çeviriyoruz. */
  const temiz = metin.normalize("NFC").replace(/\s+/g, " ").trim();
  const bulunan: { ad: string; bas: number; son: number }[] = [];
  for (const m of temiz.matchAll(baslikDesenI())) {
    if (m.index === undefined) continue;
    const ad = m[1].trim();
    const bas = m.index + m[0].indexOf(ad);
    bulunan.push({ ad, bas, son: bas + m[0].length - m[0].indexOf(ad) });
  }
  if (typeof window === "undefined") console.log("[AY4]", JSON.stringify(bulunan.map((b) => b.ad)), String(anahtarlar));
  const i = bulunan.findIndex((b) => anahtarlar.test(b.ad));
  if (i === -1) return "";
  return temiz.slice(bulunan[i].son, bulunan[i + 1]?.bas ?? temiz.length).replace(/^[:?\s]+/, "").trim();
}

/**
 * Metni cümlelere böler.
 *
 * Marmara açıklamalarında cümleler çoğu zaman noktadan sonra boşluksuz
 * yazılmış ("Nemlendirir.Saç tellerini güçlendirir."), bu yüzden ayırıcı
 * hem ". " hem de ".<büyük harf> kabul ediyor. 3 harften kısa parçalar
 * ölçü/kısaltma artığı sayılıp atılıyor.
 */
function cumleler(govde: string): string[] {
  return govde
    .split(/(?<=[.!?])\s*(?=[A-Z\u00C7\u011E\u0130\u00D6\u015E\u00DC])|(?<=[.!?])\s+/)
    .map((c) => c.trim().replace(/^[-–•*\s]+/, ""))
    .filter((c) => c.length > 12);
}

/** "NASIL KULLANILIR" bölümü adım adım — yoksa boş dizi */
export function kullanimAdimlari(aciklama: string, enFazla = 4): string[] {
  const govde = bolumTamGovde(aciklama, /NASIL KULLANILIR|KULLANIM|HOW TO USE|DIRECTIONS/i);
  if (!govde) return [];
  const adimlar = cumleler(govde);
  return adimlar.length >= 2 ? adimlar.slice(0, enFazla) : [];
}

/**
 * "NE İŞE YARAR" / "ÖZELLİKLER" bölümü maddelere ayrılmış.
 *
 * Slick'teki "WHAT'S ACTUALLY IN IT" kartlarının karşılığı. Gerçek içerik
 * listesi (INCI) Shopify'da olmadığı için ürünün ne yaptığı yazılıyor;
 * olmayan bir içerik listesi uydurulmuyor.
 */
export function ozellikMaddeleri(aciklama: string, enFazla = 3): string[] {
  const govde =
    bolumTamGovde(aciklama, /NE \u0130\u015EE YARAR|NE ISE YARAR|FAYDALARI|BENEFITS/i) ||
    bolumTamGovde(aciklama, /\u00D6ZELL\u0130KLER|OZELLIKLER|FEATURES/i);
  if (!govde) return [];
  const maddeler = cumleler(govde);
  return maddeler.length >= 2 ? maddeler.slice(0, enFazla) : [];
}

/**
 * Maddenin başlığı: ilk birkaç kelime.
 *
 * Slick'in kartlarında başlık + gövde var. Shopify'da ayrı bir başlık alanı
 * olmadığı için cümlenin kendi ilk kelimeleri başlığa çıkarılıyor —
 * METİN EKLENMİYOR, sadece bölünüyor.
 */
export function maddeBasligi(madde: string): { baslik: string; govde: string } {
  const kelimeler = madde.replace(/[.!?]+$/, "").split(/\s+/);
  if (kelimeler.length <= 5) return { baslik: madde.replace(/[.!?]+$/, ""), govde: "" };
  return { baslik: kelimeler.slice(0, 3).join(" "), govde: madde };
}
