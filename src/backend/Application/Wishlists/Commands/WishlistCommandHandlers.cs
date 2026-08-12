using HeadlessCommerce.Application.Common.Interfaces;
using HeadlessCommerce.Domain.Entities;
using HeadlessCommerce.SharedKernel.Results;
using MediatR;

namespace HeadlessCommerce.Application.Wishlists.Commands;

public sealed class AddWishlistItemCommandHandler(IUnitOfWork uow)
    : IRequestHandler<AddWishlistItemCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(AddWishlistItemCommand request, CancellationToken ct)
    {
        var customer = await uow.Customers.GetByIdAsync(request.CustomerId, ct);
        if (customer is null)
            return Result.Failure<Guid>(Error.NotFound("Customer.NotFound", "Customer not found."));

        var wishlist = customer.Wishlists.FirstOrDefault(w => w.StoreId == request.StoreId)
            ?? new Wishlist(Guid.NewGuid(), customer.Id, "Default", request.StoreId);

        if (!customer.Wishlists.Contains(wishlist))
            await uow.Wishlists.AddAsync(wishlist, ct);

        wishlist.AddItem(request.ProductId, request.VariantId);
        await uow.SaveChangesAsync(ct);

        var item = wishlist.Items.Last();
        return Result.Success(item.Id);
    }
}

public sealed class RemoveWishlistItemCommandHandler(IUnitOfWork uow)
    : IRequestHandler<RemoveWishlistItemCommand, Result>
{
    public async Task<Result> Handle(RemoveWishlistItemCommand request, CancellationToken ct)
    {
        var wishlist = await uow.Wishlists.GetByIdAsync(request.WishlistId, ct);
        if (wishlist is null)
            return Result.Failure(Error.NotFound("Wishlist.NotFound", "Wishlist not found."));

        wishlist.RemoveItem(request.ItemId);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed class GetWishlistQueryHandler(IUnitOfWork uow)
    : IRequestHandler<GetWishlistQuery, Result<IReadOnlyList<WishlistItemDto>>>
{
    public async Task<Result<IReadOnlyList<WishlistItemDto>>> Handle(GetWishlistQuery request, CancellationToken ct)
    {
        var customer = await uow.Customers.GetByIdAsync(request.CustomerId, ct);
        if (customer is null)
            return Result.Failure<IReadOnlyList<WishlistItemDto>>(Error.NotFound("Customer.NotFound", "Customer not found."));

        var wishlist = customer.Wishlists.FirstOrDefault(w => w.StoreId == request.StoreId);
        if (wishlist is null)
            return Result.Success<IReadOnlyList<WishlistItemDto>>([]);

        var items = wishlist.Items.Select(i => new WishlistItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            VariantId = i.VariantId
        }).ToList();

        return Result.Success<IReadOnlyList<WishlistItemDto>>(items);
    }
}
