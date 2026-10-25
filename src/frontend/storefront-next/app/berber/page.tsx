import type { Metadata } from "next";
import { Suspense } from "react";
import { BerberPage } from "@/components/slick/berber-page";
import { storefrontGetBestSellers } from "@/services/shopify/storefront-direct";

export const metadata: Metadata = {
  title: "Barber programme",
  description:
    "Barber pricing on the full Marmara Barber range, a stand built for your shop, and tiers that improve as you keep ordering.",
};

/** Stand bölümündeki ürünler Shopify'dan; 5 dakikada bir tazele. */
export const revalidate = 300;

export default async function Page() {
  /* Shopify'a ulaşılamazsa sayfa ÇÖKMEMELİ: stand ürünsüz, program metni
     yerinde açılır. */
  let urunler: Awaited<ReturnType<typeof storefrontGetBestSellers>> = [];
  try {
    urunler = await storefrontGetBestSellers(12);
  } catch {
    urunler = [];
  }

  // useSearchParams (?tab=login) derleme sırasında Suspense sınırı istiyor
  return (
    <Suspense>
      <BerberPage urunler={urunler} />
    </Suspense>
  );
}
