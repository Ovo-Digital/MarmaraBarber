import { notFound } from "next/navigation";
import { SlickProductDetail } from "@/components/slick/product-detail";
import {
  getMarmaraProductByHandle,
  getMarmaraProductRaw,
  listMarmaraByProductType,
  listMarmaraFeatured,
  listMarmaraProducts,
} from "@/lib/marmara-catalog";
import type { Metadata } from "next";

type Props = { params: Promise<{ handle: string }> };

export const dynamic = "force-static";

export async function generateStaticParams() {
  return listMarmaraProducts().map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getMarmaraProductByHandle(handle);
  if (!product) return { title: "Product" };
  return { title: product.title, description: product.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
  const { handle } = await params;
  const product = getMarmaraProductByHandle(handle);
  const raw = getMarmaraProductRaw(handle);
  if (!product || !raw) notFound();

  const images = (raw.images ?? []).map((i) => i.src).filter(Boolean);

  const sameType = listMarmaraByProductType(raw.productType || "", 12).filter(
    (p) => p.handle !== handle,
  );
  const pool = sameType.length ? sameType : listMarmaraFeatured(12).filter((p) => p.handle !== handle);

  const crossSell = pool.slice(0, 4);
  const related = pool.slice(4, 12);
  const relatedFallback = related.length ? related : pool.slice(0, 8);

  return (
    <SlickProductDetail
      product={product}
      images={images}
      descriptionHtml={raw.descriptionHtml}
      crossSell={crossSell}
      related={relatedFallback}
    />
  );
}
