namespace HeadlessCommerce.Domain.Entities;

public enum WebhookProcessingStatus { Received, Queued, Processing, Processed, Failed, DeadLetter }

public sealed class WebhookLog : Common.AuditableEntity<Guid>
{
    private WebhookLog() { }

    public WebhookLog(Guid id, string topic, string shopDomain, string payloadHash, string storeId)
        : base(id)
    {
        Topic = topic;
        ShopDomain = shopDomain;
        PayloadHash = payloadHash;
        StoreId = storeId;
        Status = WebhookProcessingStatus.Received;
    }

    public string Topic { get; private set; } = string.Empty;
    public string ShopDomain { get; private set; } = string.Empty;
    public string PayloadHash { get; private set; } = string.Empty;
    public WebhookProcessingStatus Status { get; private set; }
    public int RetryCount { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string StoreId { get; private set; } = string.Empty;

    public void MarkQueued() => Status = WebhookProcessingStatus.Queued;
    public void MarkProcessing() => Status = WebhookProcessingStatus.Processing;

    public void MarkProcessed()
    {
        Status = WebhookProcessingStatus.Processed;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkFailed(string error)
    {
        RetryCount++;
        ErrorMessage = error;
        Status = RetryCount >= 5 ? WebhookProcessingStatus.DeadLetter : WebhookProcessingStatus.Failed;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
