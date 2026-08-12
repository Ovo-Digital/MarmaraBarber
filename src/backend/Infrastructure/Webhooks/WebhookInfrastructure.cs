using System.Security.Cryptography;
using System.Text;
using HeadlessCommerce.Contracts.Webhooks;
using HeadlessCommerce.Integrations.Shopify.Configuration;
using Microsoft.Extensions.Options;

namespace HeadlessCommerce.Infrastructure.Webhooks;

public sealed class ShopifyWebhookValidator(IOptions<ShopifySettings> settings) : IWebhookValidator
{
    public bool ValidateHmac(string payload, string hmacHeader, string secret)
    {
        var key = string.IsNullOrEmpty(secret) ? settings.Value.WebhookSecret : secret;
        if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(hmacHeader))
            return false;

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var computed = Convert.ToBase64String(hash);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(hmacHeader));
    }
}

public sealed class InMemoryWebhookQueue : IWebhookQueue
{
    private readonly System.Collections.Concurrent.ConcurrentQueue<WebhookEnvelope> _queue = new();

    public ValueTask EnqueueAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        _queue.Enqueue(envelope);
        return ValueTask.CompletedTask;
    }

    public ValueTask<WebhookEnvelope?> DequeueAsync(CancellationToken ct = default)
    {
        _queue.TryDequeue(out var envelope);
        return ValueTask.FromResult<WebhookEnvelope?>(envelope);
    }
}

public sealed class WebhookEventDispatcher(
    IEnumerable<IWebhookHandler> handlers,
    IWebhookQueue queue) : IWebhookEventDispatcher
{
    public async Task DispatchAsync(WebhookEnvelope envelope, CancellationToken ct = default)
    {
        await queue.EnqueueAsync(envelope, ct);

        var handler = handlers.FirstOrDefault(h =>
            string.Equals(h.Topic, envelope.Topic, StringComparison.OrdinalIgnoreCase));

        if (handler is not null)
            await handler.HandleAsync(envelope, ct);
    }
}
