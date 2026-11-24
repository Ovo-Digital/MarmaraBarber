"use client";

/**
 * Sepette kademe indiriminin görünen satırı.
 *
 * Shopify'ın sepete gerçekten uyguladığı indirimi gösteriyor: ara toplam ile
 * toplam arasındaki fark. Uydurma bir hesap değil — kasada inen tutarın
 * aynısı. İndirim kodu bir sebeple geçmediyse (ör. kod silinmiş) satır
 * çıkmıyor, böylece olmayan bir kazanç vaat edilmiyor.
 */

import { KADEMELER, kademeBul } from "@/lib/berber";
import { useT } from "@/lib/i18n/dil";
import { formatMoney } from "@/lib/money";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

export function BerberSepetNotu({ koyu = false }: { koyu?: boolean }) {
  const t = useT();
  const musteri = useAuthStore((s) => s.customer);
  const kademe = kademeBul(musteri);
  const araToplam = useShopifyCartStore((s) => s.subtotalAmount);
  const toplam = useShopifyCartStore((s) => s.totalAmount);
  const kodlar = useShopifyCartStore((s) => s.discountCodes);
  const paraBirimi = useShopifyCartStore((s) => s.currencyCode);

  if (!kademe) return null;

  const kademeKodlari = new Set(KADEMELER.map((k) => k.indirimKodu.toUpperCase()));
  const indi = kodlar.some((d) => d.applicable && kademeKodlari.has(d.code.toUpperCase()));
  const kazanc = araToplam - toplam;
  if (!indi || kazanc <= 0) return null;

  return (
    <div
      className="flex items-center justify-between gap-4 py-2.5 text-[13px]"
      style={{ color: koyu ? "rgba(255,255,255,0.78)" : "rgba(20,17,15,0.7)" }}
    >
      <span>
        {t("{tier} partner discount", { tier: t(kademe.ad) })}{" "}
        <span style={{ color: koyu ? "rgba(255,255,255,0.45)" : "rgba(20,17,15,0.45)" }}>−{kademe.indirim}%</span>
      </span>
      <span style={{ color: "var(--sg-red)", fontWeight: 600 }}>−{formatMoney(kazanc, paraBirimi)}</span>
    </div>
  );
}
