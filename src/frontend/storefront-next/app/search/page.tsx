import type { Metadata } from "next";
import { SlickCollectionPlp } from "@/components/slick/collection-plp";
import { storefrontGetProductsByQuery } from "@/services/shopify/storefront-direct";
import type { Product } from "@/types/commerce";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = { title: "Search" };

/** Arama sonuçları her istekte tazedir; önbelleklenmez. */
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const terim = q.trim();

  if (!terim) {
    return (
      <div className="sg-container py-16">
        <h1
          className="uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.1vw, 30px)",
            lineHeight: "43.1px",
            color: "#1C1C1C",
          }}
        >
          Search
        </h1>
        <p className="mt-3 text-[14px] text-[#666]">Enter a search term to find products.</p>
      </div>
    );
  }

  // Shopify'ın kendi ürün araması: başlık, etiket, ürün tipi ve satıcıda arar.
  // Tırnak kaçırılıyor ki arama söz dizimi bozulmasın.
  let products: Product[] = [];
  try {
    products = await storefrontGetProductsByQuery(terim.replace(/"/g, ""), 60, "RELEVANCE", false);
  } catch {
    products = [];
  }

  if (products.length === 0) {
    return (
      <div className="sg-container py-16">
        <h1
          className="uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.1vw, 30px)",
            lineHeight: "43.1px",
            color: "#1C1C1C",
          }}
        >
          {`No results for “${terim}”`}
        </h1>
        <p className="mt-3 text-[14px] text-[#666]">
          Try a different search term or browse the collections.
        </p>
      </div>
    );
  }

  return (
    <SlickCollectionPlp
      title={`“${terim}”`}
      description={`${products.length} result${products.length === 1 ? "" : "s"}`}
      image={products.find((p) => p.imageUrl)?.imageUrl}
      products={products}
    />
  );
}
