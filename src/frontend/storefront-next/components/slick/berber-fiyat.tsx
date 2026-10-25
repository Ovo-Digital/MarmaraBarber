"use client";

/**
 * Ürün sayfasındaki berber fiyatı satırı.
 *
 * Giriş yapmış berber kendi kademe fiyatını perakende fiyatın altında
 * görüyor. Bu sayı yalnızca GÖSTERİM: indirimi gerçekten uygulayan şey
 * sepete inen Shopify indirim kodu (bkz. lib/berber.ts). Oran iki yerde de
 * aynı olduğu için ekrandaki fiyatla kasadaki fiyat örtüşüyor; oran
 * Shopify'da değişirse lib/berber.ts da değişmeli.
 *
 * Berber olmayan ziyaretçiye tek satırlık sessiz bir davet çıkıyor —
 * ürün sayfasını kalabalıklaştırmayacak kadar küçük.
 */

import Link from "next/link";
import { KADEMELER, kademeBul } from "@/lib/berber";
import { useT } from "@/lib/i18n/dil";
import { formatMoney } from "@/lib/money";
import { useAuthStore } from "@/store/auth-store";

/** Davet satırında yazan oran: en üst kademenin oranı */
const EN_IYI_ORAN = Math.max(...KADEMELER.map((k) => k.indirim));

export function BerberFiyat({
  fiyat,
  paraBirimi,
  /** Berber olmayana davet satırı gösterilsin mi */
  davet = true,
}: {
  fiyat: number;
  paraBirimi: string;
  davet?: boolean;
}) {
  const t = useT();
  const musteri = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);
  const kademe = kademeBul(musteri);

  /* Oturum çözülmeden fiyat iddia etme: yanlış fiyat bir an bile görünmesin */
  if (!hydrated) return null;

  if (!kademe) {
    if (!davet) return null;
    return (
      <p className="mt-2 text-[12px]" style={{ color: "rgba(20,17,15,0.5)" }}>
        {t("Barber or shop owner?")}{" "}
        <Link href="/berber" className="underline underline-offset-4" style={{ color: "var(--lx-ink)" }}>
          {t("Get up to −{rate}% on the range", { rate: String(EN_IYI_ORAN) })}
        </Link>
      </p>
    );
  }

  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-2 text-[13px]">
      <span style={{ fontFamily: "var(--font-owners)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(20,17,15,0.5)" }}>
        {t("{tier} price", { tier: t(kademe.ad) })}
      </span>
      <b style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: 18, color: "var(--sg-red)" }}>
        {formatMoney(fiyat * (1 - kademe.indirim / 100), paraBirimi)}
      </b>
      <span style={{ color: "rgba(20,17,15,0.5)" }}>{t("−{rate}%, applied at checkout", { rate: String(kademe.indirim) })}</span>
    </p>
  );
}
