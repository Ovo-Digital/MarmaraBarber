import { GraphQLClient } from "graphql-request";

const storeUrl = process.env.SHOPIFY_STORE_URL ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL ?? "";
const token =
  process.env.SHOPIFY_STOREFRONT_TOKEN ?? process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";
const apiVersion =
  process.env.SHOPIFY_API_VERSION ?? process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

export function createShopifyClient() {
  if (!storeUrl || !token) {
    throw new Error(
      "Shopify yapılandırması eksik. SHOPIFY_STORE_URL ve SHOPIFY_STOREFRONT_TOKEN ayarlayın."
    );
  }
  const endpoint = `https://${storeUrl.replace(/^https?:\/\//, "")}/api/${apiVersion}/graphql.json`;
  return new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Storefront-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}

export const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:8080";
