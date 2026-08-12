import { readFile, writeFile } from "node:fs/promises";
import { OUTPUT_FILE } from "./config.mjs";
import { categorizeProduct } from "./lib/categorize.mjs";
import {
  escapeCsvCell,
  normalizeImages,
  parseCsvLine,
  rowToCsv,
  sanitizeVariants,
  slugify,
} from "./lib/csv-utils.mjs";

const DEFAULT_TEMPLATE = "/Users/oguzhanyikilmaz/Downloads/products_export_1.csv";

function parseArgs(argv) {
  const args = {
    input: OUTPUT_FILE,
    output: new URL("./data/shopify-products-import.csv", import.meta.url),
    template: DEFAULT_TEMPLATE,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1]) args.input = new URL(argv[++i], import.meta.url);
    if (arg === "--output" && argv[i + 1]) args.output = new URL(argv[++i], import.meta.url);
    if (arg === "--template" && argv[i + 1]) args.template = argv[++i];
  }

  return args;
}

async function loadHeaders(templatePath) {
  const firstLine = (await readFile(templatePath, "utf8")).split(/\r?\n/)[0];
  return parseCsvLine(firstLine).map((h) => h.trim());
}

function emptyRow(headers) {
  return Object.fromEntries(headers.map((h) => [h, ""]));
}

function setIfPresent(row, key, value) {
  if (key in row) row[key] = value;
}

const DEFAULT_STOCK = 100;

function ensureInventoryQtyHeader(headers) {
  if (headers.includes("Variant Inventory Qty")) return headers;
  const trackerIndex = headers.indexOf("Variant Inventory Tracker");
  if (trackerIndex === -1) return [...headers, "Variant Inventory Qty"];
  const next = [...headers];
  next.splice(trackerIndex + 1, 0, "Variant Inventory Qty");
  return next;
}

function setCompareAtPrice(row, value) {
  for (const key of ["Variant Compare At Price", "Variant Compare-at Price"]) {
    if (key in row) row[key] = value;
  }
}

function buildDescription(product) {
  if (product.descriptionHtml?.trim()) return product.descriptionHtml.trim();

  const parts = [];
  if (product.url) {
    parts.push(`<p><a href="${product.url}" rel="nofollow">Trendyol kaynak</a></p>`);
  }
  if (product.sourceId) {
    parts.push(`<p>Kaynak ID: ${product.sourceId}</p>`);
  }
  return parts.join("\n");
}

function productToRows(product, headers) {
  const handle = slugify(product.title) || `urun-${product.sourceId}`;
  const images = normalizeImages(product.images);
  const { variants, optionNames } = sanitizeVariants(product);
  const category = categorizeProduct(product.title, product.vendor);
  const tags = [...new Set([...category.tags, ...(product.tags ?? [])])].join(", ");
  const description = buildDescription(product);

  const rows = [];

  variants.forEach((variant, index) => {
    const row = emptyRow(headers);

    row.Handle = handle;

    if (index === 0) {
      setIfPresent(row, "Title", product.title);
      setIfPresent(row, "Body (HTML)", description);
      setIfPresent(row, "Vendor", product.vendor ?? "Dominant");
      setIfPresent(row, "Product Category", category.productCategory);
      setIfPresent(row, "Type", category.type);
      setIfPresent(row, "Tags", tags);
      setIfPresent(row, "Published", "true");
      setIfPresent(row, "Status", "active");
      setIfPresent(row, "SEO Title", product.title);
      if (images[0]) {
        setIfPresent(row, "Image Src", images[0]);
        setIfPresent(row, "Image Position", "1");
        setIfPresent(row, "Image Alt Text", product.title);
      }
    }

    const hasRealOptions =
      optionNames.length > 0 &&
      variants.some((v) => optionNames.some((name) => v.options?.[name]));

    if (hasRealOptions) {
      optionNames.slice(0, 3).forEach((name, optIndex) => {
        setIfPresent(row, `Option${optIndex + 1} Name`, name);
        setIfPresent(row, `Option${optIndex + 1} Value`, variant.options?.[name] ?? "");
      });
    } else {
      setIfPresent(row, "Option1 Name", "Title");
      setIfPresent(row, "Option1 Value", "Default Title");
    }

    setIfPresent(row, "Variant SKU", variant.sku ?? `${product.sourceId}-${index}`);
    setIfPresent(row, "Variant Grams", "0.0");
    setIfPresent(row, "Variant Inventory Tracker", "shopify");
    setIfPresent(row, "Variant Inventory Qty", String(DEFAULT_STOCK));
    setIfPresent(row, "Variant Inventory Policy", "deny");
    setIfPresent(row, "Variant Fulfillment Service", "manual");
    setIfPresent(row, "Variant Price", variant.price ?? "0.00");
    setCompareAtPrice(row, variant.compareAtPrice ?? "");
    setIfPresent(row, "Variant Requires Shipping", "true");
    setIfPresent(row, "Variant Taxable", "true");
    setIfPresent(row, "Variant Weight Unit", "kg");
    setIfPresent(row, "Variant Barcode", variant.barcode ?? "");
    setIfPresent(row, "Gift Card", "false");

    rows.push(row);
  });

  for (let i = 1; i < images.length; i += 1) {
    const imageRow = emptyRow(headers);
    imageRow.Handle = handle;
    setIfPresent(imageRow, "Image Src", images[i]);
    setIfPresent(imageRow, "Image Position", String(i + 1));
    setIfPresent(imageRow, "Image Alt Text", product.title);
    rows.push(imageRow);
  }

  return rows;
}

async function main() {
  const args = parseArgs(process.argv);
  const headers = ensureInventoryQtyHeader(await loadHeaders(args.template));

  const raw = await readFile(args.input, "utf8");
  const products = JSON.parse(raw);

  const allRows = [];
  for (const product of products) {
    allRows.push(...productToRows(product, headers));
  }

  const csvLines = [headers.map(escapeCsvCell).join(",")];
  for (const row of allRows) {
    csvLines.push(rowToCsv(row, headers));
  }

  const csv = `\uFEFF${csvLines.join("\n")}\n`;
  await writeFile(args.output, csv, "utf8");

  console.log(`CSV hazır: ${args.output.pathname}`);
  console.log(`  ${products.length} ürün → ${allRows.length} satır`);
  console.log(`  Sütun sayısı: ${headers.length}`);
  console.log(`  Şablon: ${args.template}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
