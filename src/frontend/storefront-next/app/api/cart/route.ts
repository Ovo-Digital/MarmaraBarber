import { NextRequest } from "next/server";
import { getCustomerTokenFromCookies } from "@/lib/auth-cookies";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createShopifyServerClient } from "@/lib/shopify-server";
import * as cartOps from "@/services/shopify/cart-operations";

async function maybeAttachCustomer(cart: Awaited<ReturnType<typeof cartOps.cartCreate>>, customerToken?: string) {
  if (!customerToken) return cart;
  const client = createShopifyServerClient();
  return cartOps.cartAttachCustomer(client, cart.id, customerToken);
}

export async function GET(req: NextRequest) {
  try {
    const cartId = req.nextUrl.searchParams.get("cartId");
    if (!cartId) return apiError(new Error("cartId gerekli"), 400);

    const client = createShopifyServerClient();
    const cart = await cartOps.cartGet(client, cartId);
    if (!cart) return apiError(new Error("Sepet bulunamadı"), 404);
    return apiSuccess(cart);
  } catch (error) {
    return apiError(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      op: string;
      cartId?: string;
      variantId?: string;
      lineId?: string;
      lineIds?: string[];
      quantity?: number;
    };

    const client = createShopifyServerClient();
    const customerToken = await getCustomerTokenFromCookies();

    switch (body.op) {
      case "create": {
        const cart = await maybeAttachCustomer(await cartOps.cartCreate(client), customerToken);
        return apiSuccess(cart);
      }
      case "add": {
        if (!body.cartId || !body.variantId) return apiError(new Error("cartId ve variantId gerekli"), 400);
        const cart = await maybeAttachCustomer(
          await cartOps.cartAddLine(client, body.cartId, body.variantId, body.quantity ?? 1),
          customerToken
        );
        return apiSuccess(cart);
      }
      case "update": {
        if (!body.cartId || !body.lineId || body.quantity === undefined) {
          return apiError(new Error("cartId, lineId ve quantity gerekli"), 400);
        }
        const cart = await cartOps.cartUpdateLine(client, body.cartId, body.lineId, body.quantity);
        return apiSuccess(cart);
      }
      case "remove": {
        if (!body.cartId || !body.lineIds?.length) return apiError(new Error("cartId ve lineIds gerekli"), 400);
        const cart = await cartOps.cartRemoveLines(client, body.cartId, body.lineIds);
        return apiSuccess(cart);
      }
      case "attachCustomer": {
        if (!body.cartId) return apiError(new Error("cartId gerekli"), 400);
        if (!customerToken) return apiError(new Error("Oturum açmanız gerekli"), 401);
        const cart = await cartOps.cartAttachCustomer(client, body.cartId, customerToken);
        return apiSuccess(cart);
      }
      default:
        return apiError(new Error("Geçersiz işlem"), 400);
    }
  } catch (error) {
    return apiError(error, 500);
  }
}
