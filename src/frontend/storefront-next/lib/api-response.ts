import { NextResponse } from "next/server";
import { ShopifyUserError } from "@/lib/shopify-errors";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(error: unknown, status = 400) {
  const message = error instanceof ShopifyUserError
    ? error.message
    : error instanceof Error
      ? error.message
      : "Beklenmeyen bir hata oluştu";
  return NextResponse.json({ success: false, error: message }, { status });
}
