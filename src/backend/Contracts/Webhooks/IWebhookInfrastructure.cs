namespace HeadlessCommerce.Contracts.Webhooks;

public sealed class WebhookEnvelope
{
    public string Topic { get; set; } = string.Empty;
    public string ShopDomain { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public string HmacHeader { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
}

public interface IWebhookValidator
{
    bool ValidateHmac(string payload, string hmacHeader, string secret);
}

public interface IWebhookEventDispatcher
{
    Task DispatchAsync(WebhookEnvelope envelope, CancellationToken ct = default);
}

public interface IWebhookQueue
{
    ValueTask EnqueueAsync(WebhookEnvelope envelope, CancellationToken ct = default);
    ValueTask<WebhookEnvelope?> DequeueAsync(CancellationToken ct = default);
}

public interface IWebhookHandler
{
    string Topic { get; }
    Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default);
}
