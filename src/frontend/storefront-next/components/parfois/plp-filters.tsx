"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildPlpSearchParams,
  encodeFilterParam,
  isFilterInputActive,
  parseSortParam,
  SORT_OPTIONS,
  toggleFilterInput,
  translateFacetLabel,
} from "@/lib/plp-filters";
import type { ProductFacet } from "@/types/commerce";

type PlpFiltersProps = {
  facets: ProductFacet[];
  totalCount?: number;
};

export function PlpFilters({ facets, totalCount }: PlpFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openFacetId, setOpenFacetId] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const activeInputs = searchParams.getAll("f").map((item) => {
    try {
      return decodeURIComponent(item);
    } catch {
      return item;
    }
  });
  const sort = parseSortParam(searchParams.get("sort") ?? undefined);

  const pushParams = useCallback(
    (nextSort: typeof sort, nextFilters: string[]) => {
      const params = buildPlpSearchParams({ sort: nextSort, filterInputs: nextFilters });
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const toggleValue = (input: string) => {
    const next = toggleFilterInput(activeInputs, input);
    pushParams(sort, next);
  };

  const changeSort = (value: (typeof SORT_OPTIONS)[number]["value"]) => {
    pushParams(value, activeInputs);
    setSortOpen(false);
  };

  const clearFilters = () => {
    pushParams(sort, []);
    setOpenFacetId(null);
  };

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpenFacetId(null);
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Önerilen";
  const hasActiveFilters = activeInputs.length > 0;

  if (facets.length === 0 && !hasActiveFilters) {
    return (
      <div className="flex items-center justify-between border-t border-[#efefef] px-4 py-3 lg:px-8">
        <p className="text-[11px] text-[#666]">
          {typeof totalCount === "number" ? `${totalCount} ürün` : ""}
        </p>
        <SortControl
          open={sortOpen}
          onToggle={() => {
            setSortOpen((v) => !v);
            setOpenFacetId(null);
          }}
          sortLabel={sortLabel}
          onSelect={changeSort}
        />
      </div>
    );
  }

  return (
    <div ref={barRef} className="border-t border-[#efefef] bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facets.map((facet) => {
            const activeCount = facet.values.filter((v) => isFilterInputActive(activeInputs, v.input)).length;
            const isOpen = openFacetId === facet.id;
            return (
              <div key={facet.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOpenFacetId(isOpen ? null : facet.id);
                    setSortOpen(false);
                  }}
                  className={`flex items-center gap-2 border px-3 py-2 text-[11px] uppercase tracking-[0.06em] ${
                    activeCount > 0 ? "border-black font-medium" : "border-[#d9d9d9] font-normal hover:border-black"
                  }`}
                >
                  {translateFacetLabel(facet.label)}
                  {activeCount > 0 ? ` (${activeCount})` : ""}
                  <ChevronDown />
                </button>
                {isOpen && (
                  <div className="absolute left-0 top-full z-40 mt-1 max-h-64 min-w-[220px] overflow-y-auto border border-[#e5e5e5] bg-white py-2 shadow-lg">
                    {facet.values.map((value) => {
                      const checked = isFilterInputActive(activeInputs, value.input);
                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => toggleValue(value.input)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-[12px] hover:bg-[#f5f5f5]"
                        >
                          <span className={checked ? "font-medium" : ""}>{value.label}</span>
                          <span className="text-[#999] tabular-nums">{value.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-[#666] underline hover:text-black"
            >
              Temizle
            </button>
          )}
        </div>

        <SortControl
          open={sortOpen}
          onToggle={() => {
            setSortOpen((v) => !v);
            setOpenFacetId(null);
          }}
          sortLabel={sortLabel}
          onSelect={changeSort}
        />
      </div>

      {typeof totalCount === "number" && (
        <p className="border-t border-[#f5f5f5] px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-[#999] lg:px-8">
          {totalCount} ürün
        </p>
      )}
    </div>
  );
}

function SortControl({
  open,
  onToggle,
  sortLabel,
  onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  sortLabel: string;
  onSelect: (value: (typeof SORT_OPTIONS)[number]["value"]) => void;
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 p-1 text-[11px] uppercase tracking-[0.06em] hover:opacity-60"
        aria-label="Sırala"
      >
        <SortIcon />
        <span className="hidden sm:inline">{sortLabel}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 min-w-[200px] border border-[#e5e5e5] bg-white py-1 shadow-lg">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className="block w-full px-4 py-2 text-left text-[12px] hover:bg-[#f5f5f5]"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

/** URL’den aktif filtreleri okumak için yardımcı */
export function readActiveFiltersFromParams(searchParams: URLSearchParams): string[] {
  return searchParams.getAll("f").map((item) => {
    try {
      return decodeURIComponent(item);
    } catch {
      return item;
    }
  });
}

export { encodeFilterParam };
