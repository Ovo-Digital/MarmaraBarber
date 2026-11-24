import type { Customer } from "@/types/customer";

/**
 * Berber programı — kademeler, etiketler ve fiyat mantığı.
 *
 * ŞOPİFY'DA NASIL YÖNETİLİYOR (özet)
 * 1. Berber başvurusu forma düşer. Onaylanınca mağaza sahibi müşteri kaydına
 *    kademe etiketini ekler: `berber-bronz` / `berber-gumus` / `berber-altin`.
 * 2. Shopify'da her kademe için BİR müşteri segmenti tanımlanır
 *    (ör. customer_tags CONTAINS 'berber-altin').
 * 3. Her kademe için bir indirim KODU oluşturulur ve o segmente kısıtlanır.
 *    Kod sızsa bile etiketi olmayan hesapta çalışmaz.
 * 4. Vitrin, giriş yapan berberin kademesini etiketten okur ve sepete o
 *    kademenin kodunu kendisi uygular. Kasada indirim gerçekten işler çünkü
 *    bu gerçek bir Shopify indirimi — ekranda sahte fiyat göstermiyoruz.
 *
 * NEDEN BÖYLE: Shopify B2B (şirket + fiyat listesi) yalnızca Plus planında.
 * Ayrı bir indirim uygulaması yazmak Partner hesabı ve sunucu ister. Bu yol
 * standart Shopify planında, uygulama yazmadan çalışıyor.
 *
 * SINIRI: kod bazlı indirim sepetin tamamına ya da seçilen koleksiyona
 * yüzde olarak iner; ürün ürün farklı toptan fiyat vermek istenirse
 * Shopify B2B'ye (Plus) ya da indirim uygulamasına geçmek gerekir.
 */

export type KademeKodu = "bronz" | "gumus" | "altin";

export type Kademe = {
  kod: KademeKodu;
  /** Shopify müşteri etiketi — çeviri taramasına girmesin diye uzun ad */
  musteriEtiketi: string;
  ad: string;
  /** Shopify'da bu kademe için oluşturulan indirim kodu */
  indirimKodu: string;
  /** Vitrinde gösterilen oran — Shopify'daki kodla AYNI olmalı */
  indirim: number;
  /** Bu kademeye geçmek için gereken toplam alışveriş (sipariş geçmişinden) */
  esik: number;
  ozet: string;
  avantajlar: string[];
};

/**
 * ⚠️ İNDİRİM ORANLARI VE EŞİKLER YER TUTUCU.
 * Marka kendi oranlarını verince burası ve Shopify'daki indirim kodları
 * BİRLİKTE güncellenmeli; ikisi ayrışırsa ekranda yazan oranla kasada inen
 * oran farklı olur. Eşikler sipariş geçmişinden hesaplanıyor (lib/berber-puan).
 */
export const KADEMELER: Kademe[] = [
  {
    kod: "bronz",
    musteriEtiketi: "berber-bronz",
    ad: "Bronze",
    indirimKodu: "BERBER-BRONZ",
    indirim: 10,
    esik: 0,
    ozet: "Start here. Professional pricing from your first order.",
    avantajlar: [
      "Professional pricing on the full range",
      "Fast, reliable restocking",
      "A direct contact for stock questions",
    ],
  },
  {
    kod: "gumus",
    musteriEtiketi: "berber-gumus",
    ad: "Silver",
    indirimKodu: "BERBER-GUMUS",
    indirim: 15,
    esik: 25000,
    ozet: "For shops ordering regularly.",
    avantajlar: [
      "Better pricing on the full range",
      "Priority on new releases",
      "Display and shelf support",
      "Product training for your staff",
    ],
  },
  {
    kod: "altin",
    musteriEtiketi: "berber-altin",
    ad: "Gold",
    indirimKodu: "BERBER-ALTIN",
    indirim: 20,
    esik: 75000,
    ozet: "Best terms, for the shops we work closest with.",
    avantajlar: [
      "Best pricing available",
      "Priority on new releases",
      "Custom branded display",
      "Featured on the store locator",
      "Support on launches, events and education",
    ],
  },
];

/** Başvurusu onaylanmış ama kademesi girilmemiş hesaplar için taban kademe */
export const TABAN_KADEME = KADEMELER[0];

const etiketler = new Map(KADEMELER.map((k) => [k.musteriEtiketi, k]));

/** Müşterinin etiketlerinden kademesini bulur; berber değilse null. */
export function kademeBul(musteri: Pick<Customer, "tags"> | null | undefined): Kademe | null {
  const t = musteri?.tags;
  if (!t?.length) return null;
  /* Birden fazla kademe etiketi varsa EN YÜKSEĞİ geçerli: panelde eski etiket
     silinmeden yenisi eklenirse müşteri aşağı düşmesin. */
  let bulunan: Kademe | null = null;
  for (const ham of t) {
    const k = etiketler.get(ham.trim().toLowerCase());
    if (k && (!bulunan || k.indirim > bulunan.indirim)) bulunan = k;
  }
  return bulunan;
}

export function berberMi(musteri: Pick<Customer, "tags"> | null | undefined): boolean {
  return kademeBul(musteri) !== null;
}

/** Perakende fiyattan kademe fiyatını hesaplar (yalnızca gösterim için). */
export function kademeFiyati(fiyat: number, kademe: Kademe | null): number {
  if (!kademe) return fiyat;
  return fiyat * (1 - kademe.indirim / 100);
}

/** Bir sonraki kademe ve ona kalan tutar — panelde ilerleme çubuğu için. */
export function sonrakiKademe(kademe: Kademe | null) {
  const sira = kademe ? KADEMELER.findIndex((k) => k.kod === kademe.kod) : -1;
  return KADEMELER[sira + 1] ?? null;
}
