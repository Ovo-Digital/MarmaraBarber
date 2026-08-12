using HeadlessCommerce.Contracts.Integrations.CRM;
using HeadlessCommerce.Integrations.CRM.Adapters;
using HeadlessCommerce.Integrations.CRM.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HeadlessCommerce.Integrations.CRM;

public static class DependencyInjection
{
    public static IServiceCollection AddCrmIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CrmSettings>(opts =>
        {
            opts.Provider = configuration["CRM_PROVIDER"] ?? "Hubspot";
            opts.BaseUrl = configuration["CRM_BASE_URL"] ?? "";
            opts.ApiKey = configuration["CRM_API_KEY"] ?? "";
        });

        var provider = configuration["CRM_PROVIDER"] ?? "Hubspot";
        switch (provider.ToUpperInvariant())
        {
            case "SALESFORCE":
                services.AddScoped<ICustomerExporter, SalesforceCrmClient>();
                services.AddScoped<ICustomerSynchronizer, SalesforceCrmClient>();
                services.AddScoped<IEventPublisher, SalesforceCrmClient>();
                break;
            case "INSIDER":
                services.AddScoped<ICustomerExporter, InsiderCrmClient>();
                services.AddScoped<ICustomerSynchronizer, InsiderCrmClient>();
                services.AddScoped<IEventPublisher, InsiderCrmClient>();
                break;
            case "HUBSPOT":
            default:
                services.AddScoped<ICustomerExporter, HubspotCrmClient>();
                services.AddScoped<ICustomerSynchronizer, HubspotCrmClient>();
                services.AddScoped<IEventPublisher, HubspotCrmClient>();
                break;
        }

        return services;
    }
}
