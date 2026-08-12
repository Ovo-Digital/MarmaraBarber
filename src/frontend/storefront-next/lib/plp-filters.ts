import type { ProductFacet } from "@/types/commerce";

export type PlpSortOption = "relevance" | "price-asc" | "price-desc" | "new";

const FILTER_LABEL_TR: Record<string, string> = {
  Price: "Fiyat",
  Availability: "Stok",
  "Product type": "Kategori",
  "Product vendor": "Marka",
  Vendor: "Marka",
  Tag: "Etiket",
};

export function translateFacetLabel(label: string): string {
  return FILTER_LABEL_TR[label] ?? label;
}

/** URL `f` param — Shopify facet value `input` JSON */
export function parseFilterParams(filterParam?: string | string[]): string[] {
  if (!filterParam) return [];
  const list = Array.isArray(filterParam) ? filterParam : [filterParam];
  return list.map((item) => {
    try {
      return decodeURIComponent(item);
    } catch {
      return item;
    }
  });
}

export function encodeFilterParam(input: string): string {
  return encodeURIComponent(input);
}

export function parseFilterInputsForApi(inputs: string[]): Record<string, unknown>[] {
  return inputs.map((raw) => JSON.parse(raw) as Record<string, unknown>);
}

export function isFilterInputActive(activeInputs: string[], valueInput: string): boolean {
  return activeInputs.includes(valueInput);
}

export function toggleFilterInput(activeInputs: string[], valueInput: string): string[] {
  if (activeInputs.includes(valueInput)) {
    return activeInputs.filter((item) => item !== valueInput);
  }
  return [...activeInputs, valueInput];
}

export function parseSortParam(sort?: string): PlpSortOption {
  if (sort === "price-asc" || sort === "price-desc" || sort === "new") return sort;
  return "relevance";
}

export function dedupeFacet(facet: ProductFacet): ProductFacet {
  const seen = new Set<string>();
  return {
    ...facet,
    values: facet.values.filter((value) => {
      const key = `${value.label}:${value.input}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return value.count > 0 || value.label.length > 0;
    }),
  };
}

export function normalizeFacets(facets: ProductFacet[]): ProductFacet[] {
  return facets.map(dedupeFacet).filter((facet) => facet.values.length > 0);
}

export const SORT_OPTIONS: { value: PlpSortOption; label: string; searchParam?: string }[] = [
  { value: "relevance", label: "Önerilen" },
  { value: "price-asc", label: "Fiyat: Düşükten Yükseğe", searchParam: "price-asc" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe", searchParam: "price-desc" },
  { value: "new", label: "En Yeniler", searchParam: "new" },
];

export function buildPlpSearchParams(options: {
  sort: PlpSortOption;
  filterInputs: string[];
}): URLSearchParams {
  const params = new URLSearchParams();
  if (options.sort !== "relevance" && options.sort !== "new") {
    params.set("sort", options.sort);
  } else if (options.sort === "new") {
    params.set("sort", "new");
  }
  for (const input of options.filterInputs) {
    params.append("f", encodeFilterParam(input));
  }
  return params;
}
