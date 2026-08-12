import { NextRequest } from "next/server";
import { getCustomerTokenFromCookies } from "@/lib/auth-cookies";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createShopifyServerClient } from "@/lib/shopify-server";
import { customerAddressCreate } from "@/services/shopify/customer-operations";
import type { CustomerAddress } from "@/types/customer";

export async function POST(req: NextRequest) {
  try {
    const token = await getCustomerTokenFromCookies();
    if (!token) return apiError(new Error("Oturum açık değil"), 401);

    const address = (await req.json()) as Omit<CustomerAddress, "id">;
    const client = createShopifyServerClient();
    const created = await customerAddressCreate(client, token, address);
    return apiSuccess(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
