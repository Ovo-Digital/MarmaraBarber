namespace HeadlessCommerce.Integrations.Shopify.Configuration;

public sealed class ShopifySettings
{
    public const string SectionName = "Shopify";

    public string StoreUrl { get; set; } = string.Empty;
    public string StorefrontAccessToken { get; set; } = string.Empty;
    public string AdminAccessToken { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = "2025-01";
    public string WebhookSecret { get; set; } = string.Empty;

    public string StorefrontGraphQlUrl =>
        $"https://{NormalizeStoreUrl(StoreUrl)}/api/{ApiVersion}/graphql.json";

    public string AdminGraphQlUrl =>
        $"https://{NormalizeStoreUrl(StoreUrl)}/admin/api/{ApiVersion}/graphql.json";

    private static string NormalizeStoreUrl(string url)
        => url.Replace("https://", "").Replace("http://", "").TrimEnd('/');
}
