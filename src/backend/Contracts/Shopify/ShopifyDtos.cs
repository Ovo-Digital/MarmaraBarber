namespace HeadlessCommerce.Contracts.Shopify;

public sealed class ShopifyProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Handle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
    public bool AvailableForSale { get; set; }
    public IReadOnlyList<ShopifyVariantDto> Variants { get; set; } = [];
}

public sealed class ShopifyVariantDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool AvailableForSale { get; set; }
    public string? Sku { get; set; }
}

public sealed class ShopifyCollectionDto
{
    public string Id { get; set; } = string.Empty;
    public string Handle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public sealed class ShopifyCartDto
{
    public string Id { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
    public IReadOnlyList<ShopifyCartLineDto> Lines { get; set; } = [];
    public decimal TotalAmount { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
}

public sealed class ShopifyCartLineDto
{
    public string Id { get; set; } = string.Empty;
    public string MerchandiseId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public sealed class ShopifyOrderDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string FinancialStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public sealed class ShopifyCustomerDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public sealed class ShopifySearchResultDto
{
    public IReadOnlyList<ShopifyProductDto> Products { get; set; } = [];
    public int TotalCount { get; set; }
}

public sealed class ShopifyMetafieldInput
{
    public string OwnerId { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = "single_line_text_field";
}

public sealed class ShopifyInventoryUpdate
{
    public string InventoryItemId { get; set; } = string.Empty;
    public string LocationId { get; set; } = string.Empty;
    public int Available { get; set; }
}
