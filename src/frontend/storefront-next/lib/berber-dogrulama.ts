import type { Customer } from "@/types/customer";
import { kademeBul } from "@/lib/berber";

/**
 * Berber doğrulama — üç yol, üç kod.
 *
 * NEDEN KOD İSTİYORUZ, BELGE DEĞİL
 * Berberler odasının API'si yok, "bu adam berber mi" diye sorabileceğimiz bir
 * uç nokta yok. Ama Türkiye'de berber olduğunu gösteren üç resmi belgenin
 * hepsinin üstünde bir doğrulama kodu var ve bu kodlar resmi sistemlerden
 * sorgulanabiliyor. Yani belgenin fotoğrafına bakıp "gerçek mi acaba" diye
 * tahmin etmek yerine kodu resmi sayfaya girip teyit ediyoruz.
 *
 * Yan faydası KVKK: elimizde kimlik bilgisi taşıyan belge arşivi birikmiyor.
 * Onaydan sonra sadece "hangi yolla, hangi tarihte, kim onayladı" kaydı kalır.
 *
 * ⚠️ TEYİT EDİLECEK: vergi levhasında NACE faaliyet kodunun basılı olduğu
 * kaynaklarda yazıyor ama örnek levhayla doğrulanmadı. Kod basılı değilse
 * levha yalnızca "işletme gerçek" der, "işletme berber" demez — o durumda
 * vergi levhası yolu tek başına yetmez, yanında ustalık belgesi istenir.
 * Ayrıca GİB 2026'da NACE listesini Rev 2.1'e taşımış olabilir; aşağıdaki
 * 96.02.02 / 96.02.03 kodları güncel listeden teyit edilmeli.
 */

export type DogrulamaYoluKodu = "vergi-levhasi" | "ustalik" | "esnaf-sicil";

export type DogrulamaYolu = {
  kod: DogrulamaYoluKodu;
  ad: string;
  /** Kartta tek satır: bu yol neyi kanıtlıyor */
  kanit: string;
  /** Kod alanının etiketi — yola göre değişiyor */
  kodEtiketi: string;
  /** Kodun belgede nerede yazdığı — başvuran arayıp bulsun */
  nerede: string;
  /** Vergi kimlik numarası da isteniyor mu (levha doğrulaması ikisini birlikte ister) */
  vknIster?: boolean;
  /**
   * Ekibin doğrulamayı yapacağı resmi sayfa. Ekranda başvurana
   * GÖSTERİLMİYOR; başvuru notuna eklenip panele düşüyor ki onaylayan
   * kişi adresi aramak zorunda kalmasın.
   */
  resmiSayfa: string;
};

export const DOGRULAMA_YOLLARI: DogrulamaYolu[] = [
  {
    kod: "vergi-levhasi",
    ad: "Tax certificate",
    kanit: "Shows your business is registered and what trade it is registered for.",
    kodEtiketi: "Approval code on the certificate",
    nerede: "Printed on your e-certificate, next to your tax number.",
    vknIster: true,
    resmiSayfa: "https://ivd.gib.gov.tr — Vergi Levhası Doğrulama (VKN + onay kodu)",
  },
  {
    kod: "ustalik",
    ad: "Mastership certificate",
    kanit: "Shows you are a qualified barber.",
    kodEtiketi: "Barcode or verification number",
    nerede: "Printed along the bottom edge of the certificate.",
    resmiSayfa:
      "https://www.turkiye.gov.tr — MEB Kalfalık/Ustalık Belgesi Doğrulama (barkod)",
  },
  {
    kod: "esnaf-sicil",
    ad: "Chamber registration",
    kanit: "Shows your shop is registered with the chamber of tradesmen.",
    kodEtiketi: "Barcode number on the document",
    nerede: "Only documents issued through e-Devlet carry a barcode.",
    resmiSayfa: "https://www.turkiye.gov.tr/belge-dogrulama (barkod)",
  },
];

const yollar = new Map(DOGRULAMA_YOLLARI.map((y) => [y.kod, y]));

export function dogrulamaYolu(kod: string | undefined | null): DogrulamaYolu | null {
  if (!kod) return null;
  return yollar.get(kod as DogrulamaYoluKodu) ?? null;
}

/* ─── Başvurunun durumu ──────────────────────────────────────────────────── */

/**
 * Hesabın berber programındaki yeri. Shopify'da müşteri ETİKETİ olarak
 * tutuluyor; onaylayan kişi panelden etiketi değiştiriyor, başka bir araç
 * gerekmiyor.
 *
 *   berber-basvuru      → başvuru alındı, sıraya girdi
 *   berber-inceleniyor  → kodu sorguluyoruz
 *   berber-bronz/…      → onaylandı, kademesi girildi
 *   berber-red          → olmadı
 *
 * Onay gelene kadar perakende fiyat geçerli: ekranda indirimli fiyat
 * göstermiyoruz, çünkü kasada inmez.
 */
export type BasvuruDurumu = "yok" | "alindi" | "inceleniyor" | "onayli" | "red";

export const BASVURU_ETIKETLERI: Record<"alindi" | "inceleniyor" | "red", string> = {
  alindi: "berber-basvuru",
  inceleniyor: "berber-inceleniyor",
  red: "berber-red",
};

export function basvuruDurumu(
  musteri: Pick<Customer, "tags"> | null | undefined,
): BasvuruDurumu {
  /* Kademe etiketi varsa onay gelmiş; başvuru etiketi silinmemiş olsa bile
     onay ağır basıyor. */
  if (kademeBul(musteri)) return "onayli";

  const etiketler = (musteri?.tags ?? []).map((e) => e.trim().toLowerCase());
  if (etiketler.includes(BASVURU_ETIKETLERI.red)) return "red";
  if (etiketler.includes(BASVURU_ETIKETLERI.inceleniyor)) return "inceleniyor";
  if (etiketler.includes(BASVURU_ETIKETLERI.alindi)) return "alindi";
  return "yok";
}

/** Başvuru verilmiş ama sonuçlanmamış mı — ekranda "bekliyor" anlatımı için */
export function basvuruBekliyor(durum: BasvuruDurumu): boolean {
  return durum === "alindi" || durum === "inceleniyor";
}

/** Durum şeridinin üç adımı — sırayla, kaçıncıda olduğumuz belli olsun */
export const BASVURU_ADIMLARI: { durum: BasvuruDurumu; ad: string; metin: string }[] = [
  {
    durum: "alindi",
    ad: "Application received",
    metin: "We have your details and your verification code.",
  },
  {
    durum: "inceleniyor",
    ad: "Being checked",
    metin: "We verify your code against the official record.",
  },
  {
    durum: "onayli",
    ad: "Approved",
    metin: "Barber pricing is live on your account.",
  },
];
