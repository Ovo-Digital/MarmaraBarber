import { createShopifyClient } from "@/lib/shopify-client";
import type { PlpSortOption } from "@/lib/plp-filters";
import type { Cart, Collection, Product, ProductFacet, ProductListingResult } from "@/types/commerce";

const PRODUCT_FRAGMENT = `
  id handle title description availableForSale
  featuredImage { url }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 10) {
    edges { node { id title availableForSale sku price { amount currencyCode } } }
  }
`;

function mapProduct(node: Record<string, unknown>): Product {
  const priceRange = node.priceRange as { minVariantPrice: { amount: string; currencyCode: string } };
  const variants = (node.variants as { edges: { node: Record<string, unknown> }[] })?.edges ?? [];
  return {
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    description: (node.description as string) ?? "",
    availableForSale: node.availableForSale as boolean,
    imageUrl: (node.featuredImage as { url?: string } | null)?.url,
    price: parseFloat(priceRange?.minVariantPrice?.amount ?? "0"),
    currencyCode: priceRange?.minVariantPrice?.currencyCode ?? "TRY",
    variants: variants.map(({ node: v }) => ({
      id: v.id as string,
      title: v.title as string,
      price: parseFloat((v.price as { amount: string })?.amount ?? "0"),
      availableForSale: v.availableForSale as boolean,
      sku: v.sku as string | undefined,
    })),
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
  sortKey: "CREATED_AT" | "PRICE" | "TITLE" = "CREATED_AT",
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
