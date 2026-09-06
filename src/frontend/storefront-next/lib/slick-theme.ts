export const SITE_NAME = "Marmara Barber";
export const SITE_TAGLINE = "Profesyonel berber ve grooming ürünleri";

export const ANNOUNCEMENT_SLIDES = [
  { text: "SUBSCRIBE & SAVE — PARTNER PAKETLERİNDE ÖZEL FİYAT", href: "/collections/paketler" },
  { text: "TÜM SİPARİŞLERDE ÜCRETSİZ KARGO", href: "/kargo-ve-teslimat" },
  { text: "PROFESYONEL BERBER ÜRÜNLERİ — KEŞFET", href: "/products" },
];

export const ANNOUNCEMENT_SIDE_LINK = {
  label: "Bundle & Save",
  href: "/collections/paketler",
};

/** Geriye uyumluluk */
export const PROMO_MESSAGES = ANNOUNCEMENT_SLIDES;

export type NavChild = { label: string; href: string };
export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; children?: NavChild[] }[];
};

/** Slick düzeni: logo sol → tüm linkler yan yana → ikonlar sağ */
export const MAIN_NAV: NavItem[] = [
  {
    label: "SHOP",
    href: "/products",
    children: [
      {
        label: "KOLONYA",
        href: "/collections/dokme-kolonya",
        children: [
          { label: "Dökme Kolonya", href: "/collections/dokme-kolonya" },
          { label: "Sprey Kolonya", href: "/products?type=Sprey%20Kolonya" },
          { label: "Krem Kolonya", href: "/products?type=Krem%20Kolonya" },
        ],
      },
      {
        label: "SAÇ BAKIMI",
        href: "/products?type=Sa%C3%A7%20%C5%9Eekillendirici",
        children: [
          { label: "Saç Şekillendirici", href: "/products?type=Sa%C3%A7%20%C5%9Eekillendirici" },
          { label: "Fön Suyu", href: "/collections/fon-suyu" },
          { label: "Şampuan", href: "/products?type=%C5%9Eampuan" },
          { label: "Saç Boyası", href: "/collections/gecici-renkli-sac-spreyi" },
        ],
      },
      {
        label: "CİLT & SAKAL",
        href: "/collections/cilt-bakimi-1",
        children: [
          { label: "Cilt Bakımı", href: "/collections/cilt-bakimi-1" },
          { label: "Sakal Yağı", href: "/collections/sakal-yagi-1" },
          { label: "Tıraş Jeli", href: "/products?type=T%C4%B1ra%C5%9F%20Jeli" },
        ],
      },
      {
        label: "AKSESUAR",
        href: "/collections/aksesuar",
        children: [
          { label: "Apron", href: "/products?type=Apron" },
          { label: "Penuar", href: "/products?type=Penuar" },
          { label: "Fırça", href: "/products?type=F%C4%B1r%C3%A7a" },
        ],
      },
      { label: "PARFÜM", href: "/collections/parfum" },
      { label: "PAKETLER", href: "/collections/paketler" },
    ],
  },
  { label: "BUNDLE & SAVE", href: "/collections/paketler" },
  { label: "PARTNER OL", href: "/hakkimizda" },
  { label: "HAKKIMIZDA", href: "/hakkimizda" },
  { label: "İLETİŞİM", href: "/iletisim" },
];

/** Geriye uyumluluk */
export const MAIN_NAV_LEFT = MAIN_NAV.filter((i) =>
  ["SHOP", "BUNDLE & SAVE"].includes(i.label),
);
export const MAIN_NAV_RIGHT = MAIN_NAV.filter(
  (i) => !["SHOP", "BUNDLE & SAVE"].includes(i.label),
);

/** Mega menu — Slick: düz kategori linkleri (2 kolon) + sağda featured kartlar */
export const MEGA_LINKS = [
  { label: "STYLING", href: "/products?type=Sa%C3%A7%20%C5%9Eekillendirici" },
  { label: "HAIR CARE", href: "/collections/fon-suyu" },
  { label: "SETS & BUNDLES", href: "/collections/paketler" },
  { label: "SKIN", href: "/collections/cilt-bakimi-1" },
  { label: "ACCESSORIES", href: "/collections/aksesuar" },
  { label: "PARFÜM", href: "/collections/parfum" },
];

export const MEGA_FEATURED = [
  {
    title: "Partner Paketleri",
    href: "/collections/paketler",
    image: "/catalog/marmara/caramel-wax-150-ml__43143035420897.png",
  },
  {
    title: "Aksesuarlar",
    href: "/collections/aksesuar",
    image: "/catalog/marmara/beyaz-penuar-takim-pro__41825411104993.jpg",
  },
];

export const HOME_CATEGORY_TABS = [
  { label: "STYLING", href: "/products?type=Sa%C3%A7%20%C5%9Eekillendirici" },
  { label: "CARE", href: "/collections/fon-suyu" },
  { label: "SKIN", href: "/collections/cilt-bakimi-1" },
  { label: "ACCESSORIES", href: "/collections/aksesuar" },
  { label: "SETS", href: "/collections/paketler" },
];

export const HOME_SHOP_TILES = [
  {
    title: "STYLING",
    href: "/products?type=Sa%C3%A7%20%C5%9Eekillendirici",
    cta: "SHOP NOW",
    imageHint: "wax",
  },
  {
    title: "HAIR CARE",
    href: "/collections/fon-suyu",
    cta: "SHOP NOW",
    imageHint: "fon",
  },
  {
    title: "ACCESSORIES",
    href: "/products?type=Penuar",
    cta: "SHOP NOW",
    imageHint: "penuar",
  },
  {
    title: "SKIN CARE",
    href: "/collections/cilt-bakimi-1",
    cta: "SHOP NOW",
    imageHint: "cilt",
  },
  {
    title: "SETS & BUNDLES",
    href: "/collections/paketler",
    cta: "SHOP NOW",
    imageHint: "paket",
  },
];

export const TRUST_STATS = [
  { label: "SINCE 1970", sub: "Barber heritage" },
  { label: "MADE IN TURKEY", sub: "Own production" },
  { label: "10,000+ BARBERS", sub: "Professional choice" },
  { label: "FULL RANGE", sub: "Cologne, styling, skin & tools" },
];

export const PRESS_LOGOS = ["GQ", "Men's Health", "Forbes", "Esquire", "Barber Mag"];

export const TESTIMONIALS = [
  {
    quote: "Salonumuzda yıllardır Marmara kullanıyoruz. Kolonya ve wax ürünleri gerçekten fark yaratıyor.",
    author: "Ahmet K.",
  },
  {
    quote: "Müşterilerime güvenle önerdiğim tek marka. Kokusu ve kalıcılığı mükemmel.",
    author: "Burak Y.",
  },
  {
    quote: "Partner paketiyle stok maliyeti düştü, ürün çeşitliliği arttı. Çok memnunuz.",
    author: "Serkan D.",
  },
  {
    quote: "Fön suları ve şekillendiriciler günlük kullanımda vazgeçilmez oldu.",
    author: "Emre T.",
  },
  {
    quote: "Parfüm serisi müşterilerden sürekli övgü alıyor. Kalite/fiyat dengesi süper.",
    author: "Caner A.",
  },
  {
    quote: "Sipariş hızlı geldi, ürünler taze ve orijinal. Tekrar alacağız.",
    author: "Mert S.",
  },
];

export const FOOTER_COLUMNS = [
  {
    title: "HIZLI LİNKLER",
    links: [
      { label: "Mağaza", href: "/products" },
      { label: "KVKK Formu", href: "/kvkk-basvuru-formu" },
      { label: "Partner Ol", href: "/hakkimizda" },
    ],
  },
  {
    title: "ÖNEMLİ BİLGİLER",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Üyelik Sözleşmesi", href: "/uyelik-sozlesmesi" },
      { label: "İade ve Değişim Şartları", href: "/iade-ve-degisim" },
      { label: "Aydınlatma Metni", href: "/aydinlatma-metni" },
      { label: "Teslimat ve Sipariş Koşulları", href: "/kargo-ve-teslimat" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { label: "Hesabım", href: "/account" },
      { label: "SSS", href: "/sss" },
      { label: "Gizlilik", href: "/gizlilik-politikasi" },
      { label: "KVKK", href: "/kvkk" },
      { label: "Çerez Politikası", href: "/cerez-politikasi" },
    ],
  },
];

export const FOOTER_NEWSLETTER = {
  title: "JOIN THE MARMARA SIDE",
  body: "Yeni ürünler, sınırlı seriler ve özel tekliflerden ilk sen haberdar ol. Profesyoneller için.",
};

export const INSTAGRAM_HANDLES = [
  "caramel-wax-150-ml",
  "matte-wax-150-ml",
  "no-1-edc-kolonya-cam-sise-500-ml",
  "obsessed-edp-erkek-parfum-100-ml",
  "no-1-keratin-cift-fazli-fon-suyu-500-ml",
  "hangover-edp-erkek-parfum-100-ml",
];

/**
 * Anasayfa video şeridi.
 *
 * Ürün handle'ı → o ürünün videosu. Dosyaları public/media/ altına koy,
 * yolu buraya yaz; video verilmeyen üründe ürün görseli gösterilir.
 * Örnek: "space-wax-100-ml": { video: "/media/space-wax.mp4", poster: "/media/space-wax.jpg" }
 */
export const HOME_REEL_MEDIA: Record<string, { video?: string; poster?: string }> = {};
