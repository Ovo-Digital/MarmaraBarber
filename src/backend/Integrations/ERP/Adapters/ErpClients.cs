using HeadlessCommerce.Contracts.Integrations.ERP;
using HeadlessCommerce.Integrations.ERP.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HeadlessCommerce.Integrations.ERP.Adapters;

public abstract class ErpClientBase(IOptions<ErpSettings> settings, ILogger logger) : IERPClient
{
    protected ErpSettings Settings => settings.Value;
    protected ILogger Logger => logger;

    public abstract string ProviderName { get; }

    public virtual Task<bool> HealthCheckAsync(CancellationToken ct = default)
    {
        Logger.LogInformation("{Provider} ERP health check — stub OK", ProviderName);
        return Task.FromResult(true);
    }
}

public sealed class NebimErpClient(
    IOptions<ErpSettings> settings,
    ILogger<NebimErpClient> logger)
    : ErpClientBase(settings, logger), IOrderExporter, IProductImporter, IInventorySynchronizer
{
    public override string ProviderName => "Nebim";

    public Task<bool> ExportOrderAsync(ErpOrderExportRequest order, CancellationToken ct = default)
    {
        Logger.LogInformation("Nebim: Export order {OrderNumber} — TODO: wire Nebim API at {BaseUrl}",
            order.OrderNumber, Settings.BaseUrl);
        return Task.FromResult(true);
    }

    public Task<IReadOnlyList<ErpProductImport>> ImportProductsAsync(CancellationToken ct = default)
    {
        Logger.LogInformation("Nebim: Import products — stub");
        return Task.FromResult<IReadOnlyList<ErpProductImport>>([]);
    }

    public Task<bool> SyncInventoryAsync(IReadOnlyList<ErpInventoryUpdate> updates, CancellationToken ct = default)
    {
        Logger.LogInformation("Nebim: Sync {Count} inventory items — stub", updates.Count);
        return Task.FromResult(true);
    }
}

public sealed class SapErpClient(IOptions<ErpSettings> settings, ILogger<SapErpClient> logger)
    : ErpClientBase(settings, logger), IOrderExporter
{
    public override string ProviderName => "SAP";

    public Task<bool> ExportOrderAsync(ErpOrderExportRequest order, CancellationToken ct = default)
    {
        Logger.LogInformation("SAP: Export order {OrderNumber} — TODO", order.OrderNumber);
        return Task.FromResult(true);
    }
}

public sealed class LogoErpClient(IOptions<ErpSettings> settings, ILogger<LogoErpClient> logger)
    : ErpClientBase(settings, logger), IOrderExporter
{
    public override string ProviderName => "Logo";

    public Task<bool> ExportOrderAsync(ErpOrderExportRequest order, CancellationToken ct = default)
    {
        Logger.LogInformation("Logo: Export order {OrderNumber} — TODO", order.OrderNumber);
        return Task.FromResult(true);
    }
}

public sealed class MikroErpClient(IOptions<ErpSettings> settings, ILogger<MikroErpClient> logger)
    : ErpClientBase(settings, logger), IOrderExporter
{
    public override string ProviderName => "Mikro";

    public Task<bool> ExportOrderAsync(ErpOrderExportRequest order, CancellationToken ct = default)
    {
        Logger.LogInformation("Mikro: Export order {OrderNumber} — TODO", order.OrderNumber);
        return Task.FromResult(true);
    }
}
