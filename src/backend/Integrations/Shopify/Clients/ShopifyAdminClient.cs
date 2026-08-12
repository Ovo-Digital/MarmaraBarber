using System.Text.Json;
using HeadlessCommerce.Contracts.Integrations.Shopify;
using HeadlessCommerce.Contracts.Shopify;
using HeadlessCommerce.Integrations.Shopify.Configuration;
using HeadlessCommerce.Integrations.Shopify.GraphQL;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HeadlessCommerce.Integrations.Shopify.Clients;

public sealed class ShopifyAdminClient(
    HttpClient http,
    IOptions<ShopifySettings> settings,
    ILogger<ShopifyAdminClient> logger) : IShopifyAdminClient
{
    private readonly ShopifySettings _settings = settings.Value;

    public async Task<IReadOnlyList<ShopifyOrderDto>> GetOrdersAsync(
        int first = 50, string? after = null, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = AdminQueries.GetOrders,
            Variables = new { first, after }
        };
        var doc = await ExecuteAsync(request, ct);
        var edges = doc.RootElement.GetProperty("data").GetProperty("orders").GetProperty("edges");
        return edges.EnumerateArray().Select(e =>
        {
            var node = e.GetProperty("node");
            var money = node.GetProperty("totalPriceSet").GetProperty("shopMoney");
            return new ShopifyOrderDto
            {
                Id = node.GetProperty("id").GetString() ?? "",
                Name = node.GetProperty("name").GetString() ?? "",
                Email = node.GetProperty("email").GetString() ?? "",
                TotalPrice = decimal.Parse(money.GetProperty("amount").GetString() ?? "0"),
                FinancialStatus = node.GetProperty("displayFinancialStatus").GetString() ?? "",
                CreatedAt = node.GetProperty("createdAt").GetDateTime()
            };
        }).ToList();
    }

    public async Task<IReadOnlyList<ShopifyCustomerDto>> GetCustomersAsync(
        int first = 50, string? after = null, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = AdminQueries.GetCustomers,
            Variables = new { first, after }
        };
        var doc = await ExecuteAsync(request, ct);
        var edges = doc.RootElement.GetProperty("data").GetProperty("customers").GetProperty("edges");
        return edges.EnumerateArray().Select(e =>
        {
            var node = e.GetProperty("node");
            return new ShopifyCustomerDto
            {
                Id = node.GetProperty("id").GetString() ?? "",
                Email = node.GetProperty("email").GetString() ?? "",
                FirstName = node.TryGetProperty("firstName", out var fn) ? fn.GetString() : null,
                LastName = node.TryGetProperty("lastName", out var ln) ? ln.GetString() : null
            };
        }).ToList();
    }

    public async Task<IReadOnlyList<ShopifyProductDto>> GetProductsAsync(
        int first = 50, string? after = null, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = AdminQueries.GetProducts,
            Variables = new { first, after }
        };
        var doc = await ExecuteAsync(request, ct);
        var edges = doc.RootElement.GetProperty("data").GetProperty("products").GetProperty("edges");
        return edges.EnumerateArray().Select(e =>
        {
            var node = e.GetProperty("node");
            var variant = node.GetProperty("variants").GetProperty("edges").EnumerateArray().FirstOrDefault();
            decimal price = 0;
            if (variant.ValueKind != JsonValueKind.Undefined)
                price = decimal.Parse(variant.GetProperty("node").GetProperty("price").GetString() ?? "0");

            return new ShopifyProductDto
            {
                Id = node.GetProperty("id").GetString() ?? "",
                Handle = node.GetProperty("handle").GetString() ?? "",
                Title = node.GetProperty("title").GetString() ?? "",
                Description = node.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "",
                Price = price,
                ImageUrl = node.TryGetProperty("featuredMedia", out var fm) && fm.ValueKind != JsonValueKind.Null
                    ? fm.GetProperty("preview").GetProperty("image").GetProperty("url").GetString()
                    : null
            };
        }).ToList();
    }

    public async Task<bool> CreateMetafieldAsync(ShopifyMetafieldInput input, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = AdminQueries.CreateMetafield,
            Variables = new
            {
                metafields = new[]
                {
                    new
                    {
                        ownerId = input.OwnerId,
                        @namespace = input.Namespace,
                        key = input.Key,
                        value = input.Value,
                        type = input.Type
                    }
                }
            }
        };
        var doc = await ExecuteAsync(request, ct);
        var errors = doc.RootElement.GetProperty("data").GetProperty("metafieldsSet").GetProperty("userErrors");
        return errors.GetArrayLength() == 0;
    }

    public async Task<bool> UpdateInventoryAsync(ShopifyInventoryUpdate update, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = AdminQueries.UpdateInventory,
            Variables = new
            {
                input = new
                {
                    name = "available",
                    reason = "correction",
                    ignoreCompareQuantity = true,
                    quantities = new[]
                    {
                        new
                        {
                            inventoryItemId = update.InventoryItemId,
                            locationId = update.LocationId,
                            quantity = update.Available
                        }
                    }
                }
            }
        };
        var doc = await ExecuteAsync(request, ct);
        var errors = doc.RootElement.GetProperty("data").GetProperty("inventorySetQuantities").GetProperty("userErrors");
        return errors.GetArrayLength() == 0;
    }

    private async Task<JsonDocument> ExecuteAsync(GraphQlRequest gql, CancellationToken ct)
    {
        using var content = GraphQlSerializer.ToJsonContent(gql);
        using var response = await http.PostAsync(_settings.AdminGraphQlUrl, content, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Shopify Admin API error {Status}: {Body}", response.StatusCode, body);
            response.EnsureSuccessStatusCode();
        }

        var doc = JsonDocument.Parse(body);
        if (doc.RootElement.TryGetProperty("errors", out var errors))
        {
            logger.LogError("Shopify Admin GraphQL errors: {Errors}", errors.ToString());
            throw new InvalidOperationException($"Shopify Admin GraphQL error: {errors}");
        }

        return doc;
    }
}
