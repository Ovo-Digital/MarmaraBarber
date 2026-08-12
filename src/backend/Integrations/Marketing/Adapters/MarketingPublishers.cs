using HeadlessCommerce.Contracts.Integrations.Marketing;
using Microsoft.Extensions.Logging;

namespace HeadlessCommerce.Integrations.Marketing.Adapters;

public sealed class KlaviyoPublisher(ILogger<KlaviyoPublisher> logger) : IMarketingEventPublisher
{
    public string ProviderName => "Klaviyo";

    public Task<bool> PublishAsync(MarketingEvent marketingEvent, CancellationToken ct = default)
    {
        logger.LogInformation("Klaviyo: {EventType} for {Email} — TODO: wire Klaviyo Track API",
            marketingEvent.EventType, marketingEvent.CustomerEmail);
        return Task.FromResult(true);
    }
}

public sealed class InsiderMarketingPublisher(ILogger<InsiderMarketingPublisher> logger) : IMarketingEventPublisher
{
    public string ProviderName => "Insider";

    public Task<bool> PublishAsync(MarketingEvent marketingEvent, CancellationToken ct = default)
    {
        logger.LogInformation("Insider: {EventType} — TODO", marketingEvent.EventType);
        return Task.FromResult(true);
    }
}

public sealed class Ga4Publisher(ILogger<Ga4Publisher> logger) : IMarketingEventPublisher
{
    public string ProviderName => "GA4";

    public Task<bool> PublishAsync(MarketingEvent marketingEvent, CancellationToken ct = default)
    {
        logger.LogInformation("GA4: {EventType} value={Value} — TODO: Measurement Protocol",
            marketingEvent.EventType, marketingEvent.Value);
        return Task.FromResult(true);
    }
}

public sealed class MetaPixelPublisher(ILogger<MetaPixelPublisher> logger) : IMarketingEventPublisher
{
    public string ProviderName => "MetaPixel";

    public Task<bool> PublishAsync(MarketingEvent marketingEvent, CancellationToken ct = default)
    {
        logger.LogInformation("Meta Pixel: {EventType} — TODO: Conversions API",
            marketingEvent.EventType);
        return Task.FromResult(true);
    }
}
