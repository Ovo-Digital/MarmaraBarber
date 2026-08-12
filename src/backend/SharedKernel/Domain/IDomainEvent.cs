using MediatR;

namespace HeadlessCommerce.SharedKernel.Domain;

/// <summary>
/// Marker for domain events. Implements <see cref="INotification"/> so events can
/// be published through MediatR once an aggregate is persisted.
/// </summary>
public interface IDomainEvent : INotification
{
    Guid EventId => Guid.NewGuid();
    DateTime OccurredOnUtc => DateTime.UtcNow;
}
