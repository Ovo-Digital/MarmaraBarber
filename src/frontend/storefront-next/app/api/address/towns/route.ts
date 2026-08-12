import { NextResponse } from "next/server";
import { getTrTownsByProvince } from "@/lib/tr-address-server";

export async function GET(request: Request) {
  const province = new URL(request.url).searchParams.get("province")?.trim();
  if (!province) {
    return NextResponse.json({ error: "province parametresi gerekli" }, { status: 400 });
  }

  const towns = getTrTownsByProvince(province);
  return NextResponse.json({ towns });
}
