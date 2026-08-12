namespace HeadlessCommerce.Integrations.ERP.Configuration;

public sealed class ErpSettings
{
    public string Provider { get; set; } = "Nebim";
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}
