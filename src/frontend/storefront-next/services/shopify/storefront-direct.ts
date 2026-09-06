import { createShopifyClient } from "@/lib/shopify-client";
import type { PlpSortOption } from "@/lib/plp-filters";
import type { Cart, Collection, Product, ProductFacet, ProductListingResult } from "@/types/commerce";

const PRODUCT_FRAGMENT = `
  id handle title description availableForSale productType
  featuredImage { url }
  images(first: 2) { edges { node { url } } }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount } }
  variants(first: 10) {
    edges {
      node {
        id title availableForSale sku
        price { amount currencyCode }
        compareAtPrice { amount }
        selectedOptions { name value }
      }
    }
  }
`;

function mapProduct(node: Record<string, unknown>): Product {
  const priceRange = node.priceRange as { minVariantPrice: { amount: string; currencyCode: string } };
  const variants = (node.variants as { edges: { node: Record<string, unknown> }[] })?.edges ?? [];
  const images = (node.images as { edges: { node: { url: string } }[] } | undefined)?.edges ?? [];
  const price = parseFloat(priceRange?.minVariantPrice?.amount ?? "0");

  // Shopify indirim yoksa compareAtPrice'i fiyata eşit ya da 0 döndürebilir;
  // sadece gerçekten üstteyse "üstü çizili fiyat" olarak göster.
  const compareRaw = parseFloat(
    (node.compareAtPriceRange as { minVariantPrice?: { amount?: string } } | undefined)
      ?.minVariantPrice?.amount ?? "0",
  );
  const compareAtPrice = compareRaw > price ? compareRaw : null;

  const featured = (node.featuredImage as { url?: string } | null)?.url;
  // Hover'da gösterilecek 2. görsel: kapak görselinden farklı olan ilk görsel.
  const secondaryImageUrl = images.map((e) => e.node.url).find((url) => url !== featured);

  return {
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    description: (node.description as string) ?? "",
    availableForSale: node.availableForSale as boolean,
    productType: (node.productType as string) || undefined,
    imageUrl: featured,
    secondaryImageUrl,
    price,
    compareAtPrice,
    currencyCode: priceRange?.minVariantPrice?.currencyCode ?? "TRY",
    variants: variants.map(({ node: v }) => {
      const vPrice = parseFloat((v.price as { amount: string })?.amount ?? "0");
      const vCompare = parseFloat((v.compareAtPrice as { amount?: string } | null)?.amount ?? "0");
      const opts = (v.selectedOptions as { name: string; value: string }[] | undefined) ?? [];
      return {
        id: v.id as string,
        title: v.title as string,
        price: vPrice,
        compareAtPrice: vCompare > vPrice ? vCompare : null,
        availableForSale: v.availableForSale as boolean,
        sku: v.sku as string | undefined,
        option1: opts[0]?.value ?? null,
        option2: opts[1]?.value ?? null,
        option3: opts[2]?.value ?? null,
      };
    }),
  };
}

const CART_LINE_FRAGMENT = `
  id quantity
  merchandise {
    ... on ProductVariant {
      id title
      image { url }
      price { amount currencyCode }
      product { title handle featuredImage { url } }
    }
  }
`;

function mapCart(cart: Record<string, unknown>): Cart {
  const total = (cart.cost as { totalAmount: { amount: string; currencyCode: string } }).totalAmount;
  const lines = (cart.lines as { edges: { node: Record<string, unknown> }[] }).edges;
  return {
    id: cart.id as string,
    checkoutUrl: cart.checkoutUrl as string,
    totalAmount: parseFloat(total.amount),
    currencyCode: total.currencyCode,
    lines: lines.map(({ node }) => {
      const merch = node.merchandise as Record<string, unknown>;
      const price = merch.price as { amount: string };
      const product = merch.product as { title: string; handle: string; featuredImage?: { url?: string } };
      const variantImage = (merch.image as { url?: string } | null)?.url;
      return {
        id: node.id as string,
        merchandiseId: merch.id as string,
        quantity: node.quantity as number,
        title: product.title,
        variantTitle: merch.title as string,
        productHandle: product.handle,
        imageUrl: variantImage ?? product.featuredImage?.url,
        price: parseFloat(price.amount),
      };
    }),
  };
}

function mapFacet(node: Record<string, unknown>): ProductFacet {
  const values = (node.values as Record<string, unknown>[] | undefined) ?? [];
  return {
    id: node.id as string,
    label: node.label as string,
    type: node.type as string,
    values: values.map((v) => ({
      id: v.id as string,
      label: v.label as string,
      count: (v.count as number) ?? 0,
      input: v.input as string,
    })),
  };
}

function mapSearchSort(sort: PlpSortOption): { sortKey: "PRICE" | "RELEVANCE"; reverse: boolean } {
  if (sort === "price-asc") return { sortKey: "PRICE", reverse: false };
  if (sort === "price-desc") return { sortKey: "PRICE", reverse: true };
  return { sortKey: "RELEVANCE", reverse: false };
}

export async function storefrontSearchWithFilters(options: {
  query: string;
  productFilters?: Record<string, unknown>[];
  sort?: PlpSortOption;
  first?: number;
}): Promise<ProductListingResult> {
  const client = createShopifyClient();
  const { query, productFilters = [], sort = "relevance", first = 48 } = options;
  const { sortKey, reverse } = mapSearchSort(sort);

  const data = await client.request<{
    search: {
      totalCount: number;
      productFilters: Record<string, unknown>[];
      edges: { node: Record<string, unknown> }[];
    };
  }>(
    `query SearchCatalog($query:String!,$first:Int!,$productFilters:[ProductFilter!],$sortKey:SearchSortKeys,$reverse:Boolean){
      search(query:$query, first:$first, types:PRODUCT, productFilters:$productFilters, sortKey:$sortKey, reverse:$reverse) {
        totalCount
        productFilters {
          id
          label
          type
          values { id label count input }
        }
        edges {
          node {
            ... on Product { ${PRODUCT_FRAGMENT} }
          }
        }
      }
    }`,
    { query, first, productFilters, sortKey, reverse },
  );

  const search = data.search;
  return {
    products: search.edges.filter((e) => e.node.handle).map((e) => mapProduct(e.node)),
    filters: search.productFilters.map(mapFacet),
    totalCount: search.totalCount,
  };
}

export async function storefrontGetProductsByQuery(
  query: string,
  first = 48,
  sortKey: "CREATED_AT" | "PRICE" | "TITLE" | "RELEVANCE" | "BEST_SELLING" = "CREATED_AT",
  reverse = true,
): Promise<Product[]> {
  const client = createShopifyClient();
  const data = await client.request<{ products: { edges: { node: Record<string, unknown> }[] } }>(
    `query($first:Int!,$query:String!,$sortKey:ProductSortKeys,$reverse:Boolean){
      products(first:$first, query:$query, sortKey:$sortKey, reverse:$reverse) {
        edges { node { ${PRODUCT_FRAGMENT} } }
      }
    }`,
    { first, query, sortKey, reverse },
  );
  return data.products.edges.map((e) => mapProduct(e.node));
}

export async function storefrontGetProducts(first = 20): Promise<Product[]> {
  const client = createShopifyClient();
  const data = await client.request<{ products: { edges: { node: Record<string, unknown> }[] } }>(
    `query($first:Int!){ products(first:$first){ edges { node { ${PRODUCT_FRAGMENT} } } } }`,
    { first }
  );
  return data.products.edges.map((e) => mapProduct(e.node));
}

export async function storefrontGetProduct(handle: string): Promise<Product | null> {
  const client = createShopifyClient();
  const data = await client.request<{ product: Record<string, unknown> | null }>(
    `query($handle:String!){ product(handle:$handle){ ${PRODUCT_FRAGMENT} } }`,
    { handle }
  );
  return data.product ? mapProduct(data.product) : null;
}

export async function storefrontGetCollections(first = 20): Promise<Collection[]> {
  const client = createShopifyClient();
  const data = await client.request<{
    collections: { edges: { node: Record<string, unknown> }[] };
  }>(`query($first:Int!){ collections(first:$first){ edges { node { id handle title image { url } } } } }`, { first });
  return data.collections.edges.map(({ node }) => ({
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    imageUrl: (node.image as { url?: string } | null)?.url,
  }));
}

export async function storefrontSearch(query: string, first = 20): Promise<{ products: Product[]; totalCount: number }> {
  const client = createShopifyClient();
  const data = await client.request<{
    search: { edges: { node: Record<string, unknown> }[] };
  }>(
    `query($query:String!,$first:Int!){ search(query:$query,first:$first,types:PRODUCT){ edges { node { ... on Product { ${PRODUCT_FRAGMENT} } } } } }`,
    { query, first }
  );
  const products = data.search.edges.filter((e) => e.node.handle).map((e) => mapProduct(e.node));
  return { products, totalCount: products.length };
}

export async function storefrontCreateCart(): Promise<Cart> {
  const client = createShopifyClient();
  const data = await client.request<{ cartCreate: { cart: Record<string, unknown> } }>(
    `mutation { cartCreate { cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first:50){ edges { node { ${CART_LINE_FRAGMENT} } } } } } }`
  );
  return mapCart(data.cartCreate.cart);
}

export async function storefrontAddToCart(cartId: string, variantId: string, quantity: number): Promise<Cart> {
  const client = createShopifyClient();
  const data = await client.request<{ cartLinesAdd: { cart: Record<string, unknown> } }>(
    `mutation($cartId:ID!,$lines:[CartLineInput!]!){ cartLinesAdd(cartId:$cartId,lines:$lines){ cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first:50){ edges { node { ${CART_LINE_FRAGMENT} } } } } } }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
  );
  return mapCart(data.cartLinesAdd.cart);
}

export async function storefrontUpdateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const client = createShopifyClient();
  const data = await client.request<{ cartLinesUpdate: { cart: Record<string, unknown> } }>(
    `mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){ cartLinesUpdate(cartId:$cartId,lines:$lines){ cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first:50){ edges { node { ${CART_LINE_FRAGMENT} } } } } } }`,
    { cartId, lines: [{ id: lineId, quantity }] }
  );
  return mapCart(data.cartLinesUpdate.cart);
}

export async function storefrontRemoveFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const client = createShopifyClient();
  const data = await client.request<{ cartLinesRemove: { cart: Record<string, unknown> } }>(
    `mutation($cartId:ID!,$lineIds:[ID!]!){ cartLinesRemove(cartId:$cartId,lineIds:$lineIds){ cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first:50){ edges { node { ${CART_LINE_FRAGMENT} } } } } } }`,
    { cartId, lineIds }
  );
  return mapCart(data.cartLinesRemove.cart);
}

export async function storefrontGetCart(cartId: string): Promise<Cart | null> {
  const client = createShopifyClient();
  const data = await client.request<{ cart: Record<string, unknown> | null }>(
    `query($cartId:ID!){ cart(id:$cartId){ id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first:50){ edges { node { ${CART_LINE_FRAGMENT} } } } } }`,
    { cartId }
  );
  return data.cart ? mapCart(data.cart) : null;
}

/* ── Hero slider verisi ────────────────────────────────────────────────
   Mağazadan bağımsız çalışır: koleksiyonları çeker, görseli olanları seçer.
   Görsel önceliği:
     1) Koleksiyonun kendi görseli (Shopify'da elle atanmışsa — merchant kontrolü)
     2) Koleksiyondaki ilk ürünün kapak görseli
   Görseli hiç olmayan koleksiyon hero'ya alınmaz.
   ────────────────────────────────────────────────────────────────────── */
/** Sıralama için koleksiyon başına çekilecek örnek ürün sayısı (sayım burada tavanlanır). */
const HERO_SAMPLE = 24;

export type HeroSlide = {
  handle: string;
  title: string;
  imageUrl: string;
  href: string;
  /** Koleksiyonun kendi görseli mi kullanıldı (merchant tarafından seçilmiş) */
  curated: boolean;
};

export async function storefrontGetHeroSlides(limit = 6): Promise<HeroSlide[]> {
  const client = createShopifyClient();
  const data = await client.request<{
    collections: {
      edges: {
        node: {
          handle: string;
          title: string;
          image: { url: string } | null;
          products: { edges: { node: { featuredImage: { url: string } | null } }[] };
        };
      }[];
    };
  }>(
    `query($first:Int!,$sample:Int!){
      collections(first:$first){
        edges { node {
          handle title
          image { url }
          products(first: $sample) { edges { node { featuredImage { url } } } }
        } }
      }
    }`,
    { first: 40, sample: HERO_SAMPLE },
  );

  const slides = data.collections.edges
    // "frontpage" her Shopify mağazasında otomatik açılan varsayılan koleksiyondur,
    // hero başlığı olarak anlamsız ("Ana sayfa") — dışarıda bırak.
    .filter(({ node }) => node.handle !== "frontpage")
    .map(({ node }) => {
      const curated = Boolean(node.image?.url);
      const firstProductImage = node.products.edges.find((e) => e.node.featuredImage?.url)?.node
        .featuredImage?.url;
      return {
        handle: node.handle,
        title: cleanCollectionTitle(node.title),
        imageUrl: node.image?.url ?? firstProductImage ?? "",
        href: `/collections/${node.handle}`,
        curated,
        weight: node.products.edges.length,
      };
    })
    .filter((s) => s.imageUrl);

  slides.sort(
    (a, b) =>
      // 1) Mağaza sahibi koleksiyona görsel atadıysa hero'yu panelden yönetiyor demektir
      Number(b.curated) - Number(a.curated) ||
      // 2) Sonra en çok ürünü olan koleksiyonlar (HERO_SAMPLE'da tavanlanır)
      b.weight - a.weight ||
      a.title.localeCompare(b.title, "tr"),
  );

  return slides.slice(0, limit).map((s) => ({
    handle: s.handle,
    title: s.title,
    imageUrl: s.imageUrl,
    href: s.href,
    curated: s.curated,
  }));
}

/**
 * Koleksiyon adındaki marka önekini temizler: "Marmara Barber | Fön Suyu" → "Fön Suyu".
 * Hero'da başlıklar çok büyük yazıldığı için tekrar eden marka adı yer israfı.
 * Ayırıcı yoksa başlık olduğu gibi kalır — her mağazada güvenle çalışır.
 */
function cleanCollectionTitle(title: string): string {
  const parts = title.split("|").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : title.trim();
}

/**
 * Anasayfa "öne çıkanlar" şeridi için ürünler.
 * Shopify'ın BEST_SELLING sıralamasını kullanır — mağazadan bağımsız çalışır,
 * hangi mağazaya bağlanırsa onun en çok satanları gelir.
 */
export async function storefrontGetBestSellers(first = 12): Promise<Product[]> {
  const client = createShopifyClient();
  const data = await client.request<{ products: { edges: { node: Record<string, unknown> }[] } }>(
    `query($first:Int!){
      products(first:$first, sortKey: BEST_SELLING){
        edges { node { ${PRODUCT_FRAGMENT} } }
      }
    }`,
    { first },
  );
  return data.products.edges.map((e) => mapProduct(e.node));
}

/**
 * Anasayfa kategori ızgarası için koleksiyon karoları.
 *
 * Hero ile aynı görselleri tekrar etmemek için koleksiyonun İLK ürününü değil,
 * sıradaki ürünlerinden birini kullanır (yoksa ilkine düşer). Koleksiyonun kendi
 * görseli varsa her zaman o kazanır — mağaza sahibi panelden kontrol edebilsin.
 */
export async function storefrontGetCategoryTiles(limit = 4): Promise<HeroSlide[]> {
  const client = createShopifyClient();
  const data = await client.request<{
    collections: {
      edges: {
        node: {
          handle: string;
          title: string;
          image: { url: string } | null;
          products: { edges: { node: { featuredImage: { url: string } | null } }[] };
        };
      }[];
    };
  }>(
    `query($first:Int!,$sample:Int!){
      collections(first:$first){
        edges { node {
          handle title
          image { url }
          products(first: $sample) { edges { node { featuredImage { url } } } }
        } }
      }
    }`,
    { first: 40, sample: HERO_SAMPLE },
  );

  const tiles = data.collections.edges
    .filter(({ node }) => node.handle !== "frontpage")
    .map(({ node }) => {
      const gorseller = node.products.edges
        .map((e) => e.node.featuredImage?.url)
        .filter((u): u is string => Boolean(u));
      // Hero ilk görseli kullanıyor; burada varsa 2. görseli seç
      const urunGorseli = gorseller[1] ?? gorseller[0];
      return {
        handle: node.handle,
        title: cleanCollectionTitle(node.title),
        imageUrl: node.image?.url ?? urunGorseli ?? "",
        href: `/collections/${node.handle}`,
        curated: Boolean(node.image?.url),
        weight: gorseller.length,
        gorseller,
      };
    })
    .filter((t) => t.imageUrl);

  tiles.sort(
    (a, b) =>
      Number(b.curated) - Number(a.curated) ||
      b.weight - a.weight ||
      a.title.localeCompare(b.title, "tr"),
  );

  // Aynı ürün birden çok koleksiyonda olabiliyor; aynı görselle iki karo
  // çizmek ızgarayı bozuyor. Görseli daha önce kullanılmışsa koleksiyonun
  // başka bir ürününe geç, o da yoksa karoyu atla.
  const kullanilan = new Set<string>();
  const secilen: typeof tiles = [];

  for (const t of tiles) {
    if (secilen.length >= limit) break;
    if (!kullanilan.has(t.imageUrl)) {
      kullanilan.add(t.imageUrl);
      secilen.push(t);
      continue;
    }
    const alternatif = t.gorseller.find((u) => !kullanilan.has(u));
    if (alternatif) {
      kullanilan.add(alternatif);
      secilen.push({ ...t, imageUrl: alternatif });
    }
  }

  return secilen.map((t) => ({
    handle: t.handle,
    title: t.title,
    imageUrl: t.imageUrl,
    href: t.href,
    curated: t.curated,
  }));
}

/**
 * "Yeni gelenler" şeridi — Shopify'ın eklenme tarihine göre en yeni ürünleri.
 * Mağazadan bağımsız: hangi mağazaya bağlanırsa onun yeni ürünleri gelir.
 */
export async function storefrontGetNewArrivals(first = 12): Promise<Product[]> {
  const client = createShopifyClient();
  const data = await client.request<{ products: { edges: { node: Record<string, unknown> }[] } }>(
    `query($first:Int!){
      products(first:$first, sortKey: CREATED_AT, reverse: true){
        edges { node { ${PRODUCT_FRAGMENT} } }
      }
    }`,
    { first },
  );
  return data.products.edges.map((e) => mapProduct(e.node));
}

/** Ürün detay sayfası için tam ürün verisi. */
export type ProductDetail = {
  product: Product;
  images: string[];
  descriptionHtml: string;
  productType: string;
};

/**
 * Ürün detayı — kapak görselinin yanı sıra galeri görselleri ve zengin
 * açıklama (descriptionHtml) da çekilir. Bulunamazsa null döner.
 */
export async function storefrontGetProductDetail(handle: string): Promise<ProductDetail | null> {
  const client = createShopifyClient();
  const data = await client.request<{
    product:
      | (Record<string, unknown> & {
          descriptionHtml: string | null;
          productType: string | null;
          gallery: { edges: { node: { url: string } }[] };
        })
      | null;
  }>(
    `query($handle:String!){
      product(handle:$handle){
        ${PRODUCT_FRAGMENT}
        descriptionHtml
        gallery: images(first: 10) { edges { node { url } } }
      }
    }`,
    { handle },
  );

  if (!data.product) return null;

  const node = data.product;
  const galeri = node.gallery.edges.map((e) => e.node.url);
  const kapak = (node.featuredImage as { url?: string } | null)?.url;

  return {
    product: mapProduct(node),
    // Kapak görseli her zaman ilk sırada olsun, tekrar etmesin
    images: kapak ? [kapak, ...galeri.filter((u) => u !== kapak)] : galeri,
    descriptionHtml: node.descriptionHtml ?? "",
    productType: node.productType ?? "",
  };
}

/** Koleksiyon dizini için: tüm koleksiyonlar (görseli olmayanlar dahil). */
export async function storefrontGetAllCollections(first = 60): Promise<HeroSlide[]> {
  const client = createShopifyClient();
  const data = await client.request<{
    collections: {
      edges: {
        node: {
          handle: string;
          title: string;
          image: { url: string } | null;
          products: { edges: { node: { featuredImage: { url: string } | null } }[] };
        };
      }[];
    };
  }>(
    `query($first:Int!){
      collections(first:$first){
        edges { node {
          handle title
          image { url }
          products(first: 1) { edges { node { featuredImage { url } } } }
        } }
      }
    }`,
    { first },
  );

  return data.collections.edges
    // "frontpage" her Shopify mağazasında otomatik açılan varsayılan koleksiyondur
    .filter(({ node }) => node.handle !== "frontpage")
    .map(({ node }) => ({
      handle: node.handle,
      title: cleanCollectionTitle(node.title),
      imageUrl: node.image?.url ?? node.products.edges[0]?.node.featuredImage?.url ?? "",
      href: `/collections/${node.handle}`,
      curated: Boolean(node.image?.url),
    }));
}

/** Tek bir koleksiyon ve içindeki ürünler. Bulunamazsa null döner. */
export async function storefrontGetCollectionByHandle(
  handle: string,
  first = 250,
): Promise<{ title: string; description: string; imageUrl?: string; products: Product[] } | null> {
  const client = createShopifyClient();
  const data = await client.request<{
    collection: {
      title: string;
      description: string | null;
      image: { url: string } | null;
      products: { edges: { node: Record<string, unknown> }[] };
    } | null;
  }>(
    `query($handle:String!,$first:Int!){
      collection(handle:$handle){
        title description
        image { url }
        products(first:$first){ edges { node { ${PRODUCT_FRAGMENT} } } }
      }
    }`,
    { handle, first },
  );

  if (!data.collection) return null;

  const products = data.collection.products.edges.map((e) => mapProduct(e.node));
  return {
    title: cleanCollectionTitle(data.collection.title),
    description: data.collection.description ?? "",
    imageUrl: data.collection.image?.url ?? products.find((p) => p.imageUrl)?.imageUrl,
    products,
  };
}

/** Koleksiyon indeksi satırı — sıra no, ad, ürün sayısı, görsel. */
export type CollectionIndexRow = {
  handle: string;
  title: string;
  imageUrl: string;
  href: string;
  /** Örneklenen ürün sayısı (HERO_SAMPLE'da tavanlanır) */
  count: number;
};

/**
 * Hover'a bağlı koleksiyon indeksi için veri.
 * Görseli olmayan koleksiyonlar listeye girmez — sağdaki panel boş kalmasın.
 */
export async function storefrontGetCollectionIndex(limit = 14): Promise<CollectionIndexRow[]> {
  const client = createShopifyClient();
  const data = await client.request<{
    collections: {
      edges: {
        node: {
          handle: string;
          title: string;
          image: { url: string } | null;
          products: { edges: { node: { featuredImage: { url: string } | null } }[] };
        };
      }[];
    };
  }>(
    `query($first:Int!,$sample:Int!){
      collections(first:$first){
        edges { node {
          handle title
          image { url }
          products(first: $sample) { edges { node { featuredImage { url } } } }
        } }
      }
    }`,
    { first: 60, sample: HERO_SAMPLE },
  );

  const satirlar = data.collections.edges
    .filter(({ node }) => node.handle !== "frontpage")
    .map(({ node }) => {
      const gorseller = node.products.edges
        .map((e) => e.node.featuredImage?.url)
        .filter((u): u is string => Boolean(u));
      return {
        handle: node.handle,
        title: cleanCollectionTitle(node.title),
        imageUrl: node.image?.url ?? gorseller[0] ?? "",
        href: `/collections/${node.handle}`,
        count: gorseller.length,
        curated: Boolean(node.image?.url),
      };
    })
    .filter((r) => r.imageUrl && r.count > 0);

  satirlar.sort(
    (a, b) =>
      Number(b.curated) - Number(a.curated) ||
      b.count - a.count ||
      a.title.localeCompare(b.title, "tr"),
  );

  return satirlar.slice(0, limit).map((r) => ({
    handle: r.handle,
    title: r.title,
    imageUrl: r.imageUrl,
    href: r.href,
    count: r.count,
  }));
}
