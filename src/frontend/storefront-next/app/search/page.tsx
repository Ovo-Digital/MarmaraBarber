import { SlickCollectionPlp } from "@/components/slick/collection-plp";
import { searchMarmaraProducts } from "@/lib/marmara-catalog";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const products = q ? searchMarmaraProducts(q) : [];
  const heroImage = products.find((p) => p.imageUrl)?.imageUrl;

  if (!q) {
    return (
      <div className="sg-container py-16">
        <h1 className="sg-heading text-[32px]">Ara</h1>
        <p className="sg-body mt-3 text-[#666]">Ürün bulmak için bir arama terimi gir.</p>
      </div>
    );
  }

  return (
    <SlickCollectionPlp
      title={`“${q}”`}
      description={`${products.length} sonuç`}
      image={heroImage}
      products={products}
    />
  );
}
