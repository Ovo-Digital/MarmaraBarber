import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlickProductDetail } from "@/components/slick/product-detail";
import {
  storefrontGetProductDetail,
  storefrontGetProductsByQuery,
  storefrontGetBestSellers,
} from "@/services/shopify/storefront-direct";
import type { Product } from "@/types/commerce";

type Props = { params: Promise<{ handle: string }> };

/**
 * Ürün sayfaları istendiğinde oluşturulur, 5 dakika önbellekte tutulur.
 * Böylece Shopify'daki fiyat/stok değişiklikleri siteye yansır ve mağazada
 * kaç ürün olursa olsun derleme süresi uzamaz.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const detail = await storefrontGetProductDetail(handle);
    if (!detail) return { title: "Product" };
    return {
      title: detail.product.title,
      description: detail.product.description.slice(0, 160),
      openGraph: detail.product.imageUrl
        ? { images: [{ url: detail.product.imageUrl }] }
        : undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { handle } = await params;

  const detail = await storefrontGetProductDetail(handle);
  if (!detail) notFound();

  const { product, images, descriptionHtml, productType } = detail;

  // Benzer ürünler: önce aynı ürün tipinden, yetmezse çok satanlardan.
  // Ürün tipi Shopify'dan geldiği için mağazadan bağımsız çalışır.
  let havuz: Product[] = [];
  try {
    if (productType) {
      havuz = await storefrontGetProductsByQuery(
        `product_type:"${productType.replace(/"/g, "")}"`,
        16,
      );
    }
    if (havuz.length < 5) havuz = await storefrontGetBestSellers(16);
  } catch {
    havuz = [];
  }

  const digerleri = havuz.filter((p) => p.handle !== handle);

  return (
    <SlickProductDetail
      product={product}
      images={images}
      descriptionHtml={descriptionHtml}
      crossSell={digerleri.slice(0, 4)}
      related={digerleri.length > 4 ? digerleri.slice(4, 12) : digerleri.slice(0, 8)}
    />
  );
}
