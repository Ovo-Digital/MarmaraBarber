import type { Metadata } from "next";
import { SlickCollectionPlp } from "@/components/slick/collection-plp";
import { listMarmaraByProductType, listMarmaraProducts } from "@/lib/marmara-catalog";

export const metadata: Metadata = { title: "Shop" };
export const dynamic = "force-static";

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const type = sp.type?.trim();
  const products = type ? listMarmaraByProductType(type, 200) : listMarmaraProducts();
  const title = type || "Tüm Ürünler";
  const heroImage = products.find((p) => p.imageUrl)?.imageUrl;

  return (
    <SlickCollectionPlp
      title={title}
      description={
        type
          ? `${title} kategorisindeki profesyonel berber ürünlerini incele.`
          : "Kolonya, şekillendirici, cilt bakımı, aksesuar ve daha fazlası — tüm Marmara Barber kataloğu."
      }
      image={heroImage}
      products={products}
    />
  );
}
