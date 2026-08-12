using HeadlessCommerce.Contracts.Caching;
using HeadlessCommerce.Contracts.Integrations.Shopify;
using HeadlessCommerce.Contracts.Shopify;
using HeadlessCommerce.SharedKernel.Results;
using MediatR;

namespace HeadlessCommerce.Application.Products.Queries;

public sealed class GetProductsQueryHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<GetProductsQuery, Result<IReadOnlyList<ShopifyProductDto>>>
{
    public async Task<Result<IReadOnlyList<ShopifyProductDto>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var cacheKey = CacheKeys.Products(1);
        var cached = await cache.GetAsync<IReadOnlyList<ShopifyProductDto>>(cacheKey, ct);
        if (cached is not null)
            return Result.Success(cached);

        var products = await storefront.GetProductsAsync(request.First, request.After, ct);
        await cache.SetAsync(cacheKey, products, TimeSpan.FromMinutes(5), ct);
        return Result.Success(products);
    }
}

public sealed class GetProductByHandleQueryHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<GetProductByHandleQuery, Result<ShopifyProductDto>>
{
    public async Task<Result<ShopifyProductDto>> Handle(GetProductByHandleQuery request, CancellationToken ct)
    {
        var cacheKey = CacheKeys.Product(request.Handle);
        var cached = await cache.GetAsync<ShopifyProductDto>(cacheKey, ct);
        if (cached is not null)
            return Result.Success(cached);

        var product = await storefront.GetProductAsync(request.Handle, ct);
        if (product is null)
            return Result.Failure<ShopifyProductDto>(Error.NotFound("Product.NotFound", $"Product '{request.Handle}' not found."));

        await cache.SetAsync(cacheKey, product, TimeSpan.FromMinutes(10), ct);
        return Result.Success(product);
    }
}

public sealed class SearchProductsQueryHandler(
    IShopifyStorefrontClient storefront) : IRequestHandler<SearchProductsQuery, Result<ShopifySearchResultDto>>
{
    public async Task<Result<ShopifySearchResultDto>> Handle(SearchProductsQuery request, CancellationToken ct)
    {
        var result = await storefront.SearchAsync(request.Query, request.First, ct);
        return Result.Success(result);
    }
}

public sealed class GetCollectionsQueryHandler(
    IShopifyStorefrontClient storefront,
    ICacheService cache) : IRequestHandler<GetCollectionsQuery, Result<IReadOnlyList<ShopifyCollectionDto>>>
{
    public async Task<Result<IReadOnlyList<ShopifyCollectionDto>>> Handle(GetCollectionsQuery request, CancellationToken ct)
    {
        var cached = await cache.GetAsync<IReadOnlyList<ShopifyCollectionDto>>(CacheKeys.Collections(), ct);
        if (cached is not null)
            return Result.Success(cached);

        var collections = await storefront.GetCollectionsAsync(request.First, ct);
        await cache.SetAsync(CacheKeys.Collections(), collections, TimeSpan.FromMinutes(15), ct);
        return Result.Success(collections);
    }
}

public sealed class GetCollectionProductsQueryHandler(
    IShopifyStorefrontClient storefront) : IRequestHandler<GetCollectionProductsQuery, Result<IReadOnlyList<ShopifyProductDto>>>
{
    public async Task<Result<IReadOnlyList<ShopifyProductDto>>> Handle(GetCollectionProductsQuery request, CancellationToken ct)
    {
        // Collection-specific product fetch via search/filter — extend with dedicated GraphQL when needed
        var result = await storefront.SearchAsync($"collection:{request.Handle}", request.First, ct);
        return Result.Success(result.Products);
    }
}
