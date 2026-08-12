using HeadlessCommerce.Contracts.Shopify;
using HeadlessCommerce.SharedKernel.Results;
using MediatR;

namespace HeadlessCommerce.Application.Products.Queries;

public sealed record GetProductsQuery(int First = 20, string? After = null) : IRequest<Result<IReadOnlyList<ShopifyProductDto>>>;

public sealed record GetProductByHandleQuery(string Handle) : IRequest<Result<ShopifyProductDto>>;

public sealed record SearchProductsQuery(string Query, int First = 20) : IRequest<Result<ShopifySearchResultDto>>;

public sealed record GetCollectionsQuery(int First = 20) : IRequest<Result<IReadOnlyList<ShopifyCollectionDto>>>;

public sealed record GetCollectionProductsQuery(string Handle, int First = 20) : IRequest<Result<IReadOnlyList<ShopifyProductDto>>>;
