# Shopify Integration

## APIs Used

| API | Client | Purpose |
|-----|--------|---------|
| Storefront GraphQL | `ShopifyStorefrontClient` | Products, collections, cart, search |
| Admin GraphQL | `ShopifyAdminClient` | Orders, customers, inventory, metafields |

## Configuration

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=
SHOPIFY_ADMIN_TOKEN=
SHOPIFY_API_VERSION=2025-01
SHOPIFY_WEBHOOK_SECRET=
```

## Storefront Client Methods

- `GetProductsAsync()` — paginated product listing
- `GetProductAsync(handle)` — single product by handle
- `GetCollectionsAsync()` — collection list
- `SearchAsync(query)` — storefront search
- `CreateCartAsync()` / `AddCartLinesAsync()` / `RemoveCartLinesAsync()`

## Admin Client Methods

- `GetOrdersAsync()` / `GetCustomersAsync()` / `GetProductsAsync()`
- `CreateMetafieldAsync()` — custom data on Shopify resources
- `UpdateInventoryAsync()` — inventory level updates

## Resilience

- **Polly** retry policy on HTTP clients (3 retries, exponential backoff)
- GraphQL errors logged and surfaced as upstream failures
- Sample queries in `Integrations/Shopify/GraphQL/GraphQlRequestBuilder.cs`

## Authentication

| API | Header |
|-----|--------|
| Storefront | `X-Shopify-Storefront-Access-Token` |
| Admin | `X-Shopify-Access-Token` |

## Checkout

Cart operations use Shopify Storefront Cart API. Checkout redirect uses `checkoutUrl` from cart response — hosted Shopify Checkout handles payment.
