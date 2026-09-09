import type { Metadata } from "next";
import { SlickCollectionPlp } from "@/components/slick/collection-plp";
import { storefrontGetProducts, storefrontGetProductsByQuery } from "@/services/shopify/storefront-direct";

export const metadata: Metadata = { title: "Shop" };

/** Shopify'daki fiyat/stok değişikliklerinin siteye yansıması için 60 sn'de bir tazele. */
export const revalidate = 60;

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const type = sp.type?.trim();

  // type parametresi varsa Shopify'a "sadece bu kategoriyi ver" diye sor,
  // yoksa katalogun tamamını çek.
  const products = type
    ? await storefrontGetProductsByQuery(`product_type:"${type.replace(/"/g, "")}"`, 250, "TITLE", false)
    : await storefrontGetProducts(250);

  const title = type || "All products";
  const heroImage = products.find((p) => p.imageUrl)?.imageUrl;

  return (
    <SlickCollectionPlp
      title={title}
      description={
        type
          ? `${title} kategorisindeki profesyonel berber ürünlerini incele.`
          : "Cologne, styling, skin care, accessories and more — the full range."
      }
      image={heroImage}
      products={products}
    />
  );
}
