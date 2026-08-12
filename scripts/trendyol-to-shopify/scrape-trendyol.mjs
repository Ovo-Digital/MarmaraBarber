import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";
import {
  DEFAULT_VENDOR,
  OUTPUT_FILE,
  PROGRESS_FILE,
  TRENDYOL_LISTING_URL,
  TRENDYOL_MERCHANT_ID,
} from "./config.mjs";

function parseArgs(argv) {
  const args = {
    maxPages: Infinity,
    maxProducts: Infinity,
    headless: false,
    resume: false,
    pageStart: 1,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--headless") args.headless = true;
    if (arg === "--resume") args.resume = true;
    if (arg === "--max-pages" && argv[i + 1]) {
      args.maxPages = Number(argv[++i]);
    }
    if (arg === "--max-products" && argv[i + 1]) {
      args.maxProducts = Number(argv[++i]);
    }
    if (arg === "--page-start" && argv[i + 1]) {
      args.pageStart = Number(argv[++i]);
    }
  }

  return args;
}

async function ensureDataDir(fileUrl) {
  await mkdir(dirname(fileUrl.pathname), { recursive: true });
}

function listingUrl(pageIndex) {
  const url = new URL(TRENDYOL_LISTING_URL);
  url.searchParams.set("pi", String(pageIndex));
  return url.toString();
}

function formatPrice(value) {
  if (value == null) return "0.00";
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
}

async function extractListingProducts(page) {
  return page.evaluate(() => {
    const links = new Map();

    const selectors = [
      'a[href*="-p-"]',
      'a[data-testid="product-card"]',
      ".product-card a",
    ];

    for (const selector of selectors) {
      for (const anchor of document.querySelectorAll(selector)) {
        const href = anchor.getAttribute("href");
        if (!href || !href.includes("-p-")) continue;
        const url = href.startsWith("http") ? href : `https://www.trendyol.com${href}`;
        const title =
          anchor.getAttribute("title") ||
          anchor.querySelector("[class*='title'], [class*='name']")?.textContent?.trim() ||
          anchor.textContent?.trim() ||
          "";
        if (!links.has(url)) links.set(url, { url, title });
      }
    }

    return [...links.values()];
  });
}

function deepFind(node, predicate, depth = 0) {
  if (depth > 12 || node == null) return null;
  if (predicate(node)) return node;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = deepFind(item, predicate, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof node === "object") {
    for (const value of Object.values(node)) {
      const found = deepFind(value, predicate, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function parseEmbeddedJson(pageText) {
  const patterns = [
    /window\.__SEARCH_APP_INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
    /window\.__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
    /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  ];

  for (const pattern of patterns) {
    const match = pageText.match(pattern);
    if (!match?.[1]) continue;
    try {
      return JSON.parse(match[1]);
    } catch {
      // continue
    }
  }

  return null;
}

function filterProductImages(urls) {
  return urls.filter(
    (src) =>
      src.includes("dsmcdn.com") &&
      !src.endsWith(".svg") &&
      !src.includes(".gif") &&
      !src.includes("sticker") &&
      !src.includes("icon") &&
      !src.includes("sfweb-browsing") &&
      (src.includes("/prod/") || src.includes("/product/media/")) &&
      (src.includes("org_zoom") || src.includes("_org_")),
  );
}

function extractImages(detail) {
  const urls = [];
  const push = (src) => {
    if (src && typeof src === "string" && !urls.includes(src)) urls.push(src);
  };

  for (const img of detail.images ?? detail.productImages ?? []) {
    if (typeof img === "string") push(img);
    else push(img.url ?? img.imageUrl ?? img.originalUrl);
  }

  for (const group of detail.imageGallery ?? []) {
    push(group.url ?? group.imageUrl);
  }

  const gallery = deepFind(detail, (n) => Array.isArray(n?.images) && n.images[0]?.url);
  if (gallery?.images) {
    for (const img of gallery.images) push(img.url ?? img);
  }

  return filterProductImages(urls);
}

function extractOptionsAndVariants(detail) {
  const optionMap = new Map();
  const variants = [];

  const pools = [
    detail.variants,
    detail.allVariants,
    detail.merchantVariants,
    detail.slicingAttributes,
    detail.result?.variants,
    deepFind(detail, (n) => Array.isArray(n) && n[0]?.variantAttributes)?.(),
  ].filter(Boolean);

  const rawVariants = pools.find((p) => Array.isArray(p) && p.length > 0) ?? [];

  for (const v of rawVariants) {
    const options = {};
    const attrs = v.variantAttributes ?? v.attributes ?? [];

    if (Array.isArray(attrs)) {
      for (const attr of attrs) {
        const name = attr.attributeName ?? attr.name;
        const value = attr.attributeValue ?? attr.value;
        if (name && value) {
          options[name] = value;
          if (!optionMap.has(name)) optionMap.set(name, new Set());
          optionMap.get(name).add(value);
        }
      }
    }

    if (v.colorName) {
      options.Renk = v.colorName;
      if (!optionMap.has("Renk")) optionMap.set("Renk", new Set());
      optionMap.get("Renk").add(v.colorName);
    }

    const size = v.sizeName ?? v.value;
    if (size && typeof size === "string" && size.length < 20) {
      options.Beden = size;
      if (!optionMap.has("Beden")) optionMap.set("Beden", new Set());
      optionMap.get("Beden").add(size);
    }

    variants.push({
      sku: String(v.sku ?? v.merchantSku ?? v.barcode ?? v.id ?? variants.length),
      barcode: v.barcode ? String(v.barcode) : undefined,
      price: formatPrice(v.price?.sellingPrice ?? v.sellingPrice ?? v.price),
      compareAtPrice: v.price?.originalPrice
        ? formatPrice(v.price.originalPrice)
        : undefined,
      stock: v.inStock ?? v.quantity ?? v.stock,
      options,
    });
  }

  const options =
    optionMap.size > 0
      ? [...optionMap.entries()].map(([name, values]) => ({ name, values: [...values] }))
      : [];

  return { options, variants };
}

function mapDetailToProduct(detail, meta) {
  const root = detail.result ?? detail.product ?? detail;
  const title = root.name ?? root.title ?? meta.title ?? "Ürün";
  const descriptionHtml =
    root.description ??
    root.content?.description ??
    root.contentDescriptions?.map((d) => d.description).join("<br/>") ??
    "";

  let { options, variants } = extractOptionsAndVariants(root);

  if (variants.length === 0) {
    variants = [
      {
        sku: String(root.id ?? meta.contentId ?? Date.now()),
        price: formatPrice(root.price?.sellingPrice ?? root.sellingPrice),
        compareAtPrice: root.price?.originalPrice
          ? formatPrice(root.price.originalPrice)
          : undefined,
        options: {},
      },
    ];
  }

  const images = extractImages(root);
  const contentId =
    root.id ?? root.contentId ?? meta.contentId ?? meta.url?.match(/-p-(\d+)/)?.[1];

  return {
    sourceId: String(contentId ?? ""),
    url: meta.url,
    title,
    descriptionHtml,
    vendor: root.brand?.name ?? DEFAULT_VENDOR,
    productType: root.category?.name ?? "",
    tags: ["trendyol-import", "dominant"],
    images,
    options,
    variants,
    scrapedAt: new Date().toISOString(),
  };
}

async function scrapeProductPage(page, url, titleHint) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(1500);

  const html = await page.content();
  const embedded = parseEmbeddedJson(html);

  if (embedded) {
    const productNode =
      embedded.product ??
      embedded.productDetail ??
      embedded.result ??
      deepFind(embedded, (n) => n?.name && (n?.variants || n?.images));
    if (productNode) {
      return mapDetailToProduct(productNode, {
        url,
        title: titleHint,
        contentId: url.match(/-p-(\d+)/)?.[1],
      });
    }
  }

  const domProduct = await page.evaluate(() => {
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent ?? "");
        } catch {
          return null;
        }
      })
      .find((j) => j?.["@type"] === "Product");

    const isProductImage = (src) =>
      src.includes("dsmcdn.com") &&
      !src.endsWith(".svg") &&
      !src.includes(".gif") &&
      !src.includes("sticker") &&
      !src.includes("icon") &&
      !src.includes("sfweb-browsing") &&
      (src.includes("/prod/") || src.includes("/product/media/")) &&
      (src.includes("org_zoom") || src.includes("_org_"));

    const galleryImages = [...document.querySelectorAll('[class*="gallery"] img, [data-testid*="image"] img, .product-image img')]
      .map((img) => img.src)
      .filter(isProductImage);

    const ldImages = Array.isArray(ld?.image)
      ? ld.image
      : ld?.image
        ? [ld.image]
        : [];

    const images = [...new Set([...galleryImages, ...ldImages.filter(isProductImage)])];

    const priceText =
      document.querySelector("[class*='price'], [data-testid*='price']")?.textContent ?? "";
    const priceMatch = priceText.replace(/\./g, "").match(/(\d+)/);
    const title =
      document.querySelector("h1")?.textContent?.trim() ||
      ld?.name ||
      document.title;

    const variantButtons = [
      ...document.querySelectorAll(
        '[data-testid="variant-item"], [class*="variant"] button, [class*="size"] button, [class*="Variant"] li',
      ),
    ]
      .map((el) => el.textContent?.trim())
      .filter((t) => t && t.length < 20);

    return {
      title,
      descriptionHtml: ld?.description ?? "",
      images: images.slice(0, 10),
      price: priceMatch ? Number(priceMatch[1]) : undefined,
      variantLabels: [...new Set(variantButtons)],
    };
  });

  const variants =
    domProduct.variantLabels.length > 0
      ? domProduct.variantLabels.map((label, index) => ({
          sku: `${url.match(/-p-(\d+)/)?.[1] ?? "sku"}-${index}`,
          price: formatPrice(domProduct.price),
          options: { Beden: label },
        }))
      : [
          {
            sku: url.match(/-p-(\d+)/)?.[1] ?? String(Date.now()),
            price: formatPrice(domProduct.price),
            options: {},
          },
        ];

  const options =
    domProduct.variantLabels.length > 0
      ? [{ name: "Beden", values: domProduct.variantLabels }]
      : [];

  return {
    sourceId: url.match(/-p-(\d+)/)?.[1] ?? "",
    url,
    title: domProduct.title || titleHint || "Ürün",
    descriptionHtml: domProduct.descriptionHtml,
    vendor: DEFAULT_VENDOR,
    productType: "",
    tags: ["trendyol-import", "dominant"],
    images: domProduct.images,
    options,
    variants,
    scrapedAt: new Date().toISOString(),
  };
}

async function loadProgress() {
  try {
    const raw = await readFile(PROGRESS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { completedUrls: [], pageIndex: 1, products: [] };
  }
}

async function saveProgress(progress) {
  await ensureDataDir(PROGRESS_FILE);
  await writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf8");
}

async function saveProducts(products) {
  await ensureDataDir(OUTPUT_FILE);
  await writeFile(OUTPUT_FILE, JSON.stringify(products, null, 2), "utf8");
}

async function main() {
  const args = parseArgs(process.argv);
  const progress = args.resume
    ? await loadProgress()
    : { completedUrls: [], pageIndex: args.pageStart, products: [] };
  const completed = new Set(progress.completedUrls);
  const products = [...progress.products];

  console.log("Trendyol scraper (DOM) başlıyor…");
  console.log(`Mağaza: ${TRENDYOL_MERCHANT_ID}, headless: ${args.headless}`);

  const browser = await chromium.launch({
    headless: args.headless,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    locale: "tr-TR",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  let pageIndex = progress.pageIndex;
  let pagesFetched = 0;

  while (pagesFetched < args.maxPages && products.length < args.maxProducts) {
    const url = listingUrl(pageIndex);
    console.log(`Liste: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForTimeout(2500);

    const pageTitle = await page.title();
    if (pageTitle.toLowerCase().includes("attention")) {
      console.error("Cloudflare — tarayıcıda doğrulama yapın (--headless kullanmayın).");
      break;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    const listings = await extractListingProducts(page);
    if (!listings.length) {
      console.log("Bu sayfada ürün bulunamadı.");
      break;
    }

    console.log(`  ${listings.length} ürün linki bulundu`);

    for (const listing of listings) {
      if (products.length >= args.maxProducts) break;
      if (completed.has(listing.url)) continue;

      try {
        const product = await scrapeProductPage(page, listing.url, listing.title);
        products.push(product);
        completed.add(listing.url);
        console.log(
          `  ✓ ${product.title} (${product.variants.length} varyant, ${product.images.length} görsel)`,
        );
      } catch (error) {
        console.warn(`  ✗ ${listing.url}: ${error.message}`);
      }

      await page.waitForTimeout(500 + Math.random() * 500);
    }

    pageIndex += 1;
    pagesFetched += 1;
    progress.pageIndex = pageIndex;
    progress.completedUrls = [...completed];
    progress.products = products;
    await saveProgress(progress);
    await saveProducts(products);
  }

  await browser.close();
  await saveProducts(products);

  console.log(`\nTamamlandı: ${products.length} ürün → ${OUTPUT_FILE.pathname}`);
  console.log("Shopify'a aktarmak için: npm run import");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
