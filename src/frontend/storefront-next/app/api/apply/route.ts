import { NextResponse } from "next/server";
import { BASVURU_ETIKETLERI, dogrulamaYolu } from "@/lib/berber-dogrulama";

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
  /* Berber başvurusu `berber-basvuru` etiketiyle düşüyor: onaylayan kişi
     Shopify panelinde bu etikete göre süzüyor, onaylarken etiketi kademe
     etiketiyle değiştiriyor (bkz. lib/berber-dogrulama.ts). */
  barber: { etiket: BASVURU_ETIKETLERI.alindi, baslik: "Barber / professional application" },
  wholesale: { etiket: "wholesale", baslik: "Wholesale / distributor application" },
  ambassador: { etiket: "ambassador", baslik: "Ambassador / creator application" },
  /* İletişim sayfasındaki form da buradan gidiyor */
  contact: { etiket: "contact", baslik: "Contact form" },
  /* Partner portalının yanındaki hızlı görüşme talebi */
  meeting: { etiket: "quick-meeting", baslik: "Quick meeting request" },
  /* "Stoğa gelince haber ver" — ürün sayfasından */
  restock: { etiket: "stok-bildirim", baslik: "Back-in-stock request" },
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
  // İletişim ve görüşme formunda tek "ad soyad" alanı var; soyad zorunlu değil
  if (!ad || (!soyad && tur !== "contact" && tur !== "meeting" && tur !== "restock")) {
    return NextResponse.json({ error: "Please enter your first and last name." }, { status: 400 });
  }

  const domain = process.env.SHOPIFY_STORE_URL ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
  if (!domain) return NextResponse.json({ error: "Store is not configured." }, { status: 500 });

  /* İşletme doğrulaması artık TEK alan: vergi kimlik numarası (Volkan,
     23 Kas — "üye için sadece VKN sorgulaması olacak"). Eski üç yollu
     belge/kod doğrulaması kaldırıldı; `verifyMethod` gelirse not olarak
     taşınıyor ama hiçbir şey zorunlu kılmıyor.

     Formda da kontrol ediliyor, burada tekrar bakıyoruz çünkü istek
     doğrudan da atılabilir. VKN 10, TC kimlik 11 hane. */
  const yol = dogrulamaYolu(govde.verifyMethod);
  if (tur === "barber" || tur === "wholesale") {
    const vkn = (govde.taxNumber ?? "").replace(/\D/g, "");
    if (!vkn) {
      return NextResponse.json({ error: "Please enter your tax number." }, { status: 400 });
    }
    if (vkn.length !== 10 && vkn.length !== 11) {
      return NextResponse.json(
        { error: "A tax number is 10 digits; a personal ID number is 11." },
        { status: 400 },
      );
    }
  }

  // Serbest alanlar tek bir nota toplanıyor: Shopify müşteri formunda her alan
  // için ayrı bir yer yok, hepsi mesaj gövdesinde taşınıyor.
  const alanlar: [string, string][] = [
    ["Application", TURLER[tur].baslik],
    /* Onaylayan kişi doğrulama adresini aramak zorunda kalmasın: hangi yol,
       hangi kod ve nereden sorgulanacağı notta birlikte duruyor. */
    ["Verification method", yol ? yol.ad : ""],
    ["Tax number", govde.taxNumber ?? ""],
    ["Verification code", govde.verifyCode ?? ""],
    ["Verify at", yol ? yol.resmiSayfa : ""],
    ["Subject", govde.subject ?? ""],
    ["Program", govde.program ?? ""],
    ["Business", govde.business ?? ""],
    ["Role", govde.role ?? ""],
    ["Website / social", govde.website ?? ""],
    ["Country", govde.country ?? ""],
    ["City", govde.city ?? ""],
    ["Phone", govde.phone ?? ""],
    ["Preferred time", govde.preferredTime ?? ""],
    /* Stok bildiriminde hangi ürünün beklendiği notta yazıyor */
    ["Product", govde.product ?? ""],
    ["Product handle", govde.productHandle ?? ""],
    ["Variant", govde.variant ?? ""],
    ["Monthly volume", govde.volume ?? ""],
    ["Audience / following", govde.audience ?? ""],
    ["Content focus", govde.focus ?? ""],
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
