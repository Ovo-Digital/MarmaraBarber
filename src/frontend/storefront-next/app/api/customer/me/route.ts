import { NextRequest } from "next/server";
import { getCustomerTokenFromCookies } from "@/lib/auth-cookies";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createShopifyServerClient } from "@/lib/shopify-server";
import { customerGet, customerUpdate } from "@/services/shopify/customer-operations";

export async function GET() {
  try {
    const token = await getCustomerTokenFromCookies();
    if (!token) return apiError(new Error("You are not signed in."), 401);

    const client = createShopifyServerClient();
    const customer = await customerGet(client, token);
    if (!customer) return apiError(new Error("Your session has expired. Please sign in again."), 401);

    return apiSuccess(customer);
  } catch (error) {
    return apiError(error, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getCustomerTokenFromCookies();
    if (!token) return apiError(new Error("You are not signed in."), 401);

    const body = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    const client = createShopifyServerClient();
    const customer = await customerUpdate(client, token, body);
    return apiSuccess(customer);
  } catch (error) {
    return apiError(error, 400);
  }
}
