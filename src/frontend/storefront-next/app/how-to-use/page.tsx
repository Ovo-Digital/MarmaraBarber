import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/slick/page-hero";
import { storefrontGetUsageGuides } from "@/services/shopify/storefront-direct";

export const metadata: Metadata = {
  title: "How to use",
  description:
    "How to use Marmara Barber products — cologne, styling, shave and beard care, product by product.",
};

/** Kılavuz metinleri ürün açıklamalarından geliyor; günde bir tazelemek yeterli. */
export const revalidate = 86400;

export default async function HowToUsePage() {
  let kartlar: Awaited<ReturnType<typeof storefrontGetUsageGuides>> = [];
  try {
    kartlar = await storefrontGetUsageGuides();
  } catch {
    kartlar = [];
  }

  /**
   * İki kademeli gruplama.
   *
   * Aynı kategorideki ürünlerin çoğunda kullanım metni BİREBİR aynı (13 tıraş
   * jelinin hepsinde tek cümle). Her ürün için ayrı ayrı yazdırınca sayfa aynı
   * metni tekrar tekrar gösteriyordu. Önce ürün tipine, sonra metnin kendisine
   * göre gruplanıyor: her metin bir kez yazılıyor, altında o metni paylaşan
   * ürünler küçük görsellerle listeleniyor.
   */
  const gruplar = new Map<string, Map<string, typeof kartlar>>();
  for (const k of kartlar) {
    const tip = gruplar.get(k.productType) ?? new Map<string, typeof kartlar>();
    const ayni = tip.get(k.usage) ?? [];
    ayni.push(k);
    tip.set(k.usage, ayni);
    gruplar.set(k.productType, tip);
  }

  /* Neredeyse aynı metinleri birleştir.
     Bazı açıklamalarda aynı cümle bir yerde tam, başka yerde yarım bitiyor;
     birebir karşılaştırma bunları iki ayrı blok sayıyordu. Noktalama ve
     büyük/küçük harf atılıp biri diğerinin başlangıcıysa tek blok yapılıyor
     ve uzun olan metin tutuluyor. */
  const sadelestir = (t: string) =>
    t.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();

  for (const [tip, metinler] of gruplar) {
    const girisler = [...metinler.entries()].sort((a, b) => b[0].length - a[0].length);
    const birlesik = new Map<string, typeof kartlar>();
    for (const [metin, urunler] of girisler) {
      const sade = sadelestir(metin);
      const esles = [...birlesik.keys()].find((m) => sadelestir(m).startsWith(sade));
      if (esles) birlesik.get(esles)!.push(...urunler);
      else birlesik.set(metin, [...urunler]);
    }
    gruplar.set(tip, birlesik);
  }

  const sirali = [...gruplar.entries()].sort(
    (a, b) =>
      [...b[1].values()].reduce((n, l) => n + l.length, 0) -
      [...a[1].values()].reduce((n, l) => n + l.length, 0),
  );

  return (
    <>
      <PageHero
        eyebrow="Guides"
        title="How to use"
        subline="Product by product — how to get the most out of the range."
      />

      <div className="bg-white">
        <div
          className="sg-container"
          style={{ paddingTop: "clamp(48px,5vw,80px)", paddingBottom: "clamp(64px,7vw,110px)" }}
        >
          {sirali.length === 0 ? (
            <p className="py-16 text-center text-[15px]" style={{ color: "rgba(20,17,15,0.55)" }}>
              Guides are on their way.
            </p>
          ) : (
            <>
              {/* Bölüm bağlantıları */}
              <nav className="mb-14 flex flex-wrap gap-2">
                {sirali.map(([tip, metinler]) => (
                  <a
                    key={tip}
                    href={`#${encodeURIComponent(tip)}`}
                    className="px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-[var(--sg-red)] hover:text-[var(--sg-red)]"
                    style={{
                      border: "1px solid rgba(20,17,15,0.2)",
                      color: "var(--lx-ink)",
                      fontFamily: "var(--font-owners)",
                    }}
                  >
                    {tip}
                    <span style={{ color: "rgba(20,17,15,0.4)" }}>
                      {" "}
                      · {[...metinler.values()].reduce((n, l) => n + l.length, 0)}
                    </span>
                  </a>
                ))}
              </nav>

              {sirali.map(([tip, metinler]) => (
                <section key={tip} id={encodeURIComponent(tip)} className="mb-16 scroll-mt-28">
                  <h2
                    className="mb-8 uppercase"
                    style={{
                      fontFamily: "var(--font-owners-black)",
                      fontWeight: 900,
                      fontSize: "clamp(22px,2.4vw,32px)",
                      color: "var(--lx-ink)",
                      borderTop: "2px solid var(--sg-red)",
                      paddingTop: "16px",
                    }}
                  >
                    {tip}
                  </h2>

                  <div className="space-y-8">
                    {[...metinler.entries()].map(([metin, urunler]) => (
                      <div key={metin} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
                        <p className="text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.72)" }}>
                          {metin}
                        </p>

                        <div>
                          <p
                            className="mb-3 text-[11px] uppercase tracking-[0.14em]"
                            style={{ color: "rgba(20,17,15,0.5)", fontFamily: "var(--font-owners)" }}
                          >
                            Applies to · {urunler.length}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {urunler.map((u) => (
                              <Link
                                key={u.handle}
                                href={`/products/${u.handle}`}
                                title={u.title}
                                aria-label={u.title}
                                className="lx-seri-kare block h-16 w-16 overflow-hidden bg-white"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={u.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
