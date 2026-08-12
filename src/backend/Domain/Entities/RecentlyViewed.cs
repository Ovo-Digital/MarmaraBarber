namespace HeadlessCommerce.Domain.Entities;

public sealed class RecentlyViewed : Common.AuditableEntity<Guid>
{
    private RecentlyViewed() { }

    public RecentlyViewed(Guid id, Guid customerId, string productId, string storeId) : base(id)
    {
        CustomerId = customerId;
        ProductId = productId;
        StoreId = storeId;
        ViewedAt = DateTime.UtcNow;
    }

    public Guid CustomerId { get; private set; }
    public Customer Customer { get; private set; } = null!;
    public string ProductId { get; private set; } = string.Empty;
    public string StoreId { get; private set; } = string.Empty;
    public DateTime ViewedAt { get; private set; }

    public void RefreshView()
    {
        ViewedAt = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
