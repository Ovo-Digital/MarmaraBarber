import type { Product } from "@/types/commerce";

export type SlickPlpSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "bestselling"
  | "rating";

export type SlickPlpFilters = {
  minPrice: number | null;
  maxPrice: number | null;
  types: string[];
  volumes: string[];
  colors: string[];
  minRating: number | null;
};

export const EMPTY_PLP_FILTERS: SlickPlpFilters = {
  minPrice: null,
  maxPrice: null,
  types: [],
  volumes: [],
  colors: [],
  minRating: null,
};

export const SLICK_SORT_OPTIONS: { value: SlickPlpSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best selling" },
  /* "Puana göre" seçeneği kaldırıldı: Shopify'da ürün puanı yok, sıralama
     hiçbir şeyi değiştirmiyordu. */
];

const COLOR_KEYWORDS = [
  "amber",
  "okyanus",
  "limon",
  "kiraz",
  "yeşil",
  "yesil",
  "siyah",
  "black",
  "gold",
  "matte",
  "caramel",
  "tutun",
  "vanilya",
  "obsessed",
  "hangover",
  "noir",
] as const;

const COLOR_LABEL: Record<string, string> = {
  amber: "Amber",
  okyanus: "Okyanus",
  limon: "Limon",
  kiraz: "Kiraz",
  yeşil: "Yeşil",
  yesil: "Yeşil",
  siyah: "Siyah",
  black: "Siyah",
  gold: "Gold",
  matte: "Matte",
  caramel: "Caramel",
  tutun: "Tütün",
  vanilya: "Vanilya",
  obsessed: "Obsessed",
  hangover: "Hangover",
  noir: "Noir",
};

const COLOR_SWATCH: Record<string, string> = {
  amber: "#c47a2c",
  okyanus: "#1a5f7a",
  limon: "#d4c84a",
  kiraz: "#a3182e",
  yeşil: "#2d6a3e",
  yesil: "#2d6a3e",
  siyah: "#111111",
  black: "#111111",
  gold: "#c9a227",
  matte: "#6b6b6b",
  caramel: "#a66a2c",
  tutun: "#5c4033",
  vanilya: "#e8d5a3",
  obsessed: "#2a1a3a",
  hangover: "#3d1f2e",
  noir: "#0a0a0a",
};

export function extractVolume(title: string): string | null {
  const m = title.match(/(\d+)\s*ml/i);
  return m ? `${m[1]} ml` : null;
}

export function extractColorKey(title: string): string | null {
  const lower = title.toLowerCase();
  for (const key of COLOR_KEYWORDS) {
    if (lower.includes(key)) return key === "yesil" ? "yeşil" : key === "black" ? "siyah" : key;
  }
  return null;
}

export function colorLabel(key: string): string {
  return COLOR_LABEL[key] ?? key;
}

export function colorSwatch(key: string): string {
  return COLOR_SWATCH[key] ?? "#888";
}

export function buildPlpFacets(products: Product[]) {
  const types = new Map<string, number>();
  const volumes = new Map<string, number>();
  const colors = new Map<string, number>();
  let min = Infinity;
  let max = 0;

  for (const p of products) {
    if (p.price > 0) {
      min = Math.min(min, p.price);
      max = Math.max(max, p.price);
    }
    if (p.productType) types.set(p.productType, (types.get(p.productType) || 0) + 1);
    const vol = extractVolume(p.title);
    if (vol) volumes.set(vol, (volumes.get(vol) || 0) + 1);
    const color = extractColorKey(p.title);
    if (color) colors.set(color, (colors.get(color) || 0) + 1);
  }

  const sortCount = (a: [string, number], b: [string, number]) => b[1] - a[1] || a[0].localeCompare(b[0], "tr");

  return {
    priceMin: Number.isFinite(min) ? Math.floor(min) : 0,
    priceMax: max > 0 ? Math.ceil(max) : 0,
    types: [...types.entries()].sort(sortCount).map(([value, count]) => ({ value, count })),
    volumes: [...volumes.entries()]
      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
      .map(([value, count]) => ({ value, count })),
    colors: [...colors.entries()].sort(sortCount).map(([value, count]) => ({ value, count })),
  };
}

export function countActiveFilters(f: SlickPlpFilters): number {
  return (
    (f.minPrice != null ? 1 : 0) +
    (f.maxPrice != null ? 1 : 0) +
    f.types.length +
    f.volumes.length +
    f.colors.length +
    (f.minRating != null ? 1 : 0)
  );
}

export function hasActiveFilters(f: SlickPlpFilters): boolean {
  return countActiveFilters(f) > 0;
}

export function filterProducts(products: Product[], f: SlickPlpFilters): Product[] {
  return products.filter((p) => {
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.types.length && (!p.productType || !f.types.includes(p.productType))) return false;
    if (f.volumes.length) {
      const vol = extractVolume(p.title);
      if (!vol || !f.volumes.includes(vol)) return false;
    }
    if (f.colors.length) {
      const color = extractColorKey(p.title);
      if (!color || !f.colors.includes(color)) return false;
    }
    if (f.minRating != null && (p.rating ?? 0) < f.minRating) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SlickPlpSort): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "newest":
      return list.sort((a, b) => Number(b.id) - Number(a.id));
    case "bestselling":
      return list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case "rating":
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "featured":
      return list;
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

export type ActiveChip = {
  id: string;
  label: string;
  clear: (f: SlickPlpFilters) => SlickPlpFilters;
};

export function activeFilterChips(f: SlickPlpFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (f.minPrice != null) {
    chips.push({
      id: "minPrice",
      label: `Min ${f.minPrice} ₺`,
      clear: (prev) => ({ ...prev, minPrice: null }),
    });
  }
  if (f.maxPrice != null) {
    chips.push({
      id: "maxPrice",
      label: `Max ${f.maxPrice} ₺`,
      clear: (prev) => ({ ...prev, maxPrice: null }),
    });
  }
  for (const t of f.types) {
    chips.push({
      id: `type:${t}`,
      label: t,
      clear: (prev) => ({ ...prev, types: prev.types.filter((x) => x !== t) }),
    });
  }
  for (const v of f.volumes) {
    chips.push({
      id: `vol:${v}`,
      label: v,
      clear: (prev) => ({ ...prev, volumes: prev.volumes.filter((x) => x !== v) }),
    });
  }
  for (const c of f.colors) {
    chips.push({
      id: `color:${c}`,
      label: colorLabel(c),
      clear: (prev) => ({ ...prev, colors: prev.colors.filter((x) => x !== c) }),
    });
  }
  if (f.minRating != null) {
    chips.push({
      id: "rating",
      label: `${f.minRating}★ ve üzeri`,
      clear: (prev) => ({ ...prev, minRating: null }),
    });
  }
  return chips;
}

export const PLP_PAGE_SIZE = 12;
