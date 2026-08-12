using HeadlessCommerce.Contracts.Integrations.ERP;
using HeadlessCommerce.Integrations.ERP.Adapters;
using HeadlessCommerce.Integrations.ERP.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HeadlessCommerce.Integrations.ERP;

public static class DependencyInjection
{
    public static IServiceCollection AddErpIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ErpSettings>(opts =>
        {
            opts.Provider = configuration["ERP_PROVIDER"] ?? "Nebim";
            opts.BaseUrl = configuration["ERP_BASE_URL"] ?? "";
            opts.ApiKey = configuration["ERP_API_KEY"] ?? "";
        });

        var provider = configuration["ERP_PROVIDER"] ?? "Nebim";
        switch (provider.ToUpperInvariant())
        {
            case "SAP":
                services.AddScoped<IERPClient, SapErpClient>();
                services.AddScoped<IOrderExporter, SapErpClient>();
                break;
            case "LOGO":
                services.AddScoped<IERPClient, LogoErpClient>();
                services.AddScoped<IOrderExporter, LogoErpClient>();
                break;
            case "MIKRO":
                services.AddScoped<IERPClient, MikroErpClient>();
                services.AddScoped<IOrderExporter, MikroErpClient>();
                break;
            case "NEBIM":
            default:
                services.AddScoped<IERPClient, NebimErpClient>();
                services.AddScoped<IOrderExporter, NebimErpClient>();
                services.AddScoped<IProductImporter, NebimErpClient>();
                services.AddScoped<IInventorySynchronizer, NebimErpClient>();
                break;
        }

        return services;
    }
}
