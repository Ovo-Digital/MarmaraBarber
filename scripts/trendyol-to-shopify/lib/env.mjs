import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");

const envCandidates = [
  resolve(repoRoot, ".env"),
  resolve(repoRoot, ".env.local"),
  resolve(repoRoot, "src/frontend/storefront-next/.env.local"),
];

for (const path of envCandidates) {
  if (existsSync(path)) {
    config({ path, override: false });
  }
}

export function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} tanımlı değil. .env veya storefront-next/.env.local dosyasına ekleyin.`,
    );
  }
  return value;
}

export function getShopifyAdminConfig() {
  const storeUrl = requireEnv("SHOPIFY_STORE_URL");
  const token = requireEnv("SHOPIFY_ADMIN_TOKEN");
  const host = storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION?.trim() || "2025-01";
  return {
    endpoint: `https://${host}/admin/api/${apiVersion}/graphql.json`,
    token,
    storeUrl: `https://${host}`,
  };
}
