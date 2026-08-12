namespace HeadlessCommerce.Contracts.Integrations.Marketing;

public enum MarketingEventType
{
    ProductViewed,
    AddToCart,
    CheckoutStarted,
    PurchaseCompleted
}

public sealed class MarketingEvent
{
    public MarketingEventType EventType { get; set; }
    public string? CustomerEmail { get; set; }
    public string? ProductId { get; set; }
    public string? OrderId { get; set; }
    public decimal? Value { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
    public Dictionary<string, object> Properties { get; set; } = new();
}

public interface IMarketingEventPublisher
{
    string ProviderName { get; }
    Task<bool> PublishAsync(MarketingEvent marketingEvent, CancellationToken ct = default);
}

public interface IMarketingEventDispatcher
{
    Task DispatchAsync(MarketingEvent marketingEvent, CancellationToken ct = default);
}
