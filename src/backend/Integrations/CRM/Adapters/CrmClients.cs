using HeadlessCommerce.Contracts.Integrations.CRM;
using HeadlessCommerce.Integrations.CRM.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HeadlessCommerce.Integrations.CRM.Adapters;

public sealed class HubspotCrmClient(
    IOptions<CrmSettings> settings,
    ILogger<HubspotCrmClient> logger) : ICustomerExporter, ICustomerSynchronizer, IEventPublisher
{
    public Task<bool> ExportCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default)
    {
        logger.LogInformation("Hubspot: Export customer {Email} — TODO at {BaseUrl}", customer.Email, settings.Value.BaseUrl);
        return Task.FromResult(true);
    }

    public Task<bool> SyncCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default)
        => ExportCustomerAsync(customer, ct);

    public Task<bool> PublishEventAsync(CrmEvent crmEvent, CancellationToken ct = default)
    {
        logger.LogInformation("Hubspot: Publish event {Event}", crmEvent.EventName);
        return Task.FromResult(true);
    }
}

public sealed class SalesforceCrmClient(
    IOptions<CrmSettings> settings,
    ILogger<SalesforceCrmClient> logger) : ICustomerExporter, ICustomerSynchronizer, IEventPublisher
{
    public Task<bool> ExportCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default)
    {
        logger.LogInformation("Salesforce: Export customer {Email} — TODO", customer.Email);
        return Task.FromResult(true);
    }

    public Task<bool> SyncCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default)
        => ExportCustomerAsync(customer, ct);

    public Task<bool> PublishEventAsync(CrmEvent crmEvent, CancellationToken ct = default)
    {
        logger.LogInformation("Salesforce: Publish event {Event}", crmEvent.EventName);
        return Task.FromResult(true);
    }
}

public sealed class InsiderCrmClient(
    IOptions<CrmSettings> settings,
    ILogger<InsiderCrmClient> logger) : ICustomerExporter, ICustomerSynchronizer, IEventPublisher
{
    public Task<bool> ExportCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default)
    {
        logger.LogInformation("Insider CRM: Export customer {Email} — TODO", customer.Email);
        return Task.FromResult(true);
    }

    public Task<bool> SyncCustomerAsync(CrmCustomerExport customer, CancellationToken ct = default)
        => ExportCustomerAsync(customer, ct);

    public Task<bool> PublishEventAsync(CrmEvent crmEvent, CancellationToken ct = default)
    {
        logger.LogInformation("Insider CRM: Publish event {Event}", crmEvent.EventName);
        return Task.FromResult(true);
    }
}
