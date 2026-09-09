import { NextResponse } from "next/server";

/**
 * Berber ve toptan başvuruları.
 *
 * Storefront API'de "başvuru" diye bir kayıt yok. Başvuran kişi Shopify'ın
 * kendi müşteri formu ucuna (/contact) etiketle yazılıyor: `barber` ya da
 * `wholesale`. Böylece mağaza sahibi Shopify panelinden etikete göre
 * süzebiliyor, ek bir araç ya da abonelik gerekmiyor.
 *
 * Mağaza adresi ortam değişkeninden geliyor; kodda hiçbir mağazaya özel
 * değer yok.
 */

const TURLER = {
  barber: { etiket: "barber", baslik: "Barber / professional application" },
  wholesale: { etiket: "wholesale", baslik: "Wholesale / distributor application" },
} as const;

type Tur = keyof typeof TURLER;

export async function POST(request: Request) {
  let govde: Record<string, string> = {};
  try {
    govde = (await request.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const tur = govde.type as Tur;
  if (!TURLER[tur]) return NextResponse.json({ error: "Unknown application type." }, { status: 400 });

  const email = (govde.email ?? "").trim();
  const ad = (govde.firstName ?? "").trim();
  const soyad = (govde.lastName ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!ad || !soyad) {
    return NextResponse.json({ error: "Please enter your first and last name." }, { status: 400 });
  }

  const domain = process.env.SHOPIFY_STORE_URL ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
  if (!domain) return NextResponse.json({ error: "Store is not configured." }, { status: 500 });

  // Serbest alanlar tek bir nota toplanıyor: Shopify müşteri formunda her alan
  // için ayrı bir yer yok, hepsi mesaj gövdesinde taşınıyor.
  const alanlar: [string, string][] = [
    ["Application", TURLER[tur].baslik],
    ["Business", govde.business ?? ""],
    ["Role", govde.role ?? ""],
    ["Website / social", govde.website ?? ""],
    ["Country", govde.country ?? ""],
    ["City", govde.city ?? ""],
    ["Phone", govde.phone ?? ""],
    ["Monthly volume", govde.volume ?? ""],
    ["Message", govde.message ?? ""],
  ];
  const not = alanlar
    .filter(([, v]) => v.trim().length > 0)
    .map(([k, v]) => `${k}: ${v.trim()}`)
    .join("\n");

  const form = new URLSearchParams({
    form_type: "contact",
    utf8: "✓",
    "contact[email]": email,
    "contact[first_name]": ad,
    "contact[last_name]": soyad,
    "contact[phone]": govde.phone ?? "",
    "contact[tags]": TURLER[tur].etiket,
    "contact[body]": not,
  });

  try {
    const res = await fetch(`https://${domain}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      redirect: "manual",
      cache: "no-store",
    });
    if (res.status >= 400) {
      return NextResponse.json({ error: "We couldn't send your application right now." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn't send your application right now." }, { status: 502 });
  }
}
