using HeadlessCommerce.Contracts.Caching;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace HeadlessCommerce.Infrastructure.Caching;

public sealed class RedisCacheService(IDistributedCache cache) : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var data = await cache.GetStringAsync(key, ct);
        return data is null ? default : JsonSerializer.Deserialize<T>(data, JsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default)
    {
        var options = new DistributedCacheEntryOptions();
        if (expiry.HasValue)
            options.AbsoluteExpirationRelativeToNow = expiry;

        var json = JsonSerializer.Serialize(value, JsonOptions);
        await cache.SetStringAsync(key, json, options, ct);
    }

    public Task RemoveAsync(string key, CancellationToken ct = default)
        => cache.RemoveAsync(key, ct);

    public Task RemoveByPatternAsync(string pattern, CancellationToken ct = default)
    {
        // Pattern-based removal requires Redis server-side SCAN; implement via IConnectionMultiplexer when needed.
        // For starter architecture, individual key removal is sufficient.
        return Task.CompletedTask;
    }
}
