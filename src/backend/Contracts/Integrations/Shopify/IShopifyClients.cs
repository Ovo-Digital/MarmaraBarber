using HeadlessCommerce.Contracts.Shopify;

namespace HeadlessCommerce.Contracts.Integrations.Shopify;

public interface IShopifyStorefrontClient
{
    Task<IReadOnlyList<ShopifyProductDto>> GetProductsAsync(int first = 20, string? after = null, CancellationToken ct = default);
    Task<ShopifyProductDto?> GetProductAsync(string handle, CancellationToken ct = default);
    Task<IReadOnlyList<ShopifyCollectionDto>> GetCollectionsAsync(int first = 20, CancellationToken ct = default);
    Task<ShopifySearchResultDto> SearchAsync(string query, int first = 20, CancellationToken ct = default);
    Task<ShopifyCartDto> CreateCartAsync(CancellationToken ct = default);
    Task<ShopifyCartDto> AddCartLinesAsync(string cartId, IReadOnlyList<(string VariantId, int Quantity)> lines, CancellationToken ct = default);
    Task<ShopifyCartDto> RemoveCartLinesAsync(string cartId, IReadOnlyList<string> lineIds, CancellationToken ct = default);
    Task<ShopifyCartDto?> GetCartAsync(string cartId, CancellationToken ct = default);
}

public interface IShopifyAdminClient
{
    Task<IReadOnlyList<ShopifyOrderDto>> GetOrdersAsync(int first = 50, string? after = null, CancellationToken ct = default);
    Task<IReadOnlyList<ShopifyCustomerDto>> GetCustomersAsync(int first = 50, string? after = null, CancellationToken ct = default);
    Task<IReadOnlyList<ShopifyProductDto>> GetProductsAsync(int first = 50, string? after = null, CancellationToken ct = default);
    Task<bool> CreateMetafieldAsync(ShopifyMetafieldInput input, CancellationToken ct = default);
    Task<bool> UpdateInventoryAsync(ShopifyInventoryUpdate update, CancellationToken ct = default);
}
