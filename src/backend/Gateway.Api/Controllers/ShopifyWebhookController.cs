using HeadlessCommerce.Contracts.Webhooks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadlessCommerce.Gateway.Api.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/webhooks/shopify")]
[Asp.Versioning.ApiVersion("1.0")]
[AllowAnonymous]
public sealed class ShopifyWebhookController(
    IWebhookValidator validator,
    IWebhookEventDispatcher dispatcher,
    IConfiguration configuration,
    ILogger<ShopifyWebhookController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Receive(CancellationToken ct)
    {
        var topic = Request.Headers["X-Shopify-Topic"].FirstOrDefault() ?? "unknown";
        var shop = Request.Headers["X-Shopify-Shop-Domain"].FirstOrDefault() ?? "unknown";
        var hmac = Request.Headers["X-Shopify-Hmac-Sha256"].FirstOrDefault() ?? "";

        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(ct);

        var secret = configuration["SHOPIFY_WEBHOOK_SECRET"] ?? configuration["Shopify:WebhookSecret"] ?? "";
        if (!validator.ValidateHmac(payload, hmac, secret))
        {
            logger.LogWarning("Invalid webhook HMAC for topic {Topic} from {Shop}", topic, shop);
            return Unauthorized();
        }

        var envelope = new WebhookEnvelope
        {
            Topic = topic,
            ShopDomain = shop,
            Payload = payload,
            HmacHeader = hmac
        };

        await dispatcher.DispatchAsync(envelope, ct);
        logger.LogInformation("Webhook {Topic} queued from {Shop}", topic, shop);

        return Ok();
    }
}
