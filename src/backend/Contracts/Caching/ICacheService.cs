namespace HeadlessCommerce.Contracts.Caching;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByPatternAsync(string pattern, CancellationToken ct = default);
}

public static class CacheKeys
{
    public static string Product(string handle) => $"product:{handle}";
    public static string Products(int page) => $"products:page:{page}";
    public static string Collection(string handle) => $"collection:{handle}";
    public static string Collections() => "collections:all";
    public static string Customer(string id) => $"customer:{id}";
    public static string Cart(string id) => $"cart:{id}";
    public static string Search(string query, int page) => $"search:{query}:{page}";
}
