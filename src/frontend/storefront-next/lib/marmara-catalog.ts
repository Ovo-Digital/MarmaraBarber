import catalogJson from "@/data/marmara/catalog.json";
import type { Collection, Product, ProductVariant } from "@/types/commerce";

type MarmaraImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  remoteSrc?: string;
  id?: string;
  position?: number;
};

export type MarmaraProductRaw = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  featuredImage: MarmaraImage | null;
  images: MarmaraImage[];
  options?: { name: string; values: string[] }[];
  variants: {
    id: string;
    title: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    available: boolean;
    option1?: string | null;
    option2?: string | null;
    option3?: string | null;
  }[];
};

export type MarmaraCollectionRaw = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: MarmaraImage | null;
  productsCount: number;
  productHandles: string[];
};

const catalog = catalogJson as unknown as {
  source: string;
  scrapedAt: string;
  currency: string;
  stats: Record<string, unknown>;
  products: MarmaraProductRaw[];
  collections: MarmaraCollectionRaw[];
};

export function getMarmaraCatalogMeta() {
  return {
    source: catalog.source,
    scrapedAt: catalog.scrapedAt,
    currency: catalog.currency as string,
    stats: catalog.stats,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function marmaraToProduct(raw: MarmaraProductRaw): Product {
  const variants: ProductVariant[] = (raw.variants ?? []).map((v, idx) => ({
    id: v.id,
    title: v.title || "Default Title",
    price: v.price,
    availableForSale: Boolean(v.available),
    sku: v.sku || undefined,
    imageUrl: raw.images?.[idx]?.src || raw.featuredImage?.src || raw.images?.[0]?.src,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
  }));

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: stripHtml(raw.descriptionHtml || ""),
    imageUrl: raw.featuredImage?.src || raw.images?.[0]?.src,
    secondaryImageUrl: raw.images?.[1]?.src,
    price: raw.price,
    compareAtPrice: raw.compareAtPrice,
    currencyCode: "TRY",
    availableForSale: Boolean(raw.available),
    productType: raw.productType || undefined,
    options: (raw.options ?? []).map((o) => ({ name: o.name, values: o.values ?? [] })),
    rating: 4.8 + ((Number(raw.id) % 3) * 0.05),
    reviewCount: 12 + (Number(raw.id) % 180),
    variants:
      variants.length > 0
        ? variants
        : [
            {
              id: `${raw.id}-default`,
              title: "Default Title",
              price: raw.price,
              availableForSale: Boolean(raw.available),
              imageUrl: raw.featuredImage?.src || raw.images?.[0]?.src,
            },
          ],
  };
}

export function listMarmaraProducts(limit?: number): Product[] {
  const products = catalog.products.map(marmaraToProduct);
  return typeof limit === "number" ? products.slice(0, limit) : products;
}

export function getMarmaraProductByHandle(handle: string): Product | null {
  const raw = catalog.products.find((p) => p.handle === handle);
  return raw ? marmaraToProduct(raw) : null;
}

export function getMarmaraProductRaw(handle: string): MarmaraProductRaw | null {
  return catalog.products.find((p) => p.handle === handle) ?? null;
}

export function listMarmaraCollections(): Collection[] {
  return catalog.collections
    .filter((c) => c.handle !== "frontpage")
    .map((c) => ({
      id: c.id,
      handle: c.handle,
      title: c.title,
      imageUrl: c.image?.src,
    }));
}

export function getMarmaraCollection(handle: string): {
  collection: Collection;
  products: Product[];
} | null {
  const raw = catalog.collections.find((c) => c.handle === handle);
  if (!raw) return null;

  const handleSet = new Set(raw.productHandles ?? []);
  let products = catalog.products.filter((p) => handleSet.has(p.handle)).map(marmaraToProduct);

  // Boş koleksiyonlarda product_type ile eşle
  if (products.length === 0) {
    const title = raw.title.toLowerCase();
    products = catalog.products
      .filter((p) => (p.productType || "").toLowerCase().includes(title) || title.includes((p.productType || "").toLowerCase()))
      .map(marmaraToProduct);
  }

  return {
    collection: {
      id: raw.id,
      handle: raw.handle,
      title: raw.title,
      imageUrl: raw.image?.src,
    },
    products,
  };
}

export function searchMarmaraProducts(query: string, limit = 48): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return listMarmaraProducts(limit);
  return catalog.products
    .filter((p) => {
      const hay = `${p.title} ${p.productType} ${(p.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    })
    .slice(0, limit)
    .map(marmaraToProduct);
}

export function listMarmaraByProductType(productType: string, limit = 24): Product[] {
  const type = productType.toLowerCase();
  return catalog.products
    .filter((p) => (p.productType || "").toLowerCase() === type)
    .slice(0, limit)
    .map(marmaraToProduct);
}

export function listMarmaraFeatured(limit = 12): Product[] {
  // Stokta olan, fiyatı > 0 ürünler — en çok satan tip karışımı
  const preferred = [
    "Saç Şekillendirici",
    "Parfüm",
    "Sprey Kolonya",
    "Fön Suyu",
    "Tıraş Jeli",
    "Dökme Kolonya",
  ];
  const picked: Product[] = [];
  for (const type of preferred) {
    for (const p of listMarmaraByProductType(type, 3)) {
      if (p.availableForSale && p.price > 0) picked.push(p);
      if (picked.length >= limit) return picked;
    }
  }
  return listMarmaraProducts(limit).filter((p) => p.availableForSale);
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
