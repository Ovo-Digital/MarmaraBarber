"use client";

/**
 * PARTNER sayfası — TASLAK (ilk iki ekran).
 *
 * Şu anki /wholesale 4845 piksel uzunluğunda ama içinde 272 kelime var:
 * dört program satırı birebir aynı kalıpta (başlık + cümle + 4 madde +
 * düğme), üçünün fotoğrafı yok ve yerinde dev gri numaralar duruyor.
 * Volkan "çok kötü" dedi, haklı.
 *
 * Bu taslak KANAR oturumunun verdiği yönü uyguluyor:
 *   - madde listesi yerine ETKİLEŞİM (hesaplayıcı)
 *   - dört program yerine İKİ YOL: tek nokta / dağıtım
 *   - seçim adrese yazılıyor (?yol=nokta|dagitim) ki reklam doğrudan
 *     doğru yola bağlanabilsin
 *   - üst başlık (eyebrow), çizgi ikon, serif italik vurgu YOK
 *   - fotoğraf olmayan yerde dev numara değil, gerçek ürün fotoğrafı
 *
 * ⚠️ HESAPLAYICI VARSAYIMLARI YER TUTUCU. Berber indirim oranı
 * lib/berber.ts içinde hâlâ yer tutucu (%10/15/20); marka kendi oranını
 * verince ikisi birlikte değişecek. Ekranda da "örnek" diye yazıyor ki
 * kimse bunu taahhüt sanmasın.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { KADEMELER, kademeFiyati } from "@/lib/berber";
import { useT } from "@/lib/i18n/dil";
import { formatMoney } from "@/lib/money";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import type { Product } from "@/types/commerce";
import "@/components/slick/partner.css";

type Yol = "nokta" | "dagitim";

/** Ayda kaç hafta — 52/12 */
const HAFTA = 4.33;
/** Başlangıç kitinde kaç ürün var */
const KIT_ADET = 8;

export function PartnerTaslak({ urunler }: { urunler: Product[] }) {
  useKoyuUstBildir();
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();

  const yol: Yol | null =
    params.get("yol") === "nokta" ? "nokta" : params.get("yol") === "dagitim" ? "dagitim" : null;

  const yolSec = useCallback(
    (yeni: Yol) => {
      router.replace(`/wholesale/taslak?yol=${yeni}`, { scroll: false });
      /* Seçimden sonra içerik aşağıda açılıyor; oraya kendimiz indiriyoruz
         ki kullanıcı "bir şey oldu mu" diye bakmasın. */
      requestAnimationFrame(() => {
        document.getElementById("yol-icerik")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [router],
  );

  /* ── Hesaplayıcı ──────────────────────────────────────────────────── */
  const [musteri, setMusteri] = useState(150); // haftalık müşteri
  const [onda, setOnda] = useState(1); // her 10 müşteriden kaçı ürün alıyor

  const enIyi = KADEMELER[KADEMELER.length - 1];

  /* Gerçek Shopify fiyatları: ortalama perakende fiyat ve berber fiyatı.
     Ürün gelmezse hesaplayıcı hiç gösterilmiyor — uydurma rakam yok. */
  const fiyat = useMemo(() => {
    const satilabilir = urunler.filter((u) => u.price > 0);
    if (!satilabilir.length) return null;
    const ortalama = satilabilir.reduce((a, u) => a + u.price, 0) / satilabilir.length;
    return {
      perakende: ortalama,
      berber: kademeFiyati(ortalama, enIyi),
      kar: ortalama - kademeFiyati(ortalama, enIyi),
      currencyCode: satilabilir[0].currencyCode,
    };
  }, [urunler, enIyi]);

  const aylikAdet = Math.round(musteri * (onda / 10) * HAFTA);
  const aylikKar = fiyat ? aylikAdet * fiyat.kar : 0;
  const kitTutari = fiyat ? KIT_ADET * fiyat.berber : 0;

  const kitUrunleri = urunler.slice(0, KIT_ADET);

  return (
    <>
      {/* ── 1. Açılış ─────────────────────────────────────────────────── */}
      <section data-dark-top className="pt-giris">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/learn-the-craft.jpg" alt="" aria-hidden="true" className="pt-giris-foto" />
        <div className="pt-giris-perde" aria-hidden="true" />
        <div className="sg-container pt-giris-ic">
          <h1 className="pt-dev">
            {t("Marmara Barber")}
            <br />
            {t("behind your chair")}
          </h1>
          <p className="pt-giris-alt">
            {t("Own production since 1970. Barber pricing, a stand built for your shop, one contact.")}
          </p>
        </div>
      </section>

      {/* ── 2. İki yol ────────────────────────────────────────────────── */}
      <section className="pt-yollar">
        {(
          [
            {
              kod: "nokta" as const,
              baslik: t("I have a shop"),
              metin: t("A barbershop, a store or an academy. One address, regular orders."),
              foto: "/media/learn-the-craft.jpg",
            },
            {
              kod: "dagitim" as const,
              baslik: t("I want to distribute"),
              metin: t("Represent the range across a country or a region."),
              foto: undefined,
            },
          ] as const
        ).map((y) => (
          <button
            key={y.kod}
            type="button"
            onClick={() => yolSec(y.kod)}
            className="pt-yol"
            data-secili={yol === y.kod ? "" : undefined}
            aria-pressed={yol === y.kod}
          >
            {y.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={y.foto} alt="" aria-hidden="true" className="pt-yol-foto" />
            ) : (
              /* Marka fotoğrafı yok. Ürün fotoğrafları da burada işe yaramıyor:
                 Shopify'daki kareler BEYAZ FONLU, koyu zeminde beyaz dikdörtgen
                 gibi duruyorlar. Dev gri numara da koymuyoruz (eski sayfanın
                 hatası oydu) — sade koyu bir yüzey, altında kırmızı vurgu. */
              <span className="pt-yol-koyu" aria-hidden="true" />
            )}
            <span className="pt-yol-perde" aria-hidden="true" />
            <span className="pt-yol-ic">
              <span className="pt-yol-baslik">{y.baslik}</span>
              <span className="pt-yol-metin">{y.metin}</span>
            </span>
          </button>
        ))}
      </section>

      {/* ── 3. Seçilen yolun içeriği ──────────────────────────────────── */}
      <section id="yol-icerik" className="pt-icerik">
        {yol === null ? (
          <p className="sg-container pt-bos">{t("Pick one above to see what it looks like.")}</p>
        ) : yol === "dagitim" ? (
          <div className="sg-container pt-yakinda">
            <h2 className="pt-baslik">{t("Distribution")}</h2>
            <p className="pt-yakinda-metin">
              {t("Market map, the full range, what we put behind you, and the application — coming in the next draft.")}
            </p>
          </div>
        ) : !fiyat ? (
          <p className="sg-container pt-bos">{t("Products are loading.")}</p>
        ) : (
          <>
            {/* 3a. Hesaplayıcı — madde listesinin yerine geçen şey */}
            <div className="sg-container pt-hesap">
              <h2 className="pt-baslik">{t("What a shelf is worth")}</h2>

              <div className="pt-hesap-govde">
                <div className="pt-hesap-sol">
                  <label className="pt-surgu">
                    <span className="pt-surgu-ust">
                      <span>{t("Customers a week")}</span>
                      <b>{musteri}</b>
                    </span>
                    <input
                      type="range"
                      min={20}
                      max={600}
                      step={10}
                      value={musteri}
                      onChange={(e) => setMusteri(Number(e.target.value))}
                    />
                  </label>

                  <label className="pt-surgu">
                    <span className="pt-surgu-ust">
                      <span>{t("Of every 10, how many buy something")}</span>
                      <b>{onda}</b>
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={onda}
                      onChange={(e) => setOnda(Number(e.target.value))}
                    />
                  </label>

                  <p className="pt-varsayim">
                    {t("Based on the average price of our range and the best barber rate. Rates are not final yet.")}
                  </p>
                </div>

                <div className="pt-hesap-sag">
                  <div className="pt-sonuc">
                    <span className="pt-sonuc-rakam">{formatMoney(aylikKar, fiyat.currencyCode)}</span>
                    <span className="pt-sonuc-ad">{t("extra a month, on the shelf")}</span>
                  </div>
                  <div className="pt-sonuc-alt">
                    <span>
                      <b>{aylikAdet}</b> {t("units a month")}
                    </span>
                    <span>
                      <b>{formatMoney(fiyat.kar, fiyat.currencyCode)}</b> {t("per unit")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3b. Kit — gerçek ürün fotoğrafları, iki fiyat yan yana */}
            {/* Açık zemin tam genişlikte olsun diye dış sarmal sg-container
                DEĞİL; kap içeride. */}
            <div className="pt-kit">
              <div className="sg-container">
                <div className="pt-kit-ust">
                  <h2 className="pt-baslik">{t("What you start with")}</h2>
                  <span className="pt-kit-tutar">
                    {formatMoney(kitTutari, fiyat.currencyCode)}
                    <small>{t("starter kit")}</small>
                  </span>
                </div>

                <ul className="pt-kit-liste">
                  {kitUrunleri.map((u) => (
                    <li key={u.id} className="pt-kit-urun">
                      {u.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.imageUrl} alt="" aria-hidden="true" />
                      ) : (
                        <span className="pt-kit-bos" aria-hidden="true" />
                      )}
                      <span className="pt-kit-ad">{u.title}</span>
                      <span className="pt-kit-fiyat">
                        <s>{formatMoney(u.price, u.currencyCode)}</s>
                        <b>{formatMoney(kademeFiyati(u.price, enIyi), u.currencyCode)}</b>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3c. Akış — üç blok, iki üç kelime */}
            <div className="sg-container pt-akis">
              {[
                [t("Apply"), t("Three fields and your document code.")],
                [t("Approved"), t("Same business day.")],
                [t("Shipped"), t("Your price is on every order after that.")],
              ].map(([ad, metin], i) => (
                <div key={ad} className="pt-akis-blok">
                  <span className="pt-akis-no" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pt-akis-ad">{ad}</span>
                  <span className="pt-akis-metin">{metin}</span>
                </div>
              ))}
            </div>

            <div className="sg-container pt-cta">
              <Link href="/uye-ol?tur=berber" className="lx-btn-kirmizi" style={{ minHeight: 56, paddingInline: 42 }}>
                {t("Open a barber account")}
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  );
}
