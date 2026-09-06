import { GraphQLClient } from "graphql-request";

const storeUrl = process.env.SHOPIFY_STORE_URL ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL ?? "";
const privateToken = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";
const publicToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";
const apiVersion =
  process.env.SHOPIFY_API_VERSION ?? process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2026-07";

/**
 * Storefront API iki tür belirteç kabul eder ve her biri FARKLI bir başlık ister:
 *   genel (public)  → X-Shopify-Storefront-Access-Token
 *   özel  (private) → Shopify-Storefront-Private-Token
 * Yanlış başlıkla gönderilen belirteç 401 döner.
 */
export function storefrontAuthHeaders(): Record<string, string> {
  return privateToken
    ? { "Shopify-Storefront-Private-Token": privateToken }
    : { "X-Shopify-Storefront-Access-Token": publicToken };
}

export function createShopifyClient() {
  const token = privateToken || publicToken;
  if (!storeUrl || !token) {
    throw new Error(
      "Shopify yapılandırması eksik. SHOPIFY_STORE_URL ve SHOPIFY_STOREFRONT_TOKEN ayarlayın."
    );
  }
  const endpoint = `https://${storeUrl.replace(/^https?:\/\//, "")}/api/${apiVersion}/graphql.json`;
  return new GraphQLClient(endpoint, {
    headers: {
      ...storefrontAuthHeaders(),
      "Content-Type": "application/json",
    },
  });
}

export const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:8080";
