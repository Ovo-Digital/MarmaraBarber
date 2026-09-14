import type { Customer } from "@/types/customer";

/**
 * Toptan ortak (wholesale partner) ayarları.
 *
 * NASIL ÇALIŞIYOR
 * 1. Başvuru formu Shopify'a mesaj olarak düşer (/api/apply).
 * 2. Mağaza sahibi başvuruyu onaylarsa Shopify panelinde o kişinin müşteri
 *    kaydına ORTAK_ETIKETI etiketini ekler (müşteri yoksa oluşturup davet eder).
 * 3. Kişi /wholesale sayfasında giriş yapınca etiketi görülür ve ortak paneli
 *    açılır. Etiketi olmayan hesap "henüz ortak değil" mesajı görür.
 *
 * Etiket, başvuru formunun gönderdiği etiketten (`wholesale`) BİLEREK farklı:
 * aynı olsaydı başvuran herkes kendini onaylamış olurdu.
 *
 * Başka mağazaya devredilirken .env'de NEXT_PUBLIC_WHOLESALE_TAG ile değişir.
 *
 * NOT: Bu etiket şimdilik yalnızca arayüzde kapı görevi görüyor. Toptan
 * fiyatlar Shopify'da (B2B katalog veya indirim kuralı) tanımlanmadıkça
 * ortak da perakende fiyatını görür.
 */
export const ORTAK_ETIKETI = (process.env.NEXT_PUBLIC_WHOLESALE_TAG || "wholesale-partner").trim().toLowerCase();

export function toptanOrtagiMi(musteri: Pick<Customer, "tags"> | null | undefined): boolean {
  return Boolean(musteri?.tags?.some((t) => t.trim().toLowerCase() === ORTAK_ETIKETI));
}

/**
 * Sayfadaki avantajlar. Metinler İngilizce anahtar; ekranda çevriliyor.
 * Buradakiler sitede zaten yer alan, markanın kendi ifadeleri. Marka
 * programın ayrıntılarını (indirim oranı, minimum sipariş, vade vb.) verince
 * bu listeye eklenmeli — rakam uydurulmadı.
 */
export const ORTAK_AVANTAJLARI: { baslik: string; metin: string }[] = [
  { baslik: "Trade pricing", metin: "Professional pricing on the full range, set for your account." },
  { baslik: "Priority on new releases", metin: "Partners hear about new drops and limited runs first." },
  { baslik: "A direct contact", metin: "One person to talk to for stock, display and campaign questions." },
  { baslik: "Full range", metin: "Cologne, styling, skin and beard care, accessories — one supplier." },
  { baslik: "Own production", metin: "Manufactured in our own facilities to GMP standards." },
  { baslik: "Since 1970", metin: "A barber brand with its own production, exporting to 54 countries." },
];
