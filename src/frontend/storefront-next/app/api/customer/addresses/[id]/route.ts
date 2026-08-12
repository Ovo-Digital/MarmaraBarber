import { NextRequest } from "next/server";
import { getCustomerTokenFromCookies } from "@/lib/auth-cookies";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createShopifyServerClient } from "@/lib/shopify-server";
import { customerAddressDelete, customerAddressUpdate } from "@/services/shopify/customer-operations";
import type { CustomerAddress } from "@/types/customer";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const token = await getCustomerTokenFromCookies();
    if (!token) return apiError(new Error("Oturum açık değil"), 401);

    const { id } = await context.params;
    const address = (await req.json()) as Omit<CustomerAddress, "id">;
    const client = createShopifyServerClient();
    const updated = await customerAddressUpdate(client, token, id, address);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const token = await getCustomerTokenFromCookies();
    if (!token) return apiError(new Error("Oturum açık değil"), 401);

    const { id } = await context.params;
    const client = createShopifyServerClient();
    await customerAddressDelete(client, token, id);
    return apiSuccess({ ok: true as const });
  } catch (error) {
    return apiError(error, 400);
  }
}
