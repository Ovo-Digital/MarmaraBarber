namespace HeadlessCommerce.SharedKernel.Domain;

/// <summary>Audit columns applied automatically by the persistence layer.</summary>
public interface IAuditable
{
    DateTime CreatedAtUtc { get; set; }
    string? CreatedBy { get; set; }
    DateTime? UpdatedAtUtc { get; set; }
    string? UpdatedBy { get; set; }
}

/// <summary>Soft-delete support. Rows are filtered out globally when deleted.</summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAtUtc { get; set; }
}
