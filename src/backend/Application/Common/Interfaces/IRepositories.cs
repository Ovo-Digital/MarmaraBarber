using HeadlessCommerce.Domain.Entities;

namespace HeadlessCommerce.Application.Common.Interfaces;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Customer?> GetByShopifyIdAsync(string shopifyCustomerId, CancellationToken ct = default);
    Task AddAsync(Customer customer, CancellationToken ct = default);
}

public interface IWishlistRepository
{
    Task<Wishlist?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Wishlist wishlist, CancellationToken ct = default);
}

public interface ISyncJobRepository
{
    Task<SyncJob?> GetNextPendingAsync(SyncJobType type, CancellationToken ct = default);
    Task AddAsync(SyncJob job, CancellationToken ct = default);
    Task UpdateAsync(SyncJob job, CancellationToken ct = default);
}

public interface IWebhookLogRepository
{
    Task AddAsync(WebhookLog log, CancellationToken ct = default);
    Task UpdateAsync(WebhookLog log, CancellationToken ct = default);
}

public interface IUnitOfWork
{
    ICustomerRepository Customers { get; }
    IWishlistRepository Wishlists { get; }
    ISyncJobRepository SyncJobs { get; }
    IWebhookLogRepository WebhookLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
