import { NextResponse } from "next/server";
import { getTrProvinces } from "@/lib/tr-address-server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ provinces: getTrProvinces() });
}
