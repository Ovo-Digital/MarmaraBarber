using System.Net.Http.Json;
using System.Text.Json;
using HeadlessCommerce.Contracts.Integrations.Shopify;
using HeadlessCommerce.Contracts.Shopify;
using HeadlessCommerce.Integrations.Shopify.Configuration;
using HeadlessCommerce.Integrations.Shopify.GraphQL;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HeadlessCommerce.Integrations.Shopify.Clients;

public sealed class ShopifyStorefrontClient(
    HttpClient http,
    IOptions<ShopifySettings> settings,
    ILogger<ShopifyStorefrontClient> logger) : IShopifyStorefrontClient
{
    private readonly ShopifySettings _settings = settings.Value;

    public async Task<IReadOnlyList<ShopifyProductDto>> GetProductsAsync(
        int first = 20, string? after = null, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.GetProducts,
            Variables = new { first, after }
        };
        var doc = await ExecuteAsync(request, ct);
        return MapProducts(doc, "data.products.edges");
    }

    public async Task<ShopifyProductDto?> GetProductAsync(string handle, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.GetProductByHandle,
            Variables = new { handle }
        };
        var doc = await ExecuteAsync(request, ct);
        var node = doc.RootElement.GetProperty("data").GetProperty("product");
        if (node.ValueKind == JsonValueKind.Null)
            return null;
        return MapProduct(node);
    }

    public async Task<IReadOnlyList<ShopifyCollectionDto>> GetCollectionsAsync(
        int first = 20, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.GetCollections,
            Variables = new { first }
        };
        var doc = await ExecuteAsync(request, ct);
        var edges = doc.RootElement.GetProperty("data").GetProperty("collections").GetProperty("edges");
        return edges.EnumerateArray().Select(e => new ShopifyCollectionDto
        {
            Id = e.GetProperty("node").GetProperty("id").GetString() ?? "",
            Handle = e.GetProperty("node").GetProperty("handle").GetString() ?? "",
            Title = e.GetProperty("node").GetProperty("title").GetString() ?? "",
            ImageUrl = e.GetProperty("node").TryGetProperty("image", out var img) && img.ValueKind != JsonValueKind.Null
                ? img.GetProperty("url").GetString()
                : null
        }).ToList();
    }

    public async Task<ShopifySearchResultDto> SearchAsync(string query, int first = 20, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.SearchProducts,
            Variables = new { query, first }
        };
        var doc = await ExecuteAsync(request, ct);
        var edges = doc.RootElement.GetProperty("data").GetProperty("search").GetProperty("edges");
        var products = edges.EnumerateArray()
            .Where(e => e.GetProperty("node").TryGetProperty("handle", out _))
            .Select(e => MapProduct(e.GetProperty("node")))
            .ToList();
        return new ShopifySearchResultDto { Products = products, TotalCount = products.Count };
    }

    public async Task<ShopifyCartDto> CreateCartAsync(CancellationToken ct = default)
    {
        var request = new GraphQlRequest { Query = StorefrontQueries.CreateCart };
        var doc = await ExecuteAsync(request, ct);
        var cart = doc.RootElement.GetProperty("data").GetProperty("cartCreate").GetProperty("cart");
        return MapCart(cart);
    }

    public async Task<ShopifyCartDto> AddCartLinesAsync(
        string cartId, IReadOnlyList<(string VariantId, int Quantity)> lines, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.CartLinesAdd,
            Variables = new
            {
                cartId,
                lines = lines.Select(l => new { merchandiseId = l.VariantId, quantity = l.Quantity })
            }
        };
        var doc = await ExecuteAsync(request, ct);
        var cart = doc.RootElement.GetProperty("data").GetProperty("cartLinesAdd").GetProperty("cart");
        return MapCart(cart);
    }

    public async Task<ShopifyCartDto> RemoveCartLinesAsync(
        string cartId, IReadOnlyList<string> lineIds, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.CartLinesRemove,
            Variables = new { cartId, lineIds }
        };
        var doc = await ExecuteAsync(request, ct);
        var cart = doc.RootElement.GetProperty("data").GetProperty("cartLinesRemove").GetProperty("cart");
        return MapCart(cart);
    }

    public async Task<ShopifyCartDto?> GetCartAsync(string cartId, CancellationToken ct = default)
    {
        var request = new GraphQlRequest
        {
            Query = StorefrontQueries.GetCart,
            Variables = new { cartId }
        };
        var doc = await ExecuteAsync(request, ct);
        var cart = doc.RootElement.GetProperty("data").GetProperty("cart");
        if (cart.ValueKind == JsonValueKind.Null)
            return null;
        return MapCart(cart);
    }

    private async Task<JsonDocument> ExecuteAsync(GraphQlRequest gql, CancellationToken ct)
    {
        using var content = GraphQlSerializer.ToJsonContent(gql);
        using var response = await http.PostAsync(_settings.StorefrontGraphQlUrl, content, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Shopify Storefront API error {Status}: {Body}", response.StatusCode, body);
            response.EnsureSuccessStatusCode();
        }

        var doc = JsonDocument.Parse(body);
        if (doc.RootElement.TryGetProperty("errors", out var errors))
        {
            logger.LogError("Shopify GraphQL errors: {Errors}", errors.ToString());
            throw new InvalidOperationException($"Shopify GraphQL error: {errors}");
        }

        return doc;
    }

    private static IReadOnlyList<ShopifyProductDto> MapProducts(JsonDocument doc, string path)
    {
        var edges = Navigate(doc.RootElement, path);
        return edges.EnumerateArray().Select(e => MapProduct(e.GetProperty("node"))).ToList();
    }

    private static ShopifyProductDto MapProduct(JsonElement node)
    {
        var price = node.GetProperty("priceRange").GetProperty("minVariantPrice");
        var variants = node.TryGetProperty("variants", out var v)
            ? v.GetProperty("edges").EnumerateArray().Select(e =>
            {
                var n = e.GetProperty("node");
                var p = n.GetProperty("price");
                return new ShopifyVariantDto
                {
                    Id = n.GetProperty("id").GetString() ?? "",
                    Title = n.GetProperty("title").GetString() ?? "",
                    AvailableForSale = n.GetProperty("availableForSale").GetBoolean(),
                    Sku = n.TryGetProperty("sku", out var sku) ? sku.GetString() : null,
                    Price = decimal.Parse(p.GetProperty("amount").GetString() ?? "0")
                };
            }).ToList()
            : [];

        return new ShopifyProductDto
        {
            Id = node.GetProperty("id").GetString() ?? "",
            Handle = node.GetProperty("handle").GetString() ?? "",
            Title = node.GetProperty("title").GetString() ?? "",
            Description = node.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "",
            AvailableForSale = node.GetProperty("availableForSale").GetBoolean(),
            ImageUrl = node.TryGetProperty("featuredImage", out var fi) && fi.ValueKind != JsonValueKind.Null
                ? fi.GetProperty("url").GetString()
                : null,
            Price = decimal.Parse(price.GetProperty("amount").GetString() ?? "0"),
            CurrencyCode = price.GetProperty("currencyCode").GetString() ?? "TRY",
            Variants = variants
        };
    }

    private static ShopifyCartDto MapCart(JsonElement cart)
    {
        var total = cart.GetProperty("cost").GetProperty("totalAmount");
        var lines = cart.GetProperty("lines").GetProperty("edges").EnumerateArray().Select(e =>
        {
            var node = e.GetProperty("node");
            var merch = node.GetProperty("merchandise");
            var price = merch.GetProperty("price");
            return new ShopifyCartLineDto
            {
                Id = node.GetProperty("id").GetString() ?? "",
                MerchandiseId = merch.GetProperty("id").GetString() ?? "",
                Quantity = node.GetProperty("quantity").GetInt32(),
                Title = merch.GetProperty("product").GetProperty("title").GetString() ?? "",
                Price = decimal.Parse(price.GetProperty("amount").GetString() ?? "0")
            };
        }).ToList();

        return new ShopifyCartDto
        {
            Id = cart.GetProperty("id").GetString() ?? "",
            CheckoutUrl = cart.GetProperty("checkoutUrl").GetString() ?? "",
            TotalAmount = decimal.Parse(total.GetProperty("amount").GetString() ?? "0"),
            CurrencyCode = total.GetProperty("currencyCode").GetString() ?? "TRY",
            Lines = lines
        };
    }

    private static JsonElement Navigate(JsonElement root, string path)
    {
        var current = root;
        foreach (var segment in path.Split('.'))
            current = current.GetProperty(segment);
        return current;
    }
}
