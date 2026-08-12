using HeadlessCommerce.Contracts.Shopify;
using HeadlessCommerce.SharedKernel.Results;
using MediatR;

namespace HeadlessCommerce.Application.Cart.Commands;

public sealed record CreateCartCommand : IRequest<Result<ShopifyCartDto>>;

public sealed record AddToCartCommand(string CartId, string VariantId, int Quantity) : IRequest<Result<ShopifyCartDto>>;

public sealed record RemoveFromCartCommand(string CartId, string LineId) : IRequest<Result<ShopifyCartDto>>;

public sealed record GetCartQuery(string CartId) : IRequest<Result<ShopifyCartDto>>;
