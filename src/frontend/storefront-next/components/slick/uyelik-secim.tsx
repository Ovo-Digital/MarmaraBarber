"use client";

/**
 * Üyelik yolu seçimi — /uye-ol ve /login sayfalarının üstünde duruyor.
 *
 * İki hesap türü var ve koşulları farklı: normal müşteri formu doldurup
 * anında hesap açıyor, berber başvuru veriyor ve onaydan sonra kademesi
 * giriliyor. Bu yüzden iki yolu aynı formda birleştirmek yerine en başta
 * ayırıyoruz — berber yanlış formu doldurup "indirimim nerede" diye
 * sormasın.
 *
 * Bulunulan sayfanın kartı seçili görünüyor, diğeri bağlantı.
 */

import Link from "next/link";
import { useT } from "@/lib/i18n/dil";
import "@/components/slick/berber.css";

export function UyelikSecim({
  /** Hangi yol seçili: bulunulan sayfa */
  aktif,
  /** Giriş sayfasında mı — başlıklar "giriş yap" diye değişiyor */
  giris = false,
  /**
   * Verilirse kartlar bağlantı değil düğme olur ve seçim AYNI SAYFADA
   * yapılır. Üye ol ekranında böyle: berberi uzun tanıtım sayfasına
   * atmak yerine formu yerinde değiştiriyoruz.
   */
  onSec,
}: {
  aktif: "musteri" | "berber";
  giris?: boolean;
  onSec?: (yol: "musteri" | "berber") => void;
}) {
  const t = useT();

  const yollar = [
    {
      kod: "musteri" as const,
      baslik: t("I'm a customer"),
      metin: giris
        ? t("Your orders, addresses and wishlist.")
        : t("Shop for yourself. Retail pricing, instant account."),
      href: giris ? "/login" : "/uye-ol",
    },
    {
      kod: "berber" as const,
      baslik: t("I'm a barber"),
      metin: giris
        ? t("Tier pricing, your stand and loyalty points.")
        : t("Order for your shop. Barber pricing after approval."),
      href: giris ? "/berber?tab=login#portal" : "/berber#portal",
    },
  ];

  return (
    <div className="brb-yol" role="group" aria-label={t("Account type")}>
      {yollar.map((y) => {
        const secili = y.kod === aktif;
        const ic = (
          <>
            <span className="brb-yol-baslik">{y.baslik}</span>
            <span className="brb-yol-metin">{y.metin}</span>
            {secili ? null : <span aria-hidden="true" className="brb-yol-ok">→</span>}
          </>
        );

        if (onSec) {
          return (
            <button
              key={y.kod}
              type="button"
              onClick={() => onSec(y.kod)}
              className="brb-yol-kart"
              data-secili={secili ? "" : undefined}
              aria-pressed={secili}
            >
              {ic}
            </button>
          );
        }

        return secili ? (
          <span key={y.kod} className="brb-yol-kart" data-secili="" aria-current="page">
            {ic}
          </span>
        ) : (
          <Link key={y.kod} href={y.href} className="brb-yol-kart">
            {ic}
          </Link>
        );
      })}
    </div>
  );
}
