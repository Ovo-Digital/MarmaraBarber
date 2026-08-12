namespace HeadlessCommerce.Domain.Entities;

public enum SyncJobStatus { Pending, Running, Completed, Failed, DeadLetter }
public enum SyncJobType { Order, Inventory, Product, Customer, Marketing }

public sealed class SyncJob : Common.AuditableEntity<Guid>
{
    private SyncJob() { }

    public SyncJob(Guid id, SyncJobType jobType, string payload, string storeId) : base(id)
    {
        JobType = jobType;
        Payload = payload;
        StoreId = storeId;
        Status = SyncJobStatus.Pending;
        RetryCount = 0;
    }

    public SyncJobType JobType { get; private set; }
    public SyncJobStatus Status { get; private set; }
    public string Payload { get; private set; } = string.Empty;
    public string StoreId { get; private set; } = string.Empty;
    public int RetryCount { get; private set; }
    public int MaxRetries { get; private set; } = 5;
    public string? LastError { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public void MarkRunning()
    {
        Status = SyncJobStatus.Running;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkCompleted()
    {
        Status = SyncJobStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkFailed(string error)
    {
        RetryCount++;
        LastError = error;
        Status = RetryCount >= MaxRetries ? SyncJobStatus.DeadLetter : SyncJobStatus.Failed;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
