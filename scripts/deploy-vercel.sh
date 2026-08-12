#!/usr/bin/env bash
# Vercel'e vitrin deploy — önce: npm i -g vercel && vercel login
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/src/frontend/storefront-next"

echo "==> Vercel deploy (storefront-next)"
echo "Gerekli env: SHOPIFY_STORE_URL, SHOPIFY_STOREFRONT_TOKEN, NEXT_PUBLIC_DATA_SOURCE=direct"
echo ""
echo "Vercel Dashboard → Settings → General → Root Directory:"
echo "  src/frontend/storefront-next  (önerilen)"
echo "Alternatif: repo kökündeki vercel.json (monorepo) otomatik yönlendirir."
vercel --prod "$@"
