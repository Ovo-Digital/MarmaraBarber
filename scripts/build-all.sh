#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building backend..."
dotnet build "$ROOT/src/backend/HeadlessCommerce.sln"

echo "==> Building frontend..."
cd "$ROOT/src/frontend/storefront-next"
npm install
npm run build

echo "==> Done."
