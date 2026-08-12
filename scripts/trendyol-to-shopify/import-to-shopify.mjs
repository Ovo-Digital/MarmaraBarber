import { readFile } from "node:fs/promises";
import { OUTPUT_FILE } from "./config.mjs";
import {
  importProductToShopify,
} from "./lib/shopify-admin.mjs";

function parseArgs(argv) {
  const args = { dryRun: false, limit: Infinity, offset: 0 };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--limit" && argv[i + 1]) args.limit = Number(argv[++i]);
    if (arg === "--offset" && argv[i + 1]) args.offset = Number(argv[++i]);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const raw = await readFile(OUTPUT_FILE, "utf8");
  const products = JSON.parse(raw);

  const slice = products.slice(args.offset, args.offset + args.limit);
  console.log(`Shopify import: ${slice.length} ürün (toplam ${products.length})`);

  if (args.dryRun) {
    for (const p of slice) {
      console.log(`[dry-run] ${p.title} — ${p.variants?.length ?? 0} varyant, ${p.images?.length ?? 0} görsel`);
    }
    return;
  }

  const locationId = process.env.SHOPIFY_LOCATION_ID?.trim();
  if (locationId) {
    console.log(`Lokasyon (env): ${locationId}`);
  } else {
    console.log("Stok atlanıyor (SHOPIFY_LOCATION_ID yok / read_locations izni gerekmez).");
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of slice) {
    try {
      const result = await importProductToShopify(product, { locationId });
      if (result.skipped) {
        skipped += 1;
        console.log(`⊘ Atlandı (mevcut): ${product.title}`);
      } else {
        created += 1;
        console.log(`✓ Oluşturuldu: ${result.product.title} → /products/${result.product.handle}`);
      }
    } catch (error) {
      failed += 1;
      console.error(`✗ ${product.title}: ${error.message}`);
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\nÖzet: ${created} oluşturuldu, ${skipped} atlandı, ${failed} hata`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
