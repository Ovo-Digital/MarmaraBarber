using HeadlessCommerce.SharedKernel.Results;
using MediatR;

namespace HeadlessCommerce.Application.Wishlists.Commands;

public sealed record AddWishlistItemCommand(Guid CustomerId, string ProductId, string? VariantId, string StoreId)
    : IRequest<Result<Guid>>;

public sealed record RemoveWishlistItemCommand(Guid WishlistId, Guid ItemId)
    : IRequest<Result>;

public sealed record GetWishlistQuery(Guid CustomerId, string StoreId)
    : IRequest<Result<IReadOnlyList<WishlistItemDto>>>;

public sealed class WishlistItemDto
{
    public Guid Id { get; init; }
    public string ProductId { get; init; } = string.Empty;
    public string? VariantId { get; init; }
}
