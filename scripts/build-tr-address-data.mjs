/**
 * OvoV4 Mongo export → storefront adres dropdown verisi
 * Kaynak: OvoV4.Country.json, OvoV4.Town.json (repo kökü)
 * Çıktı: src/frontend/storefront-next/data/address/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/frontend/storefront-next/data/address");
const COUNTRY_SRC = path.join(ROOT, "OvoV4.Country.json");
const TOWN_SRC = path.join(ROOT, "OvoV4.Town.json");

export function provinceSlug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dedupeDistricts(districts) {
  const seen = new Map();
  for (const district of districts) {
    const existing = seen.get(district.name);
    if (!existing) {
      seen.set(district.name, district);
      continue;
    }
    if (!existing.zip && district.zip) {
      seen.set(district.name, district);
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

/** Aynı ilde tekrarlayan ilçe kayıtlarını birleştirir; mahalleleri distinct yapar */
function mergeTownsByName(townRecords) {
  const byName = new Map();

  for (const town of townRecords) {
    const districts = (town.District ?? [])
      .filter((d) => d.Published !== false)
      .map((d) => ({ name: d.Name, zip: d.ZipCode ?? "" }));

    const bucket = byName.get(town.Name) ?? [];
    bucket.push(...districts);
    byName.set(town.Name, bucket);
  }

  return [...byName.entries()]
    .map(([name, allDistricts]) => ({
      name,
      districts: dedupeDistricts(allDistricts),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function main() {
  const countries = JSON.parse(fs.readFileSync(COUNTRY_SRC, "utf8"));
  const turkey = countries.find((c) => c.TwoLetterIsoCode === "TR" || c.Name === "Türkiye");
  if (!turkey) throw new Error("Türkiye kaydı bulunamadı");

  const provinces = (turkey.StateProvinces ?? [])
    .filter((p) => p.Published !== false)
    .map((p) => ({ id: p._id, name: p.Name, slug: provinceSlug(p.Name) }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const towns = JSON.parse(fs.readFileSync(TOWN_SRC, "utf8"));
  const townsDir = path.join(OUT, "towns");
  fs.mkdirSync(townsDir, { recursive: true });

  const byProvince = new Map();
  for (const p of provinces) {
    byProvince.set(p.name, []);
  }

  for (const town of towns) {
    const list = byProvince.get(town.StateName);
    if (!list) continue;
    list.push(town);
  }

  let rawTownRows = 0;
  let mergedTownRows = 0;

  for (const p of provinces) {
    const raw = byProvince.get(p.name) ?? [];
    rawTownRows += raw.length;
    const items = mergeTownsByName(raw);
    mergedTownRows += items.length;
    fs.writeFileSync(path.join(townsDir, `${p.slug}.json`), JSON.stringify(items));
  }

  fs.writeFileSync(path.join(OUT, "provinces.json"), JSON.stringify(provinces));

  console.log(
    `✓ ${provinces.length} il, ${rawTownRows} ham ilçe → ${mergedTownRows} distinct ilçe → ${OUT}`,
  );
}

main();
