namespace HeadlessCommerce.Domain.Entities;

public sealed class EventLog : Common.AuditableEntity<Guid>
{
    private EventLog() { }

    public EventLog(Guid id, string eventType, string payload, string storeId) : base(id)
    {
        EventType = eventType;
        Payload = payload;
        StoreId = storeId;
        IsPublished = false;
    }

    public string EventType { get; private set; } = string.Empty;
    public string Payload { get; private set; } = string.Empty;
    public bool IsPublished { get; private set; }
    public DateTime? PublishedAt { get; private set; }
    public string StoreId { get; private set; } = string.Empty;

    public void MarkPublished()
    {
        IsPublished = true;
        PublishedAt = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
