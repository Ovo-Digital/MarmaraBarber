import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlickCollectionPlp } from "@/components/slick/collection-plp";
import { getMarmaraCollection, listMarmaraCollections } from "@/lib/marmara-catalog";

type Props = { params: Promise<{ handle: string }> };

export const dynamic = "force-static";

export async function generateStaticParams() {
  return listMarmaraCollections().map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const data = getMarmaraCollection(handle);
  return { title: data?.collection.title ?? handle };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { handle } = await params;
  const data = getMarmaraCollection(handle);
  if (!data) notFound();

  const heroImage =
    data.collection.imageUrl || data.products.find((p) => p.imageUrl)?.imageUrl;

  return (
    <SlickCollectionPlp
      title={data.collection.title}
      description={`${data.collection.title} koleksiyonundaki profesyonel Marmara Barber ürünlerini keşfet.`}
      image={heroImage}
      products={data.products}
    />
  );
}
