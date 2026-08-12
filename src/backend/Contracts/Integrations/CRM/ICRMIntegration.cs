namespace HeadlessCommerce.Contracts.Integrations.CRM;

public sealed class CrmCustomerExport
{
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string ShopifyCustomerId { get; set; } = string.Empty;
}

public sealed class CrmEvent
{
    public string EventName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Dictionary<string, object> Properties { get; set; } = new();
}

public interface ICustomerExporter
{
    Task<bool> ExportCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default);
}

public interface ICustomerSynchronizer
{
    Task<bool> SyncCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default);
}

public interface IEventPublisher
{
    Task<bool> PublishEventAsync(CrmEvent crmEvent, CancellationToken ct = default);
}
