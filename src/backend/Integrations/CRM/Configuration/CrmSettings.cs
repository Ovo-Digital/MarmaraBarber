namespace HeadlessCommerce.Integrations.CRM.Configuration;

public sealed class CrmSettings
{
    public string Provider { get; set; } = "Hubspot";
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}
