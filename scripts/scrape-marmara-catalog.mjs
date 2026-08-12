#!/usr/bin/env node
/**
 * Marmara Barber (Shopify) public JSON kataloğunu indirir.
 * Kaynak: https://marmarabarber.com/products.json + collections.json
 *
 * Çıktı:
 *   src/frontend/storefront-next/data/marmara/
 *   src/frontend/storefront-next/public/catalog/marmara/
 *
 * Kullanım: node scripts/scrape-marmara-catalog.mjs
 */

import { createWriteStream } from "node:fs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STORE = "https://marmarabarber.com";
const DATA_DIR = path.join(ROOT, "src/frontend/storefront-next/data/marmara");
const IMG_DIR = path.join(ROOT, "src/frontend/storefront-next/public/catalog/marmara");
const RAW_DIR = path.join(DATA_DIR, "raw");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FETCH_HEADERS = {
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: `${STORE}/`,
};

async function fetchJson(url, attempt = 1) {
  // Prefer curl — Node fetch was getting 429 from this storefront.
  try {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sS",
        "-L",
        "-A",
        FETCH_HEADERS["User-Agent"],
        "-H",
        `Accept: ${FETCH_HEADERS.Accept}`,
        "-H",
        `Referer: ${FETCH_HEADERS.Referer}`,
        "--retry",
        "5",
        "--retry-delay",
        "2",
        url,
      ],
      { maxBuffer: 50 * 1024 * 1024 },
    );
    return JSON.parse(stdout);
  } catch (err) {
    if (attempt >= 6) throw err;
    const wait = Math.min(20_000, 1000 * 2 ** attempt);
    console.warn(`  retry ${attempt} after ${wait}ms → ${url}`);
    await sleep(wait);
    return fetchJson(url, attempt + 1);
  }
}

async function fetchAllProducts() {
  const products = [];
  let page = 1;
  for (;;) {
    const data = await fetchJson(`${STORE}/products.json?limit=250&page=${page}`);
    const batch = data.products ?? [];
    if (batch.length === 0) break;
    products.push(...batch);
    console.log(`  products page ${page}: +${batch.length} (total ${products.length})`);
    page += 1;
    await sleep(800);
  }
  return products;
}

async function fetchAllCollections() {
  const collections = [];
  let page = 1;
  for (;;) {
    const data = await fetchJson(`${STORE}/collections.json?limit=250&page=${page}`);
    const batch = data.collections ?? [];
    if (batch.length === 0) break;
    collections.push(...batch);
    console.log(`  collections page ${page}: +${batch.length} (total ${collections.length})`);
    page += 1;
    await sleep(800);
  }
  return collections;
}

async function fetchCollectionProducts(handle) {
  const products = [];
  let page = 1;
  for (;;) {
    const data = await fetchJson(
      `${STORE}/collections/${encodeURIComponent(handle)}/products.json?limit=250&page=${page}`,
    );
    const batch = data.products ?? [];
    if (batch.length === 0) break;
    products.push(...batch);
    page += 1;
    await sleep(600);
  }
  return products;
}

function extFromUrl(url) {
  try {
    const clean = new URL(url).pathname.toLowerCase();
    const m = clean.match(/\.(jpe?g|png|webp|gif|avif)(?:$)/);
    return m ? `.${m[1].replace("jpeg", "jpg")}` : ".jpg";
  } catch {
    return ".jpg";
  }
}

function imageLocalName(productHandle, image, index) {
  const id = image.id ?? index;
  return `${productHandle}__${id}${extFromUrl(image.src)}`;
}

async function downloadImage(url, destPath) {
  try {
    const existing = await readFile(destPath).catch(() => null);
    if (existing && existing.length > 0) return { skipped: true, bytes: existing.length };

    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok || !res.body) throw new Error(`download ${res.status}`);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
    return { skipped: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function money(amount) {
  const n = Number.parseFloat(String(amount ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(raw, imageMap) {
  const images = (raw.images ?? []).map((img, i) => {
    const file = imageLocalName(raw.handle, img, i);
    return {
      id: String(img.id ?? i),
      src: imageMap.get(file) ?? img.src,
      remoteSrc: img.src,
      alt: img.alt ?? raw.title,
      width: img.width,
      height: img.height,
      position: img.position ?? i + 1,
    };
  });

  const variants = (raw.variants ?? []).map((v) => ({
    id: String(v.id),
    title: v.title,
    sku: v.sku ?? "",
    price: money(v.price),
    compareAtPrice: v.compare_at_price ? money(v.compare_at_price) : null,
    available: v.available !== false,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    grams: v.grams,
    weight: v.weight,
    weightUnit: v.weight_unit,
  }));

  const minPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : 0;
  const maxCompare = variants
    .map((v) => v.compareAtPrice)
    .filter((n) => typeof n === "number" && n > 0);

  return {
    id: String(raw.id),
    title: raw.title,
    handle: raw.handle,
    descriptionHtml: raw.body_html ?? "",
    vendor: raw.vendor ?? "Marmara Barber",
    productType: raw.product_type ?? "",
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : String(raw.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
    options: (raw.options ?? []).map((o) => ({
      name: o.name,
      values: o.values ?? [],
    })),
    variants,
    images,
    featuredImage: images[0] ?? null,
    price: minPrice,
    compareAtPrice: maxCompare.length ? Math.max(...maxCompare) : null,
    available: variants.some((v) => v.available),
    publishedAt: raw.published_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(path.join(DATA_DIR, "products"), { recursive: true });
  await mkdir(path.join(DATA_DIR, "collections"), { recursive: true });

  console.log("1) Ürünler çekiliyor…");
  const rawProducts = await fetchAllProducts();
  await writeFile(path.join(RAW_DIR, "products.json"), JSON.stringify({ products: rawProducts }, null, 2));

  console.log("2) Koleksiyonlar çekiliyor…");
  const rawCollections = await fetchAllCollections();
  await writeFile(
    path.join(RAW_DIR, "collections.json"),
    JSON.stringify({ collections: rawCollections }, null, 2),
  );

  console.log("3) Koleksiyon ürünleri eşleştiriliyor…");
  const collectionProductHandles = {};
  for (const col of rawCollections) {
    const items = await fetchCollectionProducts(col.handle);
    collectionProductHandles[col.handle] = items.map((p) => p.handle);
    console.log(`  ${col.handle}: ${items.length} ürün`);
    await writeFile(
      path.join(DATA_DIR, "collections", `${col.handle}.json`),
      JSON.stringify(
        {
          id: String(col.id),
          handle: col.handle,
          title: col.title,
          description: col.description ?? "",
          descriptionHtml: col.body_html ?? "",
          image: col.image
            ? {
                src: col.image.src,
                alt: col.image.alt ?? col.title,
                width: col.image.width,
                height: col.image.height,
              }
            : null,
          productsCount: col.products_count ?? items.length,
          productHandles: collectionProductHandles[col.handle],
          publishedAt: col.published_at,
          updatedAt: col.updated_at,
        },
        null,
        2,
      ),
    );
  }

  console.log("4) Ürün görselleri indiriliyor…");
  const imageMap = new Map(); // filename -> public path
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let imageIndex = 0;
  const totalImages = rawProducts.reduce((n, p) => n + (p.images?.length ?? 0), 0);

  for (const product of rawProducts) {
    for (let i = 0; i < (product.images?.length ?? 0); i++) {
      const img = product.images[i];
      const file = imageLocalName(product.handle, img, i);
      const dest = path.join(IMG_DIR, file);
      const publicPath = `/catalog/marmara/${file}`;
      imageIndex += 1;
      const result = await downloadImage(img.src, dest);
      if (result.error) {
        failed += 1;
        console.warn(`  FAIL ${file}: ${result.error}`);
        imageMap.set(file, img.src); // fallback remote
      } else {
        imageMap.set(file, publicPath);
        if (result.skipped) skipped += 1;
        else downloaded += 1;
      }
      if (imageIndex % 25 === 0 || imageIndex === totalImages) {
        console.log(`  images ${imageIndex}/${totalImages} (new ${downloaded}, skip ${skipped}, fail ${failed})`);
      }
      if (!result.skipped) await sleep(80);
    }
  }

  console.log("5) Normalize katalog yazılıyor…");
  const products = rawProducts.map((p) => normalizeProduct(p, imageMap));
  for (const p of products) {
    await writeFile(path.join(DATA_DIR, "products", `${p.handle}.json`), JSON.stringify(p, null, 2));
  }

  const collections = rawCollections.map((col) => ({
    id: String(col.id),
    handle: col.handle,
    title: col.title,
    description: col.description ?? "",
    descriptionHtml: col.body_html ?? "",
    image: col.image
      ? {
          src: col.image.src,
          alt: col.image.alt ?? col.title,
          width: col.image.width,
          height: col.image.height,
        }
      : null,
    productsCount: collectionProductHandles[col.handle]?.length ?? col.products_count ?? 0,
    productHandles: collectionProductHandles[col.handle] ?? [],
    publishedAt: col.published_at,
    updatedAt: col.updated_at,
  }));

  // Navigation-ish tree from live site IA
  const navHint = [
    {
      label: "Ürünler",
      children: [
        {
          label: "Kolonya",
          children: ["dokme-kolonya", "sprey-kolonya", "krem-kolonya"],
        },
        {
          label: "Aksesuar",
          children: ["apron", "boyun-bandi", "urunler-aksesuar-firca", "penuar", "pompa"],
        },
        {
          label: "Saç Bakımı",
          children: ["sac-boyasi", "sac-kremi", "sac-sekillendirici", "sac-sekillendirici-1", "fon-suyu", "fon-suyu-1"],
        },
        {
          label: "Cilt Bakımı",
          children: ["cilt-bakimi-1", "sakal-yagi", "sakal-yagi-1"],
        },
        { label: "Parfüm", children: ["parfum"] },
        { label: "Paketler", children: ["paketler"] },
      ],
    },
  ];

  const catalog = {
    source: STORE,
    scrapedAt: new Date().toISOString(),
    currency: "TRY",
    vendor: "Marmara Barber",
    stats: {
      products: products.length,
      collections: collections.length,
      imagesDownloaded: downloaded,
      imagesSkipped: skipped,
      imagesFailed: failed,
      imagesTotal: totalImages,
    },
    navHint,
    collections,
    products,
  };

  await writeFile(path.join(DATA_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));
  await writeFile(
    path.join(DATA_DIR, "index.json"),
    JSON.stringify(
      {
        source: STORE,
        scrapedAt: catalog.scrapedAt,
        stats: catalog.stats,
        products: products.map((p) => ({
          handle: p.handle,
          title: p.title,
          productType: p.productType,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          available: p.available,
          image: p.featuredImage?.src ?? null,
          tags: p.tags,
        })),
        collections: collections.map((c) => ({
          handle: c.handle,
          title: c.title,
          productsCount: c.productsCount,
          image: c.image?.src ?? null,
        })),
      },
      null,
      2,
    ),
  );

  console.log("\nTamamlandı.");
  console.log(JSON.stringify(catalog.stats, null, 2));
  console.log(`DATA: ${DATA_DIR}`);
  console.log(`IMAGES: ${IMG_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
