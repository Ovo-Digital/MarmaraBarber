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

  // Ürün tipine göre grupla, çok ürünlü tip başa
  const gruplar = new Map<string, typeof kartlar>();
  for (const k of kartlar) {
    const liste = gruplar.get(k.productType) ?? [];
    liste.push(k);
    gruplar.set(k.productType, liste);
  }
  const sirali = [...gruplar.entries()].sort((a, b) => b[1].length - a[1].length);

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
                {sirali.map(([tip, liste]) => (
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
                    <span style={{ color: "rgba(20,17,15,0.4)" }}> · {liste.length}</span>
                  </a>
                ))}
              </nav>

              {sirali.map(([tip, liste]) => (
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

                  <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
                    {liste.map((k) => (
                      <article key={k.handle} className="flex gap-5">
                        <Link
                          href={`/products/${k.handle}`}
                          className="h-28 w-24 shrink-0 overflow-hidden"
                          style={{ background: "var(--sg-off)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={k.imageUrl} alt={k.title} className="h-full w-full object-contain p-2" />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${k.handle}`}
                            className="block uppercase"
                            style={{
                              fontFamily: "var(--font-owners-black)",
                              fontSize: "15px",
                              lineHeight: 1.2,
                              color: "var(--lx-ink)",
                            }}
                          >
                            {k.title}
                          </Link>
                          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgba(20,17,15,0.65)" }}>
                            {k.usage}
                          </p>
                        </div>
                      </article>
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
