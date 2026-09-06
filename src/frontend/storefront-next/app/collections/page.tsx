import type { Metadata } from "next";
import Link from "next/link";
import { storefrontGetAllCollections } from "@/services/shopify/storefront-direct";

export const metadata: Metadata = { title: "Collections" };

/** Koleksiyonlar Shopify'dan gelir; 5 dakikada bir tazelenir. */
export const revalidate = 300;

export default async function CollectionsPage() {
  let collections: Awaited<ReturnType<typeof storefrontGetAllCollections>> = [];
  try {
    collections = await storefrontGetAllCollections(60);
  } catch {
    collections = [];
  }

  return (
    <div className="bg-white pb-16 pt-8">
      <div className="sg-container">
        <h1
          className="mb-8 uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.1vw, 30px)",
            lineHeight: "43.1px",
            letterSpacing: "0px",
            color: "#1C1C1C",
          }}
        >
          Collections
        </h1>

        {collections.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-[#666]">
            No collections available right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {collections.map((c) => (
              <Link key={c.handle} href={c.href} className="group block">
                <div className="relative aspect-square overflow-hidden bg-white">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f3f3f3] p-4 text-center">
                      <span className="text-[12px] uppercase tracking-[0.14em] text-[#888]">
                        {c.title}
                      </span>
                    </div>
                  )}

                  {/* Hover'da kırmızı çerçeve — ürün kartlarıyla aynı dil */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100"
                    style={{ border: "2px solid var(--sg-red)" }}
                  />
                </div>

                <h2
                  className="pt-4 text-center uppercase"
                  style={{
                    fontFamily: "var(--font-owners-black)",
                    fontWeight: 900,
                    fontSize: "17px",
                    lineHeight: "24px",
                    letterSpacing: "0px",
                    color: "#1C1C1C",
                  }}
                >
                  {c.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
