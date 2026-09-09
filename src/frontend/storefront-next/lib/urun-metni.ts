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
const BASLIK = /(?:^|\s)((?:[A-ZÇĞİÖŞÜ]{2,}[ ]){1,4}[A-ZÇĞİÖŞÜ]{2,})(?=[:\s])/g;

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
  const temiz = metin.replace(/\s+/g, " ").trim();
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
  return bolumBul(aciklama, /İÇİNDEKİLER|ICINDEKILER|INGREDIENTS|INCI/i);
}
