namespace HeadlessCommerce.Domain.ValueObjects;

public sealed class ShopifyGid : SharedKernel.Domain.ValueObject
{
    public string Value { get; }

    private ShopifyGid(string value) => Value = value;

    public static ShopifyGid Create(string gid)
    {
        if (string.IsNullOrWhiteSpace(gid))
            throw new ArgumentException("Shopify GID cannot be empty.", nameof(gid));
        return new ShopifyGid(gid);
    }

    public static ShopifyGid FromLegacyId(string resource, long id)
        => Create($"gid://shopify/{resource}/{id}");

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
