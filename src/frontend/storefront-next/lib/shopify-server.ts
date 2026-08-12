import { GraphQLClient } from "graphql-request";

/** Server-only Shopify Storefront client (API routes & Server Components). */
export function createShopifyServerClient() {
  const storeUrl = process.env.SHOPIFY_STORE_URL ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL ?? "";
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

  if (!storeUrl || !token) {
    throw new Error("Shopify server config missing: SHOPIFY_STORE_URL / SHOPIFY_STOREFRONT_TOKEN");
  }

  const endpoint = `https://${storeUrl.replace(/^https?:\/\//, "")}/api/${apiVersion}/graphql.json`;
  return new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Storefront-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}

export const CUSTOMER_TOKEN_COOKIE = "ovo_customer_token";
