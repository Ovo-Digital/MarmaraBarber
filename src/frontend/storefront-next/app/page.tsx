import {
  EssentialsSection,
  HeroBanner,
} from "@/components/slick/home-sections";
import { HeroSlider } from "@/components/slick/hero-slider";
import { PromoBanner } from "@/components/slick/promo-banner";
import { ProductRoller } from "@/components/slick/product-roller";
import { FinderBanner } from "@/components/slick/finder-banner";
import { NewsletterBand } from "@/components/slick/newsletter-band";
import { MarqueeBand } from "@/components/slick/marquee-band";
import { ActionReel } from "@/components/slick/action-reel";
import { ProductCarousel } from "@/components/slick/product-carousel";
import {
  storefrontGetHeroSlides,
  storefrontGetBestSellers,
  storefrontGetNewArrivals,
} from "@/services/shopify/storefront-direct";
import { HOME_REEL_MEDIA } from "@/lib/slick-theme";

/** Hero koleksiyonları Shopify'dan geliyor; 5 dakikada bir tazele. */
export const revalidate = 300;

export default async function HomePage() {
  /* Shopify'a ulaşılamazsa sayfa ÇÖKMEMELİ. Anahtarları olmayan bir ortamda
     (ör. CI) derleme bu satırda patlıyordu; diğer çağrılar zaten korumalıydı. */
  let heroSlides: Awaited<ReturnType<typeof storefrontGetHeroSlides>> = [];
  try {
    heroSlides = await storefrontGetHeroSlides(6);
  } catch {
    heroSlides = [];
  }

  // "Öne çıkanlar" şeridi Shopify'ın en çok satanlarından; bağlantı kurulamazsa
  // sayfa o bölüm olmadan açılır, çökmez.
  let bestSellers: Awaited<ReturnType<typeof storefrontGetBestSellers>> = [];
  try {
    bestSellers = await storefrontGetBestSellers(24);
  } catch {
    bestSellers = [];
  }

  const essentials = bestSellers.slice(0, 12);

  // İkinci ürün şeridi — beyaz zeminde, iki koyu bölümün arasına giriyor.
  let newArrivals: Awaited<ReturnType<typeof storefrontGetNewArrivals>> = [];
  try {
    newArrivals = await storefrontGetNewArrivals(12);
  } catch {
    newArrivals = [];
  }

  // Kayan ürün listesi — önce her ürün tipinden birer tane (liste altı tane
  // kolonya değil, yelpazenin kesiti olsun), sonra kalanlarla tamamla. Liste
  // kısa kalırsa aynı ürün ekranda iki kez görünürdü.
  const seenTypes = new Set<string>();
  const oneOfEachType = bestSellers.filter((p) => {
    const key = (p.productType || p.handle).toLowerCase();
    if (seenTypes.has(key)) return false;
    seenTypes.add(key);
    return true;
  });
  // Video şeridi: farklı tipten 5 ürün
  const reelItems = oneOfEachType
    .filter((p) => Boolean(p.imageUrl))
    .slice(0, 5)
    .map((product) => ({
      product,
      videoUrl: HOME_REEL_MEDIA[product.handle]?.video,
      posterUrl: HOME_REEL_MEDIA[product.handle]?.poster,
    }));

  const chosen = new Set(oneOfEachType.map((p) => p.handle));
  const rollerProducts = [
    ...oneOfEachType,
    ...bestSellers.filter((p) => !chosen.has(p.handle)),
  ];

  return (
    <div className="w-full bg-white">
      {heroSlides.length ? (
        <HeroSlider slides={heroSlides} brandImage="/brand/marmara-logo.png" />
      ) : (
        // Shopify'dan görselli koleksiyon gelmezse eski tek görselli hero'ya düş
        <HeroBanner image={heroSlides[0]?.imageUrl} />
      )}

      {/* Beyaz — koyu hero'dan sonra sayfa nefes alsın */}
      <EssentialsSection products={essentials} />

      {/* Promosyon bandı — metinler ve görsel buradan yönetilir, kodda sabit değil */}
      <PromoBanner
        eyebrow="Since 1970"
        headline="Built for the chair."
        subline={[
          "Professional grooming products, trusted by barbers since 1970.",
          "Cologne, styling, skin and beard care.",
        ]}
        ctaLabel="Shop now"
        ctaHref="/products"
      />

      {/* Beyaz — iki koyu bölümün arasında ürün şeridi */}
      <div className="bg-white">
        <ProductCarousel title="New in" eyebrow="Just landed" products={newArrivals} />
      </div>

      <ProductRoller
        products={rollerProducts}
        eyebrow="The range"
        title="Shop the products"
        limit={8}
      />

      <MarqueeBand />
      <FinderBanner />

      {/* Video şeridi — videolar public/media/ altına konup HOME_REEL_MEDIA'ya
          yazılınca kendiliğinden devreye giriyor; o zamana kadar ürün görselleri */}
      <ActionReel items={reelItems} />

      <NewsletterBand />

      {/* Marka hikayesi — görseli public/brand/ altına koyup image prop'una ver */}
    </div>
  );
}
