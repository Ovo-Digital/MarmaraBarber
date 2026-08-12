import { NextRequest, NextResponse } from "next/server";
import { setCustomerTokenCookie } from "@/lib/auth-cookies";
import { apiError } from "@/lib/api-response";
import { createShopifyServerClient } from "@/lib/shopify-server";
import * as cartOps from "@/services/shopify/cart-operations";
import { customerGet, customerLogin, customerRegister, customerUpdate } from "@/services/shopify/customer-operations";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      acceptsMarketing?: boolean;
      cartId?: string;
    };

    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return apiError(new Error("Tüm zorunlu alanları doldurun"), 400);
    }

    const client = createShopifyServerClient();
    await customerRegister(client, {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      acceptsMarketing: body.acceptsMarketing ?? false,
    });

    const { accessToken, expiresAt } = await customerLogin(client, body.email, body.password);

    if (body.phone?.trim()) {
      await customerUpdate(client, accessToken, { phone: body.phone.trim() });
    }

    const customer = await customerGet(client, accessToken);
    if (!customer) return apiError(new Error("Müşteri bilgisi alınamadı"), 500);

    if (body.cartId) {
      await cartOps.cartAttachCustomer(client, body.cartId, accessToken);
    }

    const response = NextResponse.json({ success: true, data: { customer } });
    setCustomerTokenCookie(response, accessToken, expiresAt);
    return response;
  } catch (error) {
    return apiError(error, 400);
  }
}
