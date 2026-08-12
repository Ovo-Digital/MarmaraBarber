using FluentValidation;
using HeadlessCommerce.Application.Cart.Commands;
using HeadlessCommerce.Application.Products.Queries;
using HeadlessCommerce.Application.Wishlists.Commands;
using Microsoft.Extensions.DependencyInjection;

namespace HeadlessCommerce.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly);
        services.AddAutoMapper(assembly);

        return services;
    }
}

public sealed class GetProductByHandleQueryValidator : AbstractValidator<GetProductByHandleQuery>
{
    public GetProductByHandleQueryValidator()
    {
        RuleFor(x => x.Handle).NotEmpty().MaximumLength(256);
    }
}

public sealed class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.CartId).NotEmpty();
        RuleFor(x => x.VariantId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public sealed class AddWishlistItemCommandValidator : AbstractValidator<AddWishlistItemCommand>
{
    public AddWishlistItemCommandValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.StoreId).NotEmpty();
    }
}
