import { NextResponse } from "next/server";
import { clearCustomerTokenCookie } from "@/lib/auth-cookies";

export async function POST() {
  const response = NextResponse.json({ success: true, data: { ok: true as const } });
  clearCustomerTokenCookie(response);
  return response;
}
