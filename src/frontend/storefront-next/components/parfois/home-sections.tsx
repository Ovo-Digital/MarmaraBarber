import Link from "next/link";
import { HOME_CATEGORIES, HERO_BANNERS, SALE_HERO } from "@/lib/parfois-theme";

export function SaleHero() {
  return (
    <section className="relative -mt-[var(--pf-chrome-h)] w-full overflow-hidden">
      <Link href={SALE_HERO.href} className="group relative block min-h-[calc(100svh+var(--pf-chrome-h))] md:min-h-[calc(92vh+var(--pf-chrome-h))]">
        <picture>
          <source media="(min-width: 768px)" srcSet={SALE_HERO.imageDesktop} />
          <img
            src={SALE_HERO.imageMobile}
            alt={SALE_HERO.title}
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          />
        </picture>
        <div className="absolute inset-0 bg-black/5" />
      </Link>
    </section>
  );
}

export function CategoryTiles() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {HOME_CATEGORIES.map((cat) => (
          <Link key={cat.title} href={cat.href} className="group relative aspect-[3/4] overflow-hidden lg:aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat.image}
              alt={cat.title}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-[16px] font-medium uppercase tracking-[0.22em] md:text-[18px]">{cat.title}</h2>
              <span className="pf-btn-outline mt-5 px-6 py-2 text-[10px] opacity-0 transition duration-300 group-hover:opacity-100 md:opacity-100">
                Keşfet
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HeroBanners() {
  return (
    <>
      {HERO_BANNERS.map((banner) => (
        <section key={banner.title} className="relative w-full overflow-hidden">
          <Link href={banner.href} className="group relative block">
            <picture>
              <source media="(min-width: 768px)" srcSet={banner.imageDesktop} />
              <img
                src={banner.imageMobile}
                alt={banner.title}
                className="h-auto w-full object-cover md:min-h-[380px] lg:min-h-[480px]"
              />
            </picture>
            <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            <div
              className={`absolute inset-0 flex flex-col justify-end px-4 pb-8 text-white sm:px-6 sm:pb-10 md:justify-center md:px-12 md:pb-0 lg:px-20 ${
                banner.serif ? "md:max-w-xl" : "items-center text-center"
              }`}
            >
              <h2
                className={`${
                  banner.serif
                    ? "pf-serif text-[28px] font-normal leading-tight sm:text-[36px] md:text-[50px]"
                    : "text-[18px] font-light uppercase tracking-[0.16em] sm:text-[22px] md:text-[32px]"
                }`}
              >
                {banner.title}
              </h2>
              {banner.subtitle ? (
                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/90 md:text-[14px]">
                  {banner.subtitle}
                </p>
              ) : null}
              <span className="pf-btn-outline mt-6 w-fit">{banner.cta}</span>
            </div>
          </Link>
        </section>
      ))}
    </>
  );
}

export function CampaignBanner() {
  return (
    <section className="border-y border-[#e5e5e5] bg-[#fafafa] px-4 py-14 text-center">
      <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em]">Yaz Tatiline Hazırlık!</h2>
      <p className="mx-auto mt-3 max-w-xl text-[13px] text-[#666]">
        Her 2.000 TL Alışverişinize 200 TL Hediye!
      </p>
      <ul className="mx-auto mt-5 max-w-lg space-y-1 text-[11px] text-[#999]">
        <li>Kampanya tüm ürünlerde geçerlidir.</li>
        <li>Kampanyadan yararlanmak için üye girişi yapmanız gerekmektedir.</li>
        <li>%10 Hoşgeldin İndirimi ile birleştirilebilir.</li>
      </ul>
      <Link href="/products" className="pf-btn-outline-dark mt-8 inline-flex">
        Şimdi Alışverişe Başla!
      </Link>
    </section>
  );
}
