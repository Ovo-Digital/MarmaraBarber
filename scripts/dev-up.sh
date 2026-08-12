#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$ROOT/.env" ]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "Created .env from .env.example — fill in Shopify tokens before running."
fi

docker compose -f "$ROOT/docker/docker-compose.yml" --env-file "$ROOT/.env" up --build "$@"
