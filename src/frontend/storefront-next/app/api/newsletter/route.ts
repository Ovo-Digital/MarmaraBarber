import { NextResponse } from "next/server";

/**
 * Bülten kaydı.
 *
 * Storefront API'de "bültene kaydet" diye bir mutation yok. Shopify'ın kendi
 * müşteri formu uç noktası (/contact, form_type=customer) bunun standart yolu:
 * e-posta mağazanın müşteri listesine "newsletter" etiketiyle düşer, oradan
 * Shopify Email / Klaviyo ne kullanılıyorsa ona akar.
 *
 * Mağaza adresi ortam değişkeninden; kodda hiçbir mağazaya özel değer yok.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Sunucu tarafında da doğrula — tarayıcı doğrulaması atlanabilir.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const domain = process.env.SHOPIFY_STORE_URL ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
  if (!domain) {
    return NextResponse.json({ error: "Store is not configured." }, { status: 500 });
  }

  const form = new URLSearchParams({
    form_type: "customer",
    utf8: "✓",
    "contact[email]": email,
    "contact[tags]": "newsletter",
    "contact[accepts_marketing]": "true",
  });

  try {
    const res = await fetch(`https://${domain}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      redirect: "manual",
      cache: "no-store",
    });

    // Shopify başarıda yönlendirir (302); 200 de kabul.
    if (res.status >= 400) {
      return NextResponse.json({ error: "Sign-up is unavailable right now." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sign-up is unavailable right now." }, { status: 502 });
  }
}
