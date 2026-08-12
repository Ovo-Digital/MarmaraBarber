using HeadlessCommerce.Contracts.Caching;
using HeadlessCommerce.Contracts.Integrations.Shopify;
using HeadlessCommerce.Contracts.Shopify;
using HeadlessCommerce.SharedKernel.Results;
using MediatR;

namespace HeadlessCommerce.Application.Cart.Commands;

public sealed class CreateCartCommandHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<CreateCartCommand, Result<ShopifyCartDto>>
{
    public async Task<Result<ShopifyCartDto>> Handle(CreateCartCommand request, CancellationToken ct)
    {
        var cart = await storefront.CreateCartAsync(ct);
        await cache.SetAsync(CacheKeys.Cart(cart.Id), cart, TimeSpan.FromHours(24), ct);
        return Result.Success(cart);
    }
}

public sealed class AddToCartCommandHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<AddToCartCommand, Result<ShopifyCartDto>>
{
    public async Task<Result<ShopifyCartDto>> Handle(AddToCartCommand request, CancellationToken ct)
    {
        var cart = await storefront.AddCartLinesAsync(
            request.CartId,
            [(request.VariantId, request.Quantity)],
            ct);
        await cache.SetAsync(CacheKeys.Cart(cart.Id), cart, TimeSpan.FromHours(24), ct);
        return Result.Success(cart);
    }
}

public sealed class RemoveFromCartCommandHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<RemoveFromCartCommand, Result<ShopifyCartDto>>
{
    public async Task<Result<ShopifyCartDto>> Handle(RemoveFromCartCommand request, CancellationToken ct)
    {
        var cart = await storefront.RemoveCartLinesAsync(request.CartId, [request.LineId], ct);
        await cache.SetAsync(CacheKeys.Cart(cart.Id), cart, TimeSpan.FromHours(24), ct);
        return Result.Success(cart);
    }
}

public sealed class GetCartQueryHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<GetCartQuery, Result<ShopifyCartDto>>
{
    public async Task<Result<ShopifyCartDto>> Handle(GetCartQuery request, CancellationToken ct)
    {
        var cached = await cache.GetAsync<ShopifyCartDto>(CacheKeys.Cart(request.CartId), ct);
        if (cached is not null)
            return Result.Success(cached);

        var cart = await storefront.GetCartAsync(request.CartId, ct);
        if (cart is null)
            return Result.Failure<ShopifyCartDto>(Error.NotFound("Cart.NotFound", "Cart not found."));

        return Result.Success(cart);
    }
}
