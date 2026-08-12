namespace HeadlessCommerce.Domain.Entities;

public sealed class AuditLog : Common.AuditableEntity<Guid>
{
    private AuditLog() { }

    public AuditLog(Guid id, string entityName, string entityId, string action, string? changes, string? userId)
        : base(id)
    {
        EntityName = entityName;
        EntityId = entityId;
        Action = action;
        Changes = changes;
        UserId = userId;
    }

    public string EntityName { get; private set; } = string.Empty;
    public string EntityId { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string? Changes { get; private set; }
    public string? UserId { get; private set; }
}
