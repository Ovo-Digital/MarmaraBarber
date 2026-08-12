namespace HeadlessCommerce.Domain.Entities;

public sealed class IntegrationLog : Common.AuditableEntity<Guid>
{
    private IntegrationLog() { }

    public IntegrationLog(Guid id, string provider, string operation, string? requestPayload, string storeId)
        : base(id)
    {
        Provider = provider;
        Operation = operation;
        RequestPayload = requestPayload;
        StoreId = storeId;
        IsSuccess = false;
    }

    public string Provider { get; private set; } = string.Empty;
    public string Operation { get; private set; } = string.Empty;
    public string? RequestPayload { get; private set; }
    public string? ResponsePayload { get; private set; }
    public bool IsSuccess { get; private set; }
    public string? ErrorMessage { get; private set; }
    public int DurationMs { get; private set; }
    public string StoreId { get; private set; } = string.Empty;

    public void Complete(bool success, string? response, string? error, int durationMs)
    {
        IsSuccess = success;
        ResponsePayload = response;
        ErrorMessage = error;
        DurationMs = durationMs;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
