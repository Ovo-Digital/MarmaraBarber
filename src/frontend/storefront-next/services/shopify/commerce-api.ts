import { getCategoryByHandle } from "@/lib/product-categories";
import {
  normalizeFacets,
  parseFilterInputsForApi,
  parseSortParam,
} from "@/lib/plp-filters";
import { BFF_URL } from "@/lib/shopify-client";
import type { ApiResponse, Cart, Collection, Product, ProductListingResult } from "@/types/commerce";
import * as api from "@/services/api/storefront-api";
import * as direct from "./storefront-direct";

/**
 * `direct`  → Vercel / lokal vitrin: doğrudan Shopify Storefront API (BFF gerekmez)
 * `bff`     → ASP.NET BFF üzerinden (entegrasyonlar, cache, wishlist)
 */
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "direct";

function useDirectShopify() {
  return DATA_SOURCE === "direct";
}

async function bffFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BFF_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BFF error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  if (!json.success || !json.data) throw new Error(json.error ?? "BFF request failed");
  return json.data;
}

export async function getProducts(first = 20): Promise<Product[]> {
  if (useDirectShopify()) return direct.storefrontGetProducts(first);
  return bffFetch<Product[]>(`/api/v1/products?first=${first}`);
}

export async function getProduct(handle: string): Promise<Product> {
  if (useDirectShopify()) {
    const p = await direct.storefrontGetProduct(handle);
    if (!p) throw new Error("Product not found");
    return p;
  }
  return bffFetch<Product>(`/api/v1/products/${handle}`);
}

export async function getCollections(): Promise<Collection[]> {
  if (useDirectShopify()) return direct.storefrontGetCollections();
  return bffFetch<Collection[]>(`/api/v1/collections`);
}

const DEFAULT_CATALOG_QUERY = "tag:trendyol-import";

export async function getCatalogListing(options: {
  handle?: string;
  filterInputs?: string[];
  sort?: string;
  first?: number;
}): Promise<ProductListingResult> {
  const { handle, filterInputs = [], sort: sortParam, first = 48 } = options;
  const sort = parseSortParam(sortParam);
  const category = handle ? getCategoryByHandle(handle) : undefined;

  if (handle && !category) {
    if (useDirectShopify()) {
      const { products } = await direct.storefrontSearch(`collection:${handle}`, first);
      return { products, filters: [], totalCount: products.length };
    }
    const products = await bffFetch<Product[]>(`/api/v1/collections/${handle}/products`);
    return { products, filters: [], totalCount: products.length };
  }

  const query = category?.shopifyQuery ?? DEFAULT_CATALOG_QUERY;
  const productFilters = parseFilterInputsForApi(filterInputs);

  if (useDirectShopify()) {
    if (sort === "new" && productFilters.length === 0) {
      const products = await direct.storefrontGetProductsByQuery(query, first, "CREATED_AT", true);
      const meta = await direct.storefrontSearchWithFilters({
        query,
        productFilters: [],
        first: 1,
      });
      return {
        products,
        filters: normalizeFacets(meta.filters),
        totalCount: products.length,
      };
    }

    const result = await direct.storefrontSearchWithFilters({
      query,
      productFilters,
      sort,
      first,
    });
    return {
      ...result,
      filters: normalizeFacets(result.filters),
    };
  }

  const search = await searchProducts(query, first);
  return {
    products: search.products,
    filters: [],
    totalCount: search.totalCount,
  };
}

export async function getCollectionProducts(
  handle: string,
  first = 48,
  listingOptions?: { filterInputs?: string[]; sort?: string },
): Promise<Product[]> {
  const result = await getCatalogListing({
    handle,
    first,
    filterInputs: listingOptions?.filterInputs,
    sort: listingOptions?.sort,
  });
  return result.products;
}

export async function searchProducts(query: string, first = 20): Promise<{ products: Product[]; totalCount: number }> {
  if (useDirectShopify()) return direct.storefrontSearch(query, first);
  return bffFetch(`/api/v1/products/search?q=${encodeURIComponent(query)}&first=${first}`);
}

export async function createCart(): Promise<Cart> {
  if (useDirectShopify()) return api.apiCreateCart();
  return bffFetch<Cart>(`/api/v1/cart`, { method: "POST" });
}

export async function getCart(cartId: string): Promise<Cart> {
  if (useDirectShopify()) return api.apiGetCart(cartId);
  return bffFetch<Cart>(`/api/v1/cart/${cartId}`);
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  if (useDirectShopify()) return api.apiAddToCart(cartId, variantId, quantity);
  return bffFetch<Cart>(`/api/v1/cart/${cartId}/lines`, {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
}

export async function removeFromCart(cartId: string, lineId: string): Promise<Cart> {
  if (useDirectShopify()) return api.apiRemoveFromCart(cartId, [lineId]);
  return bffFetch<Cart>(`/api/v1/cart/${cartId}/lines/${lineId}`, { method: "DELETE" });
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  if (useDirectShopify()) return api.apiUpdateCartLine(cartId, lineId, quantity);
  return bffFetch<Cart>(`/api/v1/cart/${cartId}/lines/${lineId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function attachCustomerToCart(cartId: string): Promise<Cart> {
  if (useDirectShopify()) return api.apiAttachCustomerToCart(cartId);
  return bffFetch<Cart>(`/api/v1/cart/${cartId}/buyer`, { method: "POST" });
}
