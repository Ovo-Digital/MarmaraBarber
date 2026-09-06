import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlickCollectionPlp } from "@/components/slick/collection-plp";
import { storefrontGetCollectionByHandle } from "@/services/shopify/storefront-direct";

type Props = { params: Promise<{ handle: string }> };

/**
 * Koleksiyon sayfaları istendiğinde oluşturulur, 5 dakika önbellekte tutulur.
 * Mağazada kaç koleksiyon olursa olsun derleme süresi uzamaz.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const data = await storefrontGetCollectionByHandle(handle, 1);
    return { title: data?.title ?? handle };
  } catch {
    return { title: handle };
  }
}

export default async function CollectionDetailPage({ params }: Props) {
  const { handle } = await params;

  const data = await storefrontGetCollectionByHandle(handle);
  if (!data) notFound();

  return (
    <SlickCollectionPlp
      title={data.title}
      description={data.description || `Shop the ${data.title} range.`}
      image={data.imageUrl}
      products={data.products}
    />
  );
}
