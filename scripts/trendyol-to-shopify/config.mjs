/** Dominant @ Trendyol mağaza ayarları */
export const TRENDYOL_MERCHANT_ID = 4341;

export const TRENDYOL_LISTING_URL =
  "https://www.trendyol.com/sr?mid=4341&os=1";

export const INFINITE_SCROLL_API =
  "https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr";

export const PRODUCT_DETAIL_API =
  "https://public.trendyol.com/discovery-web-productgw-service/api/productDetail";

export const DEFAULT_VENDOR = "Dominant";

export const OUTPUT_FILE = new URL("./data/trendyol-products.json", import.meta.url);

export const PROGRESS_FILE = new URL("./data/scrape-progress.json", import.meta.url);
