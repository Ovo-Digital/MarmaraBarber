namespace HeadlessCommerce.Domain.Entities;

public sealed class Wishlist : Common.AuditableEntity<Guid>
{
    private Wishlist() { }

    public Wishlist(Guid id, Guid customerId, string name, string storeId) : base(id)
    {
        CustomerId = customerId;
        Name = name;
        StoreId = storeId;
    }

    public Guid CustomerId { get; private set; }
    public Customer Customer { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string StoreId { get; private set; } = string.Empty;
    public ICollection<WishlistItem> Items { get; private set; } = new List<WishlistItem>();

    public void AddItem(string productId, string? variantId)
    {
        if (Items.Any(i => i.ProductId == productId && i.VariantId == variantId))
            return;
        Items.Add(new WishlistItem(Guid.NewGuid(), Id, productId, variantId));
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item is not null)
        {
            Items.Remove(item);
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}

public sealed class WishlistItem : Common.AuditableEntity<Guid>
{
    private WishlistItem() { }

    public WishlistItem(Guid id, Guid wishlistId, string productId, string? variantId) : base(id)
    {
        WishlistId = wishlistId;
        ProductId = productId;
        VariantId = variantId;
    }

    public Guid WishlistId { get; private set; }
    public string ProductId { get; private set; } = string.Empty;
    public string? VariantId { get; private set; }
}
