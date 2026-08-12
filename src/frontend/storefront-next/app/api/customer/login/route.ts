import { NextRequest, NextResponse } from "next/server";
import { setCustomerTokenCookie } from "@/lib/auth-cookies";
import { apiError } from "@/lib/api-response";
import { createShopifyServerClient } from "@/lib/shopify-server";
import * as cartOps from "@/services/shopify/cart-operations";
import { customerGet, customerLogin } from "@/services/shopify/customer-operations";

export async function POST(req: NextRequest) {
  try {
    const { email, password, cartId } = (await req.json()) as {
      email: string;
      password: string;
      cartId?: string;
    };

    if (!email || !password) return apiError(new Error("E-posta ve şifre gerekli"), 400);

    const client = createShopifyServerClient();
    const { accessToken, expiresAt } = await customerLogin(client, email, password);
    const customer = await customerGet(client, accessToken);
    if (!customer) return apiError(new Error("Müşteri bilgisi alınamadı"), 500);

    if (cartId) {
      await cartOps.cartAttachCustomer(client, cartId, accessToken);
    }

    const response = NextResponse.json({ success: true, data: { customer } });
    setCustomerTokenCookie(response, accessToken, expiresAt);
    return response;
  } catch (error) {
    return apiError(error, 401);
  }
}
