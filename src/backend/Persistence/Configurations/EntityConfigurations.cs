using HeadlessCommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HeadlessCommerce.Persistence.Configurations;

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ShopifyCustomerId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.StoreId).HasMaxLength(64).IsRequired();
        builder.Property(x => x.RowVersion).IsRowVersion();
        builder.HasIndex(x => new { x.ShopifyCustomerId, x.StoreId }).IsUnique();
        builder.HasIndex(x => x.Email);
        builder.HasQueryFilter(x => !x.IsDeleted);
        builder.HasMany(x => x.Wishlists).WithOne().HasForeignKey(w => w.CustomerId);
        builder.HasMany(x => x.RecentlyViewed).WithOne(r => r.Customer).HasForeignKey(r => r.CustomerId);
    }
}

public sealed class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.ToTable("Wishlists");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.StoreId).HasMaxLength(64).IsRequired();
        builder.Property(x => x.RowVersion).IsRowVersion();
        builder.HasMany(x => x.Items).WithOne().HasForeignKey(i => i.WishlistId);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("WishlistItems");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ProductId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.VariantId).HasMaxLength(128);
        builder.HasIndex(x => new { x.WishlistId, x.ProductId, x.VariantId });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class RecentlyViewedConfiguration : IEntityTypeConfiguration<RecentlyViewed>
{
    public void Configure(EntityTypeBuilder<RecentlyViewed> builder)
    {
        builder.ToTable("RecentlyViewed");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ProductId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.StoreId).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => new { x.CustomerId, x.StoreId, x.ViewedAt });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class SyncJobConfiguration : IEntityTypeConfiguration<SyncJob>
{
    public void Configure(EntityTypeBuilder<SyncJob> builder)
    {
        builder.ToTable("SyncJobs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Payload).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.StoreId).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => new { x.JobType, x.Status, x.CreatedAtUtc });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class IntegrationLogConfiguration : IEntityTypeConfiguration<IntegrationLog>
{
    public void Configure(EntityTypeBuilder<IntegrationLog> builder)
    {
        builder.ToTable("IntegrationLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Provider).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Operation).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => new { x.Provider, x.CreatedAtUtc });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class WebhookLogConfiguration : IEntityTypeConfiguration<WebhookLog>
{
    public void Configure(EntityTypeBuilder<WebhookLog> builder)
    {
        builder.ToTable("WebhookLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Topic).HasMaxLength(128).IsRequired();
        builder.Property(x => x.ShopDomain).HasMaxLength(256).IsRequired();
        builder.Property(x => x.PayloadHash).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => new { x.Topic, x.Status, x.CreatedAtUtc });
        builder.HasIndex(x => x.PayloadHash);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class EventLogConfiguration : IEntityTypeConfiguration<EventLog>
{
    public void Configure(EntityTypeBuilder<EventLog> builder)
    {
        builder.ToTable("EventLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EventType).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Payload).HasColumnType("nvarchar(max)").IsRequired();
        builder.HasIndex(x => new { x.EventType, x.IsPublished });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EntityName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.EntityId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Action).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => new { x.EntityName, x.EntityId, x.CreatedAtUtc });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
