"use client";

/**
 * Başvurunun nerede olduğunu gösteren şerit.
 *
 * Doğrulamayı insan yapıyor (resmi sayfalar API vermiyor), yani arada bir
 * bekleme var. Bekleyen adam ekranda hiçbir şey görmezse "başvurum gitti mi,
 * indirimim nerede" diye yazıyor. Üç adımı ve hangisinde olduğunu
 * gösteriyoruz; onay gelene kadar perakende fiyatın geçerli olduğunu da
 * burada söylüyoruz ki sepete bakınca şaşırmasın.
 *
 * Durumu açan şey Shopify müşteri etiketi — onaylayan kişi panelden
 * etiketi değiştiriyor, burası kendiliğinden ilerliyor.
 */

import Link from "next/link";
import {
  BASVURU_ADIMLARI,
  basvuruBekliyor,
  type BasvuruDurumu,
} from "@/lib/berber-dogrulama";
import { useT } from "@/lib/i18n/dil";
import "@/components/slick/berber.css";

export function BerberBasvuruDurumu({
  durum,
  /** Hesabın e-postası — hangi hesabı beklettiğimiz belli olsun */
  email,
  koyu = true,
}: {
  durum: BasvuruDurumu;
  email?: string;
  koyu?: boolean;
}) {
  const t = useT();

  if (durum === "yok" || durum === "onayli") return null;

  /* Reddedilen başvuru şeride girmiyor: adım adım ilerleyen bir şey yok,
     tek cümle ve bir çıkış yolu daha anlamlı. */
  if (durum === "red") {
    return (
      <div className="brb-bsv" data-koyu={koyu ? "" : undefined}>
        <p className="brb-bsv-ust">{t("Application closed")}</p>
        <p className="brb-bsv-metin">
          {t(
            "We couldn't verify this application. If you think something was missing, write to us and we'll look again.",
          )}
        </p>
        <Link href="/iletisim" className="lx-btn-outline mt-6" style={koyu ? { color: "#fff" } : undefined}>
          {t("Talk to us")}
        </Link>
      </div>
    );
  }

  const suAnki = BASVURU_ADIMLARI.findIndex((a) => a.durum === durum);

  return (
    <div className="brb-bsv" data-koyu={koyu ? "" : undefined}>
      <p className="brb-bsv-ust">{t("Barber application")}</p>
      {email ? <p className="brb-bsv-email">{email}</p> : null}

      <ol className="brb-bsv-adimlar">
        {BASVURU_ADIMLARI.map((adim, i) => (
          <li
            key={adim.durum}
            className="brb-bsv-adim"
            data-gecti={i < suAnki ? "" : undefined}
            data-suanki={i === suAnki ? "" : undefined}
            aria-current={i === suAnki ? "step" : undefined}
          >
            <span aria-hidden="true" className="brb-bsv-no">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="brb-bsv-ad">{t(adim.ad)}</span>
            <span className="brb-bsv-aciklama">{t(adim.metin)}</span>
          </li>
        ))}
      </ol>

      {basvuruBekliyor(durum) ? (
        <p className="brb-bsv-not">
          {t("Until it is approved your account stays on retail pricing.")}
        </p>
      ) : null}
    </div>
  );
}
