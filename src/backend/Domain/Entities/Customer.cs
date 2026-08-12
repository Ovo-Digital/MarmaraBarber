namespace HeadlessCommerce.Domain.Entities;

public sealed class Customer : Common.AuditableEntity<Guid>
{
    private Customer() { }

    public Customer(Guid id, string shopifyCustomerId, string email, string? firstName, string? lastName, string storeId)
        : base(id)
    {
        ShopifyCustomerId = shopifyCustomerId;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        StoreId = storeId;
    }

    public string ShopifyCustomerId { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public string StoreId { get; private set; } = string.Empty;

    public ICollection<Wishlist> Wishlists { get; private set; } = new List<Wishlist>();
    public ICollection<RecentlyViewed> RecentlyViewed { get; private set; } = new List<RecentlyViewed>();

    public void UpdateProfile(string? firstName, string? lastName)
    {
        FirstName = firstName;
        LastName = lastName;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
