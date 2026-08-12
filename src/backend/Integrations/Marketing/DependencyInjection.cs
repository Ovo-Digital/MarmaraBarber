using HeadlessCommerce.Contracts.Integrations.Marketing;
using HeadlessCommerce.Integrations.Marketing.Adapters;
using HeadlessCommerce.Integrations.Marketing.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HeadlessCommerce.Integrations.Marketing;

public static class DependencyInjection
{
    public static IServiceCollection AddMarketingIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MarketingSettings>(opts =>
        {
            opts.Provider = configuration["MARKETING_PROVIDER"] ?? "Klaviyo";
            opts.ApiKey = configuration["MARKETING_API_KEY"] ?? "";
        });

        services.AddScoped<IMarketingEventDispatcher, MarketingEventDispatcher>();
        services.AddScoped<IMarketingEventPublisher, KlaviyoPublisher>();
        services.AddScoped<IMarketingEventPublisher, InsiderMarketingPublisher>();
        services.AddScoped<IMarketingEventPublisher, Ga4Publisher>();
        services.AddScoped<IMarketingEventPublisher, MetaPixelPublisher>();

        return services;
    }
}

public sealed class MarketingEventDispatcher(
    IEnumerable<IMarketingEventPublisher> publishers,
    ILogger<MarketingEventDispatcher> logger) : IMarketingEventDispatcher
{
    public async Task DispatchAsync(MarketingEvent marketingEvent, CancellationToken ct = default)
    {
        foreach (var publisher in publishers)
        {
            try
            {
                await publisher.PublishAsync(marketingEvent, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Marketing publisher {Provider} failed for {Event}",
                    publisher.ProviderName, marketingEvent.EventType);
            }
        }
    }
}
