using HeadlessCommerce.Contracts.Webhooks;
using HeadlessCommerce.Workers.Sync;
using HeadlessCommerce.Workers.Webhooks;
using Microsoft.Extensions.DependencyInjection;

namespace HeadlessCommerce.Workers;

public static class DependencyInjection
{
    public static IServiceCollection AddWorkers(this IServiceCollection services)
    {
        services.AddHostedService<WebhookProcessingWorker>();
        services.AddHostedService<OrderSyncWorker>();
        services.AddHostedService<InventorySyncWorker>();
        services.AddHostedService<ProductSyncWorker>();
        services.AddHostedService<CustomerSyncWorker>();
        services.AddHostedService<MarketingWorker>();

        services.AddScoped<IWebhookHandler, OrderCreatedWebhookHandler>();
        services.AddScoped<IWebhookHandler, OrdersPaidWebhookHandler>();
        services.AddScoped<IWebhookHandler, OrdersUpdatedWebhookHandler>();
        services.AddScoped<IWebhookHandler, ProductCreateWebhookHandler>();
        services.AddScoped<IWebhookHandler, ProductUpdateWebhookHandler>();
        services.AddScoped<IWebhookHandler, CustomerCreateWebhookHandler>();
        services.AddScoped<IWebhookHandler, RefundCreateWebhookHandler>();

        return services;
    }
}
