import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CUSTOMER_TOKEN_COOKIE } from "@/lib/shopify-server";

export async function getCustomerTokenFromCookies(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(CUSTOMER_TOKEN_COOKIE)?.value;
}

export function setCustomerTokenCookie(response: NextResponse, accessToken: string, expiresAt: string) {
  response.cookies.set(CUSTOMER_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearCustomerTokenCookie(response: NextResponse) {
  response.cookies.set(CUSTOMER_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
