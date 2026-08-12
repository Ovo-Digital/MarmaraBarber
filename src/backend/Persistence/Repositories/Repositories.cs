using HeadlessCommerce.Application.Common.Interfaces;
using HeadlessCommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeadlessCommerce.Persistence.Repositories;

public sealed class CustomerRepository(ApplicationDbContext db) : ICustomerRepository
{
    public async Task<Customer?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await db.Customers
            .Include(c => c.Wishlists)
            .ThenInclude(w => w.Items)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Customer?> GetByShopifyIdAsync(string shopifyCustomerId, CancellationToken ct = default)
        => await db.Customers.FirstOrDefaultAsync(c => c.ShopifyCustomerId == shopifyCustomerId, ct);

    public async Task AddAsync(Customer customer, CancellationToken ct = default)
        => await db.Customers.AddAsync(customer, ct);
}

public sealed class WishlistRepository(ApplicationDbContext db) : IWishlistRepository
{
    public async Task<Wishlist?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await db.Wishlists.Include(w => w.Items).FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task AddAsync(Wishlist wishlist, CancellationToken ct = default)
        => await db.Wishlists.AddAsync(wishlist, ct);
}

public sealed class SyncJobRepository(ApplicationDbContext db) : ISyncJobRepository
{
    public async Task<SyncJob?> GetNextPendingAsync(SyncJobType type, CancellationToken ct = default)
        => await db.SyncJobs
            .Where(j => j.JobType == type && (j.Status == SyncJobStatus.Pending || j.Status == SyncJobStatus.Failed))
            .OrderBy(j => j.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(SyncJob job, CancellationToken ct = default)
        => await db.SyncJobs.AddAsync(job, ct);

    public Task UpdateAsync(SyncJob job, CancellationToken ct = default)
    {
        db.SyncJobs.Update(job);
        return Task.CompletedTask;
    }
}

public sealed class WebhookLogRepository(ApplicationDbContext db) : IWebhookLogRepository
{
    public async Task AddAsync(WebhookLog log, CancellationToken ct = default)
        => await db.WebhookLogs.AddAsync(log, ct);

    public Task UpdateAsync(WebhookLog log, CancellationToken ct = default)
    {
        db.WebhookLogs.Update(log);
        return Task.CompletedTask;
    }
}

public sealed class UnitOfWork(ApplicationDbContext db) : IUnitOfWork
{
    public ICustomerRepository Customers { get; } = new CustomerRepository(db);
    public IWishlistRepository Wishlists { get; } = new WishlistRepository(db);
    public ISyncJobRepository SyncJobs { get; } = new SyncJobRepository(db);
    public IWebhookLogRepository WebhookLogs { get; } = new WebhookLogRepository(db);

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}
