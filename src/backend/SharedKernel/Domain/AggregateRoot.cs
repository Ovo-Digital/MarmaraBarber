namespace HeadlessCommerce.SharedKernel.Domain;

/// <summary>
/// Aggregate root marker. Only aggregate roots are exposed by repositories and
/// are the transactional consistency boundary.
/// </summary>
public abstract class AggregateRoot<TId> : Entity<TId>
    where TId : notnull
{
    protected AggregateRoot(TId id) : base(id) { }
    protected AggregateRoot() { }
}
