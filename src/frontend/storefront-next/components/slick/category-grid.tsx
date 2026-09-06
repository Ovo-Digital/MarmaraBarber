import Link from "next/link";
import type { HeroSlide } from "@/services/shopify/storefront-direct";

/**
 * Kategori bölümü — ürün kartlarıyla AYNI dil.
 *
 * Daha önce kenardan kenara koyu bloklar denendi; sayfanın geri kalanı
 * kapsayıcı içinde beyaz kartlar olduğu için bölüm kopuk duruyordu.
 * Şimdi aynı kapsayıcı, aynı kart yapısı, aynı hover davranışı:
 * görsel üstte, ad altta, üzerine gelince ince kırmızı çerçeve.
 *
 * İçerik Shopify koleksiyonlarından gelir; kodda kategori adı/görseli sabit
 * değildir, başka bir mağazaya bağlandığında onun kategorileri çıkar.
 */
export function CategoryGrid({
  tiles,
  title = "Shop by category",
  eyebrow,
}: {
  tiles: HeroSlide[];
  title?: string;
  eyebrow?: string;
}) {
  if (!tiles.length) return null;

  return (
    <section
      className="w-full"
      style={{
        background: "var(--lx-paper)",
        paddingTop: "clamp(44px, 4.4vw, 68px)",
        paddingBottom: "clamp(44px, 4.4vw, 68px)",
      }}
    >
      <div className="sg-container">
        <div className="text-center">
          {eyebrow ? <p className="lx-eyebrow mb-2">{eyebrow}</p> : null}
          <h2 className="lx-title">{title}</h2>
        </div>

        <div
          className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4"
          style={{ marginTop: "clamp(20px, 2vw, 30px)" }}
        >
          {tiles.map((tile, i) => (
            <Link key={tile.handle} href={tile.href} className="group block text-center">
              {/* Ürün kartlarıyla aynı oran ve aynı hover çerçevesi */}
              <div className="relative aspect-[8/7] overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
                />

                {/* Sıra numarası — sokak/editoryal imzası, ama sessiz */}
                <span
                  className="absolute left-3 top-3"
                  style={{
                    fontFamily: "var(--font-owners)",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.22em",
                    color: "var(--lx-stone)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100"
                  style={{ border: "1px solid var(--sg-red)" }}
                />
              </div>

              <div className="flex flex-col items-center gap-2 pt-5">
                <span
                  className="uppercase"
                  style={{
                    fontFamily: "var(--font-owners-black)",
                    fontWeight: 900,
                    fontSize: "18px",
                    lineHeight: "26px",
                    letterSpacing: "-0.005em",
                    color: "var(--lx-ink)",
                  }}
                >
                  {tile.title}
                </span>

                <span
                  aria-hidden="true"
                  className="block h-[3px] w-9 origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: "var(--sg-red)" }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
