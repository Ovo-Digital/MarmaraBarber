using HeadlessCommerce.Application.Cart.Commands;
using HeadlessCommerce.Application.Products.Queries;
using HeadlessCommerce.Application.Wishlists.Commands;
using HeadlessCommerce.Contracts.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadlessCommerce.Gateway.Api.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public sealed class ProductsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<object>>>> GetProducts(
        [FromQuery] int first = 20, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetProductsQuery(first), ct);
        return result.IsSuccess
            ? Ok(ApiResponse<IReadOnlyList<object>>.Ok(result.Value.Cast<object>().ToList()))
            : BadRequest(ApiResponse<IReadOnlyList<object>>.Fail(result.Error.Message));
    }

    [HttpGet("{handle}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProduct(string handle, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductByHandleQuery(handle), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : NotFound(ApiResponse<object>.Fail(result.Error.Message));
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int first = 20, CancellationToken ct = default)
    {
        var result = await mediator.Send(new SearchProductsQuery(q, first), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }
}

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public sealed class CollectionsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetCollections(CancellationToken ct)
    {
        var result = await mediator.Send(new GetCollectionsQuery(), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }

    [HttpGet("{handle}/products")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCollectionProducts(string handle, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCollectionProductsQuery(handle), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }
}

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public sealed class CartController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateCart(CancellationToken ct)
    {
        var result = await mediator.Send(new CreateCartCommand(), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }

    [HttpGet("{cartId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCart(string cartId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCartQuery(cartId), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : NotFound(ApiResponse<object>.Fail(result.Error.Message));
    }

    [HttpPost("{cartId}/lines")]
    [AllowAnonymous]
    public async Task<IActionResult> AddLine(string cartId, [FromBody] AddLineRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new AddToCartCommand(cartId, request.VariantId, request.Quantity), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }

    [HttpDelete("{cartId}/lines/{lineId}")]
    [AllowAnonymous]
    public async Task<IActionResult> RemoveLine(string cartId, string lineId, CancellationToken ct)
    {
        var result = await mediator.Send(new RemoveFromCartCommand(cartId, lineId), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }
}

public sealed class AddLineRequest
{
    public string VariantId { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public sealed class WishlistsController(ISender mediator) : ControllerBase
{
    [HttpGet("{customerId:guid}")]
    public async Task<IActionResult> GetWishlist(Guid customerId, [FromQuery] string storeId = "default", CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetWishlistQuery(customerId, storeId), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : NotFound(ApiResponse<object>.Fail(result.Error.Message));
    }

    [HttpPost("{customerId:guid}/items")]
    public async Task<IActionResult> AddItem(Guid customerId, [FromBody] AddWishlistItemRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new AddWishlistItemCommand(
            customerId, request.ProductId, request.VariantId, request.StoreId ?? "default"), ct);
        return result.IsSuccess ? Ok(ApiResponse<object>.Ok(result.Value)) : BadRequest(ApiResponse<object>.Fail(result.Error.Message));
    }
}

public sealed class AddWishlistItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public string? VariantId { get; set; }
    public string? StoreId { get; set; }
}
