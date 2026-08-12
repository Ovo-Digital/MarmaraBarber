export const SITE_NAME = "Dominant";

export const SITE_TAGLINE = "İç giyim ve çocuk giyim koleksiyonları";

export {
  CATEGORY_NAV as MAIN_NAV,
  HOME_CATEGORY_TILES as HOME_CATEGORIES,
  SEARCH_POPULAR_CATEGORIES as SEARCH_POPULAR,
  type NavItem,
} from "@/lib/product-categories";

export const PROMO_MESSAGES = [
  { text: "ÜYELERE ÖZEL İLK ALIŞVERİŞTE GEÇERLİ %10 İNDİRİM!", href: "/uye-ol", highlight: false },
  { text: "TÜM SİPARİŞLERDE KARGO BEDAVA!", href: null, highlight: false },
  { text: "Yeni Sezon | Keşfet", href: "/products?sort=new", highlight: true },
];

export const SALE_HERO = {
  title: "DOMİNANT",
  subtitle: "YENİ SEZON",
  cta: "Keşfet",
  href: "/collections/kadin",
  imageDesktop: "https://cdn-parfois.mncdn.com/uploaded/Yeni-Gelenler-Desk-0906.webp",
  imageMobile: "https://cdn-parfois.mncdn.com/uploaded/Yeni-Gelenler-Desk-0906.webp",
};

export const HERO_BANNERS = [
  {
    title: "Kadın Koleksiyonu",
    subtitle: "Külot, bikini, tanga ve büstiyer modelleri — pamuklu, konforlu, günlük kullanım için.",
    cta: "Keşfet",
    href: "/collections/kadin",
    imageDesktop: "https://cdn-parfois.mncdn.com/mnresize/1524/-/uploaded/5_desk-banner1.jpg",
    imageMobile: "https://cdn-parfois.mncdn.com/mnresize/1524/-/uploaded/5_desk-banner1.jpg",
    serif: true,
  },
  {
    title: "DOMİ KİDS",
    subtitle: "Çocuklar için pamuklu külot, atlet ve boxer çoklu paketler.",
    cta: "Keşfet",
    href: "/collections/cocuk",
    imageDesktop: "https://cdn-parfois.mncdn.com/uploaded/1-1706.jpg",
    imageMobile: "https://cdn-parfois.mncdn.com/uploaded/1-1706.jpg",
    serif: false,
  },
];

export const FOOTER_COLUMNS = [
  {
    title: "Yardım",
    links: [
      { label: "Destek", href: "/iletisim" },
      { label: "Sipariş Takibi", href: "/account" },
      { label: "İade Talebi", href: "/iade-ve-degisim" },
      { label: "Mağazalarımız", href: "/magazalar" },
      { label: "Sıkça Sorulan Sorular", href: "/sss" },
      { label: "Kargo ve Teslimat", href: "/kargo-ve-teslimat" },
    ],
  },
  {
    title: "Kadın",
    links: [
      { label: "Tüm Kadın", href: "/collections/kadin" },
      { label: "Külot", href: "/collections/kadin-kulot" },
      { label: "Bikini Külot", href: "/collections/kadin-bikini-kulot" },
      { label: "Brazilian", href: "/collections/kadin-brazilian-kulot" },
      { label: "Tanga", href: "/collections/kadin-tanga" },
    ],
  },
  {
    title: "Erkek & Çocuk",
    links: [
      { label: "Erkek Boxer", href: "/collections/erkek-boxer" },
      { label: "Domi Kids", href: "/collections/cocuk" },
      { label: "Kız Çocuk", href: "/collections/kiz-cocuk-kulot" },
      { label: "Erkek Çocuk", href: "/collections/erkek-cocuk-boxer" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Kariyer", href: "/kariyer" },
      { label: "E-Bülten", href: "/#newsletter" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    title: "Politikalar",
    links: [
      { label: "Hüküm ve Şartlar", href: "/gizlilik-politikasi" },
      { label: "Kişisel Verilerin Korunması", href: "/kvkk" },
      { label: "Çerez Politikası", href: "/cerez-politikasi" },
      { label: "İade", href: "/iade-ve-degisim" },
    ],
  },
];

export function formatPrice(amount: number, currency = "TRY"): string {
  if (currency === "TRY") {
    return `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}
