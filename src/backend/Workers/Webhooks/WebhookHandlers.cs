using HeadlessCommerce.Application.Common.Interfaces;
using HeadlessCommerce.Contracts.Integrations.CRM;
using HeadlessCommerce.Contracts.Integrations.ERP;
using HeadlessCommerce.Contracts.Integrations.Marketing;
using HeadlessCommerce.Contracts.Webhooks;
using HeadlessCommerce.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace HeadlessCommerce.Workers.Webhooks;

public sealed class WebhookProcessingWorker(
    IWebhookQueue queue,
    IServiceScopeFactory scopeFactory,
    ILogger<WebhookProcessingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Webhook processing worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            var envelope = await queue.DequeueAsync(stoppingToken);
            if (envelope is null)
            {
                await Task.Delay(1000, stoppingToken);
                continue;
            }

            try
            {
                using var scope = scopeFactory.CreateScope();
                var handlers = scope.ServiceProvider.GetServices<IWebhookHandler>();
                var handler = handlers.FirstOrDefault(h =>
                    string.Equals(h.Topic, envelope.Topic, StringComparison.OrdinalIgnoreCase));

                if (handler is not null)
                    await handler.HandleAsync(envelope, stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process webhook {Topic}", envelope.Topic);
            }
        }
    }
}

public sealed class OrderCreatedWebhookHandler(
    IOrderExporter orderExporter,
    IMarketingEventDispatcher marketing,
    IUnitOfWork uow,
    ILogger<OrderCreatedWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "orders/create";

    public async Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        logger.LogInformation("Processing order created webhook from {Shop}", envelope.ShopDomain);

        using var doc = JsonDocument.Parse(envelope.Payload);
        var root = doc.RootElement;

        var exportRequest = new ErpOrderExportRequest
        {
            ShopifyOrderId = root.GetProperty("admin_graphql_api_id").GetString() ?? "",
            OrderNumber = root.GetProperty("name").GetString() ?? "",
            CustomerEmail = root.TryGetProperty("email", out var e) ? e.GetString() ?? "" : "",
            TotalAmount = root.TryGetProperty("total_price", out var tp)
                ? decimal.Parse(tp.GetString() ?? "0")
                : 0
        };

        await orderExporter.ExportOrderAsync(exportRequest, ct);

        await marketing.DispatchAsync(new MarketingEvent
        {
            EventType = MarketingEventType.PurchaseCompleted,
            CustomerEmail = exportRequest.CustomerEmail,
            OrderId = exportRequest.ShopifyOrderId,
            Value = exportRequest.TotalAmount
        }, ct);

        var log = new WebhookLog(Guid.NewGuid(), envelope.Topic, envelope.ShopDomain,
            Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(envelope.Payload))), "default");
        log.MarkProcessed();
        await uow.WebhookLogs.AddAsync(log, ct);
        await uow.SaveChangesAsync(ct);
    }
}

public sealed class OrdersPaidWebhookHandler(ILogger<OrdersPaidWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "orders/paid";
    public Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        logger.LogInformation("Order paid webhook received from {Shop}", envelope.ShopDomain);
        return Task.CompletedTask;
    }
}

public sealed class OrdersUpdatedWebhookHandler(ILogger<OrdersUpdatedWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "orders/updated";
    public Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        logger.LogInformation("Order updated webhook received");
        return Task.CompletedTask;
    }
}

public sealed class ProductCreateWebhookHandler(ILogger<ProductCreateWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "products/create";
    public Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        logger.LogInformation("Product create webhook received");
        return Task.CompletedTask;
    }
}

public sealed class ProductUpdateWebhookHandler(ILogger<ProductUpdateWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "products/update";
    public Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        logger.LogInformation("Product update webhook received");
        return Task.CompletedTask;
    }
}

public sealed class CustomerCreateWebhookHandler(
    ICustomerExporter crm,
    ILogger<CustomerCreateWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "customers/create";

    public async Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        using var doc = JsonDocument.Parse(envelope.Payload);
        var root = doc.RootElement;
        await crm.ExportCustomerAsync(new CrmCustomerExport
        {
            Email = root.GetProperty("email").GetString() ?? "",
            FirstName = root.TryGetProperty("first_name", out var fn) ? fn.GetString() : null,
            LastName = root.TryGetProperty("last_name", out var ln) ? ln.GetString() : null,
            ShopifyCustomerId = root.GetProperty("admin_graphql_api_id").GetString() ?? ""
        }, ct);
        logger.LogInformation("Customer exported to CRM");
    }
}

public sealed class RefundCreateWebhookHandler(ILogger<RefundCreateWebhookHandler> logger) : IWebhookHandler
{
    public string Topic => "refunds/create";
    public Task HandleAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        logger.LogInformation("Refund create webhook received");
        return Task.CompletedTask;
    }
}
