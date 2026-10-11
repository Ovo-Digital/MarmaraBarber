/**
 * Revize görselini revize reposuna uploads/ altına yükler, issue'da
 * gömülecek adresi döner. Token izni: Contents Read & write (aynı repo).
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO = process.env.REVIZE_REPO || "volkankockan-ovo/marmara-b2c-revizeler";

export async function POST(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Sunucuda GITHUB_TOKEN tanımlı değil." }, { status: 503 });
  }

  let govde: { data?: string } | null = null;
  try {
    govde = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(govde?.data ?? "");
  if (!m) return NextResponse.json({ error: "Geçersiz görsel." }, { status: 400 });
  if (m[2].length > 3_000_000) return NextResponse.json({ error: "Görsel çok büyük." }, { status: 413 });

  const uzanti = m[1] === "jpeg" ? "jpg" : m[1];
  const gun = new Date().toISOString().slice(0, 10);
  const yol = `uploads/${gun}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${uzanti}`;

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${yol}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "marmara-b2c-revize",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Revize görseli", content: m[2] }),
  });
  if (!r.ok) {
    return NextResponse.json({ error: `GitHub ${r.status}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, url: `https://github.com/${REPO}/raw/main/${yol}` });
}
