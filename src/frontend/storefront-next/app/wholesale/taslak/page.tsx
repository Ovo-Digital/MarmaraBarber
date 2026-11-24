import type { Metadata } from "next";
import { Suspense } from "react";
import { PartnerTaslak } from "@/components/slick/partner-taslak";
import { storefrontGetBestSellers } from "@/services/shopify/storefront-direct";

export const metadata: Metadata = {
  title: "Partner — taslak",
  /* Taslak: arama motorlarına girmesin, gerçek /wholesale ile çakışmasın */
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function Page() {
  /* Shopify'a ulaşılamazsa sayfa çökmesin: hesaplayıcı ve kit gizlenir,
     onların yerine "ürünler yükleniyor" satırı çıkar. */
  let urunler: Awaited<ReturnType<typeof storefrontGetBestSellers>> = [];
  try {
    urunler = await storefrontGetBestSellers(12);
  } catch {
    urunler = [];
  }

  // ?yol=... okunduğu için Suspense sınırı gerekiyor
  return (
    <Suspense>
      <PartnerTaslak urunler={urunler} />
    </Suspense>
  );
}
