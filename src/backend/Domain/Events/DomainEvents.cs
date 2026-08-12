using HeadlessCommerce.SharedKernel.Domain;

namespace HeadlessCommerce.Domain.Events;

public sealed record OrderCreatedDomainEvent(string ShopifyOrderId, string StoreId) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public sealed record ProductUpdatedDomainEvent(string ShopifyProductId, string StoreId) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public sealed record CustomerCreatedDomainEvent(string ShopifyCustomerId, string Email, string StoreId) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public sealed record WishlistItemAddedDomainEvent(Guid WishlistId, string ProductId, string StoreId) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
