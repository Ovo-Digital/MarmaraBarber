import {
  CategoryTabs,
  EssentialsSection,
  HeroBanner,
  InstagramFeed,
  PressLogoStrip,
  PromoSplitBanner,
  QuizPromoBanner,
  ShopTiles,
  SkinSection,
  Testimonials,
  TrustBar,
} from "@/components/slick/home-sections";
import {
  getMarmaraProductByHandle,
  listMarmaraByProductType,
  listMarmaraFeatured,
} from "@/lib/marmara-catalog";
import { INSTAGRAM_HANDLES } from "@/lib/slick-theme";

export const dynamic = "force-static";

function tileImages() {
  return {
    wax: listMarmaraByProductType("Saç Şekillendirici", 1)[0]?.imageUrl,
    fon: listMarmaraByProductType("Fön Suyu", 1)[0]?.imageUrl,
    penuar: listMarmaraByProductType("Penuar", 1)[0]?.imageUrl,
    cilt:
      listMarmaraByProductType("Cilt Bakımı", 1)[0]?.imageUrl ||
      listMarmaraByProductType("Sakal Yağı", 1)[0]?.imageUrl,
    paket:
      getMarmaraProductByHandle("partner-deneme-2")?.imageUrl ||
      listMarmaraByProductType("Paketler", 1)[0]?.imageUrl ||
      listMarmaraFeatured(1)[0]?.imageUrl,
  };
}

export default function HomePage() {
  const essentials = listMarmaraFeatured(12);
  const skin = [
    ...listMarmaraByProductType("Cilt Bakımı", 4),
    ...listMarmaraByProductType("Sakal Yağı", 4),
    ...listMarmaraByProductType("Tıraş Jeli", 4),
  ].slice(0, 10);

  const heroImage =
    listMarmaraByProductType("Paketler", 1)[0]?.imageUrl ||
    listMarmaraByProductType("Parfüm", 1)[0]?.imageUrl ||
    essentials[0]?.imageUrl;

  const promoImage =
    listMarmaraByProductType("Saç Şekillendirici", 2)[1]?.imageUrl ||
    essentials[1]?.imageUrl;

  const instagram = INSTAGRAM_HANDLES.map((handle) => {
    const p = getMarmaraProductByHandle(handle);
    return {
      handle,
      src: p?.imageUrl,
      title: p?.title,
    };
  });

  return (
    <div className="w-full bg-white">
      <HeroBanner image={heroImage} />
      <CategoryTabs />
      <EssentialsSection products={essentials} />
      <ShopTiles images={tileImages()} />
      <SkinSection products={skin.length ? skin : essentials.slice(0, 8)} />
      <TrustBar />
      <PromoSplitBanner image={promoImage} />
      <PressLogoStrip />
      <QuizPromoBanner />
      <Testimonials />
      <InstagramFeed images={instagram} />
    </div>
  );
}
