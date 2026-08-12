namespace HeadlessCommerce.Contracts.Integrations.ERP;

public sealed class ErpOrderExportRequest
{
    public string ShopifyOrderId { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
    public IReadOnlyList<ErpOrderLine> Lines { get; set; } = [];
}

public sealed class ErpOrderLine
{
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public sealed class ErpProductImport
{
    public string Sku { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public sealed class ErpInventoryUpdate
{
    public string Sku { get; set; } = string.Empty;
    public int AvailableQuantity { get; set; }
    public string? LocationCode { get; set; }
}

public interface IERPClient
{
    string ProviderName { get; }
    Task<bool> HealthCheckAsync(CancellationToken ct = default);
}

public interface IOrderExporter
{
    Task<bool> ExportOrderAsync(ErpOrderExportRequest order, CancellationToken ct = default);
}

public interface IProductImporter
{
    Task<IReadOnlyList<ErpProductImport>> ImportProductsAsync(CancellationToken ct = default);
}

public interface IInventorySynchronizer
{
    Task<bool> SyncInventoryAsync(IReadOnlyList<ErpInventoryUpdate> updates, CancellationToken ct = default);
}
