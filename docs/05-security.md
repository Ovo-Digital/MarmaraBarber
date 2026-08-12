# Security

## Authentication

- **JWT Bearer** for protected endpoints (wishlists, account)
- Configured via `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_SIGNING_KEY`

## API Keys

- Internal service-to-service calls can use `API_KEY` header (extend middleware as needed)

## Shopify Webhook Validation

- HMAC-SHA256 with webhook secret
- Implemented in `ShopifyWebhookValidator`

## CORS

- Storefront origin policy: `http://localhost:3000` (configurable via `CORS_ORIGINS`)

## Rate Limiting

- AspNetCoreRateLimit configured in `appsettings.json` (120 req/min default)
- Extend with Redis-backed rate limiting for multi-instance deployments

## CSRF

- BFF API is consumed by Next.js server components and client fetch
- Mutations from browser should include anti-forgery tokens when using cookie auth
- Current starter uses stateless JWT + cart ID in localStorage

## Secret Management

| Environment | Recommendation |
|-------------|----------------|
| Local | `.env` file (gitignored) |
| Docker | Environment variables via compose |
| Production | Azure Key Vault / AWS Secrets Manager / HashiCorp Vault |

## Security Checklist

- [ ] Rotate Shopify tokens regularly
- [ ] Use HTTPS everywhere in production
- [ ] Enable SQL Server encryption
- [ ] Restrict Admin API token scopes to minimum required
- [ ] Monitor webhook logs for replay attempts
