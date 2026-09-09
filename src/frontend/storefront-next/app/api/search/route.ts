import { NextResponse } from "next/server";
import { storefrontGetProductsByQuery } from "@/services/shopify/storefront-direct";

/**
 * Header araması için canlı öneri ucu.
 *
 * Shopify'a istek SUNUCUDAN gidiyor: özel belirteç tarayıcıya çıkmıyor.
 * Sonuç kısa tutuluyor — açılır liste için 6 ürün yeterli, fazlası hem
 * gereksiz veri hem yavaşlık.
 */
export const dynamic = "force-dynamic";

const ADET = 6;

export async function GET(request: Request) {
  const terim = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (terim.length < 2) return NextResponse.json({ products: [] });

  try {
    const urunler = await storefrontGetProductsByQuery(terim, ADET, "RELEVANCE", false);
    return NextResponse.json({
      products: urunler.map((p) => ({
        handle: p.handle,
        title: p.title,
        price: p.price,
        currencyCode: p.currencyCode,
        imageUrl: p.imageUrl ?? null,
        availableForSale: p.availableForSale,
      })),
    });
  } catch {
    // Arama çökerse header'ı bozmamak için boş liste dön
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
