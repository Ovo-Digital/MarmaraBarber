import type { CustomerOrder } from "@/types/customer";
import { KADEMELER, type Kademe, kademeBul } from "@/lib/berber";

/**
 * Berber sadakat puanı ve kademe ilerlemesi.
 *
 * NEDEN BURADA HESAPLANIYOR: Shopify'da hazır bir sadakat puanı alanı yok.
 * Puanı müşteri kaydına yazmak için ayrı bir uygulama + metafield yönetimi
 * gerekir ve iki yerde tutulan sayı kaçınılmaz olarak ayrışır. Bunun yerine
 * puanı SİPARİŞ GEÇMİŞİNDEN türetiyoruz: Shopify'da duran gerçek siparişler
 * tek doğru kaynak, puan her açılışta oradan yeniden hesaplanıyor. İade olan
 * bir sipariş geçmişten düşünce puan da kendiliğinden düşüyor.
 *
 * KADEME İLE İLİŞKİSİ: ekranda gösterilen ilerleme "hak kazandın" demektir;
 * indirimi açan şey hâlâ Shopify'daki müşteri etiketi (bkz. lib/berber.ts).
 * Eşiği geçen berberi mağaza sahibi üst kademeye taşır. Böylece hiç kimse
 * kendi kendine indirim açamıyor.
 *
 * ⚠️ PUAN KURU YER TUTUCU: şu an 1 birim harcama = 1 puan. Marka kendi kurunu
 * verince PUAN_KURU değişir.
 */

export const PUAN_KURU = 1;

/** Kademe eşikleri son kaç ayın harcamasına bakıyor */
export const DONEM_AY = 12;

const SAYILAN_DURUMLAR = new Set(["PAID", "PARTIALLY_REFUNDED", "AUTHORIZED"]);

/** Puan ve eşik yalnızca ödenmiş siparişlerden; iptal/iade sayılmaz. */
function sayilanlar(siparisler: CustomerOrder[] | undefined): CustomerOrder[] {
  if (!siparisler?.length) return [];
  return siparisler.filter((s) => SAYILAN_DURUMLAR.has((s.financialStatus ?? "").toUpperCase()));
}

export function toplamPuan(siparisler: CustomerOrder[] | undefined): number {
  const toplam = sayilanlar(siparisler).reduce((a, s) => a + s.totalPrice, 0);
  return Math.floor(toplam * PUAN_KURU);
}

/** Son DONEM_AY ayın harcaması — kademe eşiği buna bakıyor. */
export function donemHarcamasi(siparisler: CustomerOrder[] | undefined): number {
  const sinir = new Date();
  sinir.setMonth(sinir.getMonth() - DONEM_AY);
  return sayilanlar(siparisler)
    .filter((s) => new Date(s.processedAt) >= sinir)
    .reduce((a, s) => a + s.totalPrice, 0);
}

/** Harcamanın hak kazandırdığı kademe — etiketten gelen kademeden farklı olabilir. */
export function hakEdilenKademe(harcama: number): Kademe {
  let bulunan = KADEMELER[0];
  for (const k of KADEMELER) if (harcama >= k.esik) bulunan = k;
  return bulunan;
}

export type BerberDurumu = {
  /** Shopify etiketinden gelen, indirimi açan kademe */
  kademe: Kademe | null;
  /** Harcamanın hak kazandırdığı kademe */
  hakEdilen: Kademe;
  /** Etiket geride kalmış mı — panelde "yükseltiyoruz" notu için */
  yukseltmeBekliyor: boolean;
  puan: number;
  harcama: number;
  sonraki: Kademe | null;
  /** Sonraki kademeye kalan tutar */
  kalan: number;
  /** Mevcut eşikten sonraki eşiğe ilerleme: 0–1 */
  ilerleme: number;
  currencyCode: string;
};

export function berberDurumu(musteri: {
  tags?: string[];
  orders?: CustomerOrder[];
} | null | undefined): BerberDurumu {
  const siparisler = musteri?.orders;
  const kademe = kademeBul(musteri);
  const harcama = donemHarcamasi(siparisler);
  const hakEdilen = hakEdilenKademe(harcama);
  const sira = KADEMELER.findIndex((k) => k.kod === hakEdilen.kod);
  const sonraki = KADEMELER[sira + 1] ?? null;
  const taban = hakEdilen.esik;
  return {
    kademe,
    hakEdilen,
    yukseltmeBekliyor: Boolean(kademe && hakEdilen.indirim > kademe.indirim),
    puan: toplamPuan(siparisler),
    harcama,
    sonraki,
    kalan: sonraki ? Math.max(0, sonraki.esik - harcama) : 0,
    ilerleme: sonraki ? Math.min(1, (harcama - taban) / (sonraki.esik - taban)) : 1,
    /* Sipariş para birimi; hiç sipariş yoksa mağazanın varsayılanı */
    currencyCode: sayilanlar(siparisler)[0]?.currencyCode ?? "TRY",
  };
}
