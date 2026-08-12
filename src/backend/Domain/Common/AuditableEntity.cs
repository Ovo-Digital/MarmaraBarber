namespace HeadlessCommerce.Domain.Common;

public abstract class AuditableEntity<TId> : SharedKernel.Domain.Entity<TId>, SharedKernel.Domain.IAuditable, SharedKernel.Domain.ISoftDeletable
    where TId : notnull
{
    protected AuditableEntity(TId id) : base(id) { }
    protected AuditableEntity() { }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
