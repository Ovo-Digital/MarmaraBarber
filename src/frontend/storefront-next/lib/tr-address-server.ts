import fs from "node:fs";
import path from "node:path";
import type { TrProvince, TrTown } from "@/lib/tr-address";
import { provinceSlug } from "@/lib/tr-address";

const DATA_DIR = path.join(process.cwd(), "data/address");

let provincesCache: TrProvince[] | null = null;
const townsCache = new Map<string, TrTown[]>();

export function getTrProvinces(): TrProvince[] {
  if (!provincesCache) {
    const raw = fs.readFileSync(path.join(DATA_DIR, "provinces.json"), "utf8");
    provincesCache = JSON.parse(raw) as TrProvince[];
  }
  return provincesCache;
}

export function getTrTownsByProvince(provinceName: string): TrTown[] {
  const slug = provinceSlug(provinceName);
  if (townsCache.has(slug)) {
    return townsCache.get(slug)!;
  }
  const filePath = path.join(DATA_DIR, "towns", `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const towns = JSON.parse(fs.readFileSync(filePath, "utf8")) as TrTown[];
  townsCache.set(slug, towns);
  return towns;
}
