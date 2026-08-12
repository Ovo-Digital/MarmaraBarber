import Link from "next/link";
import { ProductCarousel } from "@/components/slick/product-carousel";
import {
  HOME_CATEGORY_TABS,
  HOME_SHOP_TILES,
  INSTAGRAM_HANDLES,
  PRESS_LOGOS,
  TESTIMONIALS,
  TRUST_STATS,
} from "@/lib/slick-theme";
import type { Product } from "@/types/commerce";

/** 3. Full-bleed hero + CTA overlay */
export function HeroBanner({
  image,
  title = "READY FOR TAKEOFF",
  subtitle = "Partner paketini seç, berber standı hediyesiyle stokunu güçlendir.",
  ctaLabel = "Shop Now",
  ctaHref = "/collections/paketler",
}: {
  image?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="relative min-h-[min(78vh,720px)] w-full overflow-hidden bg-[#111]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
      <div className="sg-container relative flex min-h-[min(78vh,720px)] flex-col items-center justify-end pb-14 pt-24 text-center text-white md:pb-20">
        <h1 className="sg-display max-w-3xl text-white">{title}</h1>
        <p className="sg-subhead mt-5 max-w-md text-white/90">{subtitle}</p>
        <Link href={ctaHref} className="sg-btn-red mt-8">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

/** 4. Yatay metin kategori linkleri */
export function CategoryTabs() {
  return (
    <section className="border-b border-black/10 bg-white">
      <div className="sg-container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5">
        {HOME_CATEGORY_TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className="sg-nav text-[12px] hover:opacity-60"
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** 5. Öne çıkanlar carousel */
export function EssentialsSection({ products }: { products: Product[] }) {
  return (
    <div className="bg-white">
      <ProductCarousel title="THE ESSENTIALS" products={products} viewAllHref="/products" />
    </div>
  );
}

/** 6. 5 sütun kategori banner grid */
export function ShopTiles({ images }: { images: Record<string, string | undefined> }) {
  return (
    <section className="bg-white">
      <div className="sg-container grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-5">
        {HOME_SHOP_TILES.map((tile) => {
          const img = images[tile.imageHint];
          return (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative aspect-[3/4] overflow-hidden bg-black text-white"
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={tile.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[#222]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="sg-nav-bold text-[14px]">{tile.title}</h3>
                <span className="sg-nav mt-3 inline-block text-[10px] underline underline-offset-4">
                  {tile.cta}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** 7. İkinci ürün carousel */
export function SkinSection({ products }: { products: Product[] }) {
  return (
    <div className="bg-[var(--sg-off)]">
      <ProductCarousel
        title="SKIN BY MARMARA"
        products={products}
        viewAllHref="/collections/cilt-bakimi-1"
      />
    </div>
  );
}

/** 8. Trust badges */
export function TrustBar() {
  return (
    <section className="border-y border-black/10 bg-white">
      <div className="sg-container grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        {TRUST_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="sg-nav-bold text-[12px]">{stat.label}</p>
            <p className="sg-body mt-1 text-[13px] text-[#666]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 9. Promo split — sol görsel, sağ metin + CTA */
export function PromoSplitBanner({
  image,
  eyebrow = "Partner Ol",
  title = "BERBERLER İÇİN ÖZEL PAKETLER",
  body = "Stand hediyeli partner paketleriyle stoğunu güçlendir. Ücretsiz deneme kampanyasını kaçırma.",
  ctaLabel = "Paketleri Gör",
  ctaHref = "/collections/paketler",
}: {
  image?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="grid bg-white lg:grid-cols-2">
      <div className="relative min-h-[280px] bg-[#ddd] lg:min-h-[420px]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col justify-center bg-[var(--sg-off)] px-8 py-14 sm:px-12 lg:px-16">
        <p className="sg-nav text-[11px] text-[#666]">{eyebrow}</p>
        <h2 className="sg-heading mt-4 text-[28px] md:text-[34px]">{title}</h2>
        <p className="sg-body mt-4 max-w-md text-[#444]">{body}</p>
        <Link href={ctaHref} className="sg-btn-red mt-8 w-fit">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

/** 10. Press / media logo strip */
export function PressLogoStrip() {
  return (
    <section className="border-y border-black/10 bg-white">
      <div className="sg-container flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-8">
        <p className="sg-nav w-full text-center text-[10px] text-[#888] md:w-auto md:text-left">
          AS SEEN IN
        </p>
        {PRESS_LOGOS.map((logo) => (
          <span key={logo} className="sg-nav-bold text-[13px] text-[#222] opacity-70">
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}

/** 11. Quiz / ürün bulucu promo */
export function QuizPromoBanner() {
  return (
    <section className="bg-black py-16 text-white">
      <div className="sg-container max-w-3xl text-center">
        <p className="sg-nav text-[11px] text-white/55">Find Your Formula</p>
        <h2 className="sg-section-title mt-4 text-white">ÜRÜN BULUCU</h2>
        <p className="sg-body mx-auto mt-5 max-w-lg text-white/75">
          Kolonya, şekillendirici, sakal bakımı veya aksesuar — sana uygun ürünü birkaç adımda bul.
        </p>
        <Link href="/products" className="sg-btn-red mt-8 inline-flex">
          Quiz&apos;e Başla
        </Link>
      </div>
    </section>
  );
}

/** 12. Testimonials — yatay marquee */
export function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="overflow-hidden bg-white py-14">
      <div className="sg-container mb-10">
        <h2 className="sg-section-title">10.000+ BERBER YANILIYOR OLAMAZ</h2>
      </div>
      <div className="relative">
        <div className="sg-marquee flex w-max gap-4">
          {loop.map((t, i) => (
            <blockquote
              key={`${t.author}-${i}`}
              className="w-[280px] shrink-0 bg-[var(--sg-off)] p-6 sm:w-[320px]"
            >
              <p className="text-[14px] leading-relaxed text-[#333]">“{t.quote}”</p>
              <footer className="sg-nav mt-4 text-[11px]">{t.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 13. Instagram / sosyal grid */
export function InstagramFeed({
  images,
}: {
  images: { handle: string; src?: string; title?: string }[];
}) {
  return (
    <section className="bg-white py-14">
      <div className="sg-container mb-8 text-center">
        <h2 className="sg-section-title">@MARMARABARBER</h2>
        <p className="sg-body mt-3 text-[#666]">Takip et · paylaş · keşfet</p>
      </div>
      <div className="sg-container grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(images.length
          ? images
          : INSTAGRAM_HANDLES.map((h) => ({ handle: h, src: undefined, title: undefined }))
        ).map((item) => (
          <Link
            key={item.handle}
            href={`/products/${item.handle}`}
            className="group relative aspect-square overflow-hidden bg-[var(--sg-off)]"
          >
            {item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.title || item.handle}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wider text-[#999]">
                {item.handle}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Collection PLP dark hero */
export function CollectionHero({
  title,
  description,
  image,
}: {
  title: string;
  description?: string;
  image?: string;
}) {
  return (
    <section className="relative min-h-[280px] overflow-hidden bg-[#1a1a1a] text-white md:min-h-[340px]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute left-0 top-0 h-full w-full object-cover opacity-50 md:w-[55%] md:opacity-80"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/55 to-black/80" />
      <div className="sg-container relative flex min-h-[280px] items-center justify-end py-16 md:min-h-[340px]">
        <div className="max-w-xl text-center md:pr-8 md:text-left">
          <h1 className="sg-heading">{title}</h1>
          {description ? (
            <p className="sg-body mt-5 text-white/85 md:text-[15px]">{description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
