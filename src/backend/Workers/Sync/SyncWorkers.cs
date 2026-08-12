using HeadlessCommerce.Application.Common.Interfaces;
using HeadlessCommerce.Contracts.Integrations.ERP;
using HeadlessCommerce.Contracts.Integrations.Shopify;
using HeadlessCommerce.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HeadlessCommerce.Workers.Sync;

public sealed class OrderSyncWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<OrderSyncWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var orderExporter = scope.ServiceProvider.GetRequiredService<IOrderExporter>();
            var admin = scope.ServiceProvider.GetRequiredService<IShopifyAdminClient>();

            var job = await uow.SyncJobs.GetNextPendingAsync(SyncJobType.Order, stoppingToken);
            if (job is null)
            {
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                continue;
            }

            job.MarkRunning();
            await uow.SyncJobs.UpdateAsync(job, stoppingToken);

            try
            {
                var orders = await admin.GetOrdersAsync(ct: stoppingToken);
                logger.LogInformation("Order sync: fetched {Count} orders", orders.Count);
                job.MarkCompleted();
            }
            catch (Exception ex)
            {
                job.MarkFailed(ex.Message);
                logger.LogError(ex, "Order sync failed");
            }

            await uow.SaveChangesAsync(stoppingToken);
        }
    }
}

public sealed class InventorySyncWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<InventorySyncWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var synchronizer = scope.ServiceProvider.GetRequiredService<IInventorySynchronizer>();
            var importer = scope.ServiceProvider.GetRequiredService<IProductImporter>();

            try
            {
                var products = await importer.ImportProductsAsync(stoppingToken);
                var updates = products.Select(p => new ErpInventoryUpdate
                {
                    Sku = p.Sku,
                    AvailableQuantity = p.Quantity
                }).ToList();
                await synchronizer.SyncInventoryAsync(updates, stoppingToken);
                logger.LogInformation("Inventory sync completed: {Count} items", updates.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Inventory sync failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}

public sealed class ProductSyncWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<ProductSyncWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var admin = scope.ServiceProvider.GetRequiredService<IShopifyAdminClient>();

            try
            {
                var products = await admin.GetProductsAsync(ct: stoppingToken);
                logger.LogInformation("Product sync: {Count} products", products.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Product sync failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}

public sealed class CustomerSyncWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<CustomerSyncWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var admin = scope.ServiceProvider.GetRequiredService<IShopifyAdminClient>();
            var crm = scope.ServiceProvider.GetRequiredService<Contracts.Integrations.CRM.ICustomerSynchronizer>();

            try
            {
                var customers = await admin.GetCustomersAsync(ct: stoppingToken);
                foreach (var c in customers)
                {
                    await crm.SyncCustomerAsync(new Contracts.Integrations.CRM.CrmCustomerExport
                    {
                        Email = c.Email,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        ShopifyCustomerId = c.Id
                    }, stoppingToken);
                }
                logger.LogInformation("Customer sync: {Count} customers", customers.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Customer sync failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
}

public sealed class MarketingWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<MarketingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            // Process unpublished event logs — extend with dedicated repository when scaling
            logger.LogDebug("Marketing worker heartbeat");
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
