using HeadlessCommerce.Contracts.Integrations.Shopify;
using HeadlessCommerce.Integrations.Shopify.Clients;
using HeadlessCommerce.Integrations.Shopify.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;

namespace HeadlessCommerce.Integrations.Shopify;

public static class DependencyInjection
{
    public static IServiceCollection AddShopifyIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ShopifySettings>(configuration.GetSection(ShopifySettings.SectionName));
        services.Configure<ShopifySettings>(opts =>
        {
            opts.StoreUrl = configuration["SHOPIFY_STORE_URL"] ?? opts.StoreUrl;
            opts.StorefrontAccessToken = configuration["SHOPIFY_STOREFRONT_TOKEN"] ?? opts.StorefrontAccessToken;
            opts.AdminAccessToken = configuration["SHOPIFY_ADMIN_TOKEN"] ?? opts.AdminAccessToken;
            opts.ApiVersion = configuration["SHOPIFY_API_VERSION"] ?? opts.ApiVersion;
            opts.WebhookSecret = configuration["SHOPIFY_WEBHOOK_SECRET"] ?? opts.WebhookSecret;
        });

        var retryPolicy = HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)));

        services.AddHttpClient<IShopifyStorefrontClient, ShopifyStorefrontClient>((sp, client) =>
        {
            var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ShopifySettings>>().Value;
            client.BaseAddress = new Uri($"https://{settings.StoreUrl.Replace("https://", "").TrimEnd('/')}/");
            client.DefaultRequestHeaders.Add("X-Shopify-Storefront-Access-Token", settings.StorefrontAccessToken);
        }).AddPolicyHandler(retryPolicy);

        services.AddHttpClient<IShopifyAdminClient, ShopifyAdminClient>((sp, client) =>
        {
            var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ShopifySettings>>().Value;
            client.BaseAddress = new Uri($"https://{settings.StoreUrl.Replace("https://", "").TrimEnd('/')}/");
            client.DefaultRequestHeaders.Add("X-Shopify-Access-Token", settings.AdminAccessToken);
        }).AddPolicyHandler(retryPolicy);

        return services;
    }
}
