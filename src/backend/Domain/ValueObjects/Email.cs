namespace HeadlessCommerce.Domain.ValueObjects;

public sealed class Email : SharedKernel.Domain.ValueObject
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Email Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty.", nameof(email));
        if (!email.Contains('@'))
            throw new ArgumentException("Invalid email format.", nameof(email));
        return new Email(email.Trim().ToLowerInvariant());
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
