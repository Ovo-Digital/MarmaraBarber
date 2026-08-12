namespace HeadlessCommerce.Integrations.Marketing.Configuration;

public sealed class MarketingSettings
{
    public string Provider { get; set; } = "Klaviyo";
    public string ApiKey { get; set; } = string.Empty;
}
