using HeadlessCommerce.Contracts.Caching;
using HeadlessCommerce.Contracts.Webhooks;
using HeadlessCommerce.Infrastructure.Caching;
using HeadlessCommerce.Infrastructure.Webhooks;
using HeadlessCommerce.Integrations.CRM;
using HeadlessCommerce.Integrations.ERP;
using HeadlessCommerce.Integrations.Marketing;
using HeadlessCommerce.Integrations.Shopify;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HeadlessCommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddShopifyIntegration(configuration);
        services.AddErpIntegration(configuration);
        services.AddCrmIntegration(configuration);
        services.AddMarketingIntegration(configuration);

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis")
                ?? configuration["REDIS_CONNECTION"]
                ?? "localhost:6379";
        });
        services.AddSingleton<ICacheService, RedisCacheService>();

        services.AddSingleton<IWebhookValidator, ShopifyWebhookValidator>();
        services.AddSingleton<IWebhookQueue, InMemoryWebhookQueue>();
        services.AddScoped<IWebhookEventDispatcher, WebhookEventDispatcher>();

        return services;
    }
}
