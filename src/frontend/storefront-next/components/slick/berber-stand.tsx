"use client";

/**
 * "Standını kur" bölümü — solda berber standı, sağda ürünler.
 *
 * Ziyaretçi sağdan bir ürüne basıyor, ürün bir yay çizerek standın ilk boş
 * yuvasına uçuyor ve orada kalıyor. Stand doldukça üstteki üç adım sırayla
 * yanıyor; son adımda standın toplamı perakende ve berber fiyatıyla birlikte
 * çıkıyor, tek düğmeyle hepsi sepete giriyor.
 *
 * NEDEN BÖYLE: berbere "senin standın şöyle görünecek" demenin en kısa yolu
 * standı ekranda kurdurmak. Fiyat farkı da tam o anda, dolu standın altında
 * görünüyor — listede tek tek fiyat kovalamak gerekmiyor.
 *
 * Uçuş gerçek ölçülerle yapılıyor: düğmenin ve yuvanın ekrandaki yeri
 * okunuyor, kopya görsel ikisinin arasında uçuyor. Hareketi kapatmış
 * kullanıcıda uçuş atlanıyor, ürün doğrudan yuvaya oturuyor.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "@/components/slick/berber.css";
import { useCallback, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n/dil";
import { formatMoney } from "@/lib/money";
import { type Kademe, kademeFiyati } from "@/lib/berber";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import type { Product } from "@/types/commerce";

/** 3 raf × 3 yuva — gerçek mağaza standının oranına yakın */
const RAF = 3;
const YUVA = 3;
const TOPLAM = RAF * YUVA;

type Ucus = {
  urun: Product;
  yuva: number;
  bas: { x: number; y: number; en: number; boy: number };
  son: { x: number; y: number; en: number; boy: number };
};

export function BerberStand({
  urunler,
  kademe,
  /** Berber girişli değilse fiyat farkı "kazanabilirsin" diye anlatılıyor */
  girisli = false,
}: {
  urunler: Product[];
  kademe: Kademe | null;
  girisli?: boolean;
}) {
  const t = useT();
  const azHareket = useReducedMotion();
  const [stand, setStand] = useState<(Product | null)[]>(() => Array(TOPLAM).fill(null));
  const [ucus, setUcus] = useState<Ucus | null>(null);
  const [sepetDurum, setSepetDurum] = useState<"bos" | "ekleniyor" | "tamam">("bos");
  const yuvaRef = useRef<(HTMLDivElement | null)[]>([]);
  const ekle = useShopifyCartStore((s) => s.add);

  const dolu = stand.filter(Boolean) as Product[];
  const bosYuva = stand.findIndex((y) => y === null);
  const adim = dolu.length === 0 ? 0 : dolu.length < TOPLAM ? 1 : 2;

  const paraBirimi = urunler[0]?.currencyCode ?? "TRY";
  const perakende = dolu.reduce((a, u) => a + u.price, 0);
  const berberFiyati = dolu.reduce((a, u) => a + kademeFiyati(u.price, kademe), 0);
  const kazanc = perakende - berberFiyati;

  const yerlestir = useCallback(
    (urun: Product, dugme: HTMLElement) => {
      setSepetDurum("bos");
      const hedefIndeks = stand.findIndex((y) => y === null);
      if (hedefIndeks < 0) return;

      const koy = () =>
        setStand((s) => {
          const kopya = [...s];
          /* Araya başka bir uçuş girdiyse yuva dolmuş olabilir: ilk boşa koy */
          const i = kopya[hedefIndeks] === null ? hedefIndeks : kopya.findIndex((y) => y === null);
          if (i < 0) return s;
          kopya[i] = urun;
          return kopya;
        });

      const hedef = yuvaRef.current[hedefIndeks];
      if (azHareket || !hedef || ucus) {
        koy();
        return;
      }

      const a = dugme.getBoundingClientRect();
      const b = hedef.getBoundingClientRect();
      setUcus({
        urun,
        yuva: hedefIndeks,
        bas: { x: a.left, y: a.top, en: a.width, boy: a.height },
        son: { x: b.left, y: b.top, en: b.width, boy: b.height },
      });
    },
    [azHareket, stand, ucus],
  );

  const cikar = (i: number) => {
    setSepetDurum("bos");
    setStand((s) => s.map((y, j) => (j === i ? null : y)));
  };

  async function standiSepeteEkle() {
    if (!dolu.length || sepetDurum === "ekleniyor") return;
    setSepetDurum("ekleniyor");
    /* Sıra önemli: Shopify sepeti tek tek satır ekliyor, paralel istek
       gönderirsek son cevap diğerlerini eziyor. */
    for (const urun of dolu) {
      try {
        await ekle(urun, 1);
      } catch {
        /* Tek ürün eklenemediyse diğerleri devam etsin */
      }
    }
    setSepetDurum("tamam");
  }

  const adimlar = useMemo(
    () => [
      { no: "01", baslik: t("Pick your products"), metin: t("Tap a product to send it to the stand.") },
      { no: "02", baslik: t("Build the stand"), metin: t("Nine slots, three shelves — the way it sits in your shop.") },
      { no: "03", baslik: t("Order at barber pricing"), metin: t("The whole stand goes into your basket in one go.") },
    ],
    [t],
  );

  return (
    <section className="relative isolate overflow-hidden" style={{ background: "var(--lx-ink)" }}>
      <div aria-hidden="true" className="lx-kirmizi-isik" />

      <div className="sg-container relative" style={{ paddingTop: "clamp(56px,6vw,100px)", paddingBottom: "clamp(56px,7vw,110px)" }}>
        <p className="lx-eyebrow mb-3">{t("Build your stand")}</p>
        <h2 className="lx-title max-w-[20ch]" style={{ color: "#fff" }}>
          {t("See your shop stand before you order it")}
        </h2>

        {/* Üç adım — stand doldukça sırayla yanıyor */}
        <ol className="brb-adimlar m-0 mt-9 grid list-none gap-px p-0 sm:grid-cols-3">
          {adimlar.map((a, i) => (
            <li key={a.no} className="brb-adim" data-aktif={i === adim ? "" : undefined} data-bitti={i < adim ? "" : undefined}>
              <span className="brb-adim-no">{a.no}</span>
              <span className="brb-adim-baslik">{a.baslik}</span>
              <span className="brb-adim-metin">{a.metin}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          {/* ── Stand ───────────────────────────────────────────────── */}
          <div>
            <div className="brb-stand">
              <div className="brb-stand-tepe">
                <span>Marmara Barber</span>
              </div>

              {Array.from({ length: RAF }).map((_, raf) => (
                <div key={raf} className="brb-raf">
                  <div className="brb-raf-yuvalar">
                    {Array.from({ length: YUVA }).map((_, s) => {
                      const i = raf * YUVA + s;
                      const urun = stand[i];
                      return (
                        <div
                          key={i}
                          ref={(el) => {
                            yuvaRef.current[i] = el;
                          }}
                          className="brb-yuva"
                          data-dolu={urun ? "" : undefined}
                          data-hedef={i === bosYuva ? "" : undefined}
                        >
                          {urun ? (
                            <button type="button" onClick={() => cikar(i)} className="brb-yuva-dugme" title={t("Remove")}>
                              {urun.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={urun.imageUrl} alt={urun.title} className="brb-yuva-gorsel" />
                              ) : (
                                <span className="brb-yuva-harf">{urun.title.slice(0, 2)}</span>
                              )}
                              <span aria-hidden="true" className="brb-yuva-cikar">×</span>
                            </button>
                          ) : (
                            <span aria-hidden="true" className="brb-yuva-bos" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span aria-hidden="true" className="brb-raf-tahta" />
                </div>
              ))}

              <span aria-hidden="true" className="brb-stand-ayak" />
            </div>

            <div className="mt-4 flex items-center justify-between text-[12px] uppercase tracking-[0.14em]" style={{ fontFamily: "var(--font-owners)" }}>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>
                {t("{filled} of {total} slots", { filled: String(dolu.length), total: String(TOPLAM) })}
              </span>
              {dolu.length ? (
                <button type="button" onClick={() => { setStand(Array(TOPLAM).fill(null)); setSepetDurum("bos"); }} className="lx-link" style={{ color: "#fff" }}>
                  {t("Clear stand")}
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Ürünler ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-baseline justify-between">
              <p className="lx-eyebrow">{t("The range")}</p>
              {kademe ? (
                <span className="brb-oran">{t("{tier} · −{rate}%", { tier: t(kademe.ad), rate: String(kademe.indirim) })}</span>
              ) : null}
            </div>

            <ul className="brb-liste m-0 mt-5 grid list-none gap-px p-0">
              {urunler.map((u) => {
                const standta = stand.some((y) => y?.id === u.id);
                const fiyat = kademeFiyati(u.price, kademe);
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={(e) => yerlestir(u, e.currentTarget)}
                      disabled={bosYuva < 0}
                      className="brb-urun"
                      data-standta={standta ? "" : undefined}
                    >
                      <span className="brb-urun-gorsel">
                        {u.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.imageUrl} alt="" aria-hidden="true" />
                        ) : null}
                      </span>
                      <span className="brb-urun-orta">
                        <span className="brb-urun-ad">{u.title}</span>
                        <span className="brb-urun-fiyat">
                          {kademe ? (
                            <>
                              <b>{formatMoney(fiyat, u.currencyCode)}</b>
                              <s>{formatMoney(u.price, u.currencyCode)}</s>
                            </>
                          ) : (
                            <b>{formatMoney(u.price, u.currencyCode)}</b>
                          )}
                        </span>
                      </span>
                      <span aria-hidden="true" className="brb-urun-ok">
                        {standta ? "✓" : "+"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ── Toplam ────────────────────────────────────────────── */}
            <div className="brb-toplam mt-6">
              <div className="flex items-end justify-between gap-4">
                <span className="brb-toplam-etiket">{t("Stand total")}</span>
                <span className="brb-toplam-sayi">
                  {formatMoney(kademe ? berberFiyati : perakende, paraBirimi)}
                </span>
              </div>
              {kademe && kazanc > 0 ? (
                <p className="brb-toplam-not">
                  {t("Retail {retail} — you save {saving} as a {tier} partner.", {
                    retail: formatMoney(perakende, paraBirimi),
                    saving: formatMoney(kazanc, paraBirimi),
                    tier: t(kademe.ad),
                  })}
                </p>
              ) : !girisli ? (
                <p className="brb-toplam-not">
                  {t("Sign in as a barber partner to see your pricing on this stand.")}
                </p>
              ) : (
                <p className="brb-toplam-not">
                  {t("Your barber pricing shows here once your account is approved.")}
                </p>
              )}

              <button
                type="button"
                onClick={standiSepeteEkle}
                disabled={!dolu.length || sepetDurum === "ekleniyor"}
                className="lx-btn-kirmizi mt-5 w-full"
                style={{ minHeight: 54 }}
              >
                {sepetDurum === "ekleniyor"
                  ? t("Adding…")
                  : sepetDurum === "tamam"
                    ? t("Added to basket")
                    : t("Add the stand to basket")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Uçan kopya ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {ucus ? (
          <motion.div
            key={`${ucus.urun.id}-${ucus.yuva}`}
            aria-hidden="true"
            className="brb-ucus"
            initial={{ x: ucus.bas.x, y: ucus.bas.y, width: ucus.bas.en, height: ucus.bas.boy, opacity: 0.9 }}
            animate={{
              x: [ucus.bas.x, (ucus.bas.x + ucus.son.x) / 2, ucus.son.x],
              /* Ortada yukarı kıvrılıyor: düz çizgi yerine yay */
              y: [ucus.bas.y, Math.min(ucus.bas.y, ucus.son.y) - 90, ucus.son.y],
              width: ucus.son.en,
              height: ucus.son.boy,
              opacity: 1,
            }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], times: [0, 0.55, 1] }}
            onAnimationComplete={() => {
              setStand((s) => {
                const kopya = [...s];
                const i = kopya[ucus.yuva] === null ? ucus.yuva : kopya.findIndex((y) => y === null);
                if (i < 0) return s;
                kopya[i] = ucus.urun;
                return kopya;
              });
              setUcus(null);
            }}
          >
            {ucus.urun.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ucus.urun.imageUrl} alt="" />
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
