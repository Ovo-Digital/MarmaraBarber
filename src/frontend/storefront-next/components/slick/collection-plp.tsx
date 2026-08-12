"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SlickProductCard } from "@/components/slick/product-card";
import { formatTry } from "@/lib/marmara-catalog";
import {
  EMPTY_PLP_FILTERS,
  activeFilterChips,
  buildPlpFacets,
  colorLabel,
  colorSwatch,
  filterProducts,
  hasActiveFilters,
  PLP_PAGE_SIZE,
  SLICK_SORT_OPTIONS,
  sortProducts,
  type SlickPlpFilters,
  type SlickPlpSort,
} from "@/lib/slick-plp";
import { useLocalCartStore } from "@/store/local-cart-store";
import type { Product } from "@/types/commerce";

type Props = {
  title: string;
  description?: string;
  image?: string;
  products: Product[];
};

export function SlickCollectionPlp({ title, description, image, products }: Props) {
  const facets = useMemo(() => buildPlpFacets(products), [products]);
  const [filters, setFilters] = useState<SlickPlpFilters>(EMPTY_PLP_FILTERS);
  const [draft, setDraft] = useState<SlickPlpFilters>(EMPTY_PLP_FILTERS);
  const [sort, setSort] = useState<SlickPlpSort>("featured");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(PLP_PAGE_SIZE);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort],
  );

  const shown = filtered.slice(0, visible);
  const chips = activeFilterChips(filters);
  const canLoadMore = visible < filtered.length;

  useEffect(() => {
    setVisible(PLP_PAGE_SIZE);
  }, [filters, sort]);

  useEffect(() => {
    if (sheetOpen) {
      setDraft(filters);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen, filters]);

  const clearAll = () => {
    setFilters(EMPTY_PLP_FILTERS);
    setDraft(EMPTY_PLP_FILTERS);
  };

  const applyDraft = () => {
    setFilters(draft);
    setSheetOpen(false);
  };

  const draftPreviewCount = useMemo(
    () => filterProducts(products, draft).length,
    [products, draft],
  );

  return (
    <div className="bg-white pb-20">
      {/* 1. Collection header */}
      <CollectionHeader
        title={title}
        description={description}
        image={image}
        count={products.length}
      />

      {/* 2. Sticky filter + sort bar */}
      <div className="sticky top-[calc(var(--sg-promo-h)+var(--sg-header-h))] z-30 border-b border-black/10 bg-white">
        <div className="sg-container flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="sg-nav flex items-center gap-2 border border-black/20 px-3 py-2 text-[11px] lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              Filtrele
              {hasActiveFilters(filters) ? (
                <span className="bg-black px-1.5 py-0.5 text-[9px] text-white">
                  {chips.length}
                </span>
              ) : null}
            </button>
            <p className="hidden text-[13px] text-[#666] lg:block">
              {filtered.length} / {products.length} ürün
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                aria-label="Grid görünüm"
                onClick={() => setView("grid")}
                className={`p-2 ${view === "grid" ? "opacity-100" : "opacity-40"}`}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                aria-label="Liste görünüm"
                onClick={() => setView("list")}
                className={`p-2 ${view === "list" ? "opacity-100" : "opacity-40"}`}
              >
                <ListIcon />
              </button>
            </div>
            <label className="flex items-center gap-2 text-[12px]">
              <span className="sg-nav hidden text-[10px] text-[#888] sm:inline">Sırala</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SlickPlpSort)}
                className="sg-nav max-w-[180px] border border-black/20 bg-white px-2 py-2 text-[11px] outline-none sm:max-w-none"
              >
                {SLICK_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="sg-container flex flex-wrap items-center gap-2 pb-3">
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilters(chip.clear(filters))}
                className="inline-flex items-center gap-2 border border-black/15 bg-[var(--sg-off)] px-2.5 py-1 text-[11px]"
              >
                {chip.label}
                <span aria-hidden>×</span>
              </button>
            ))}
            <button type="button" onClick={clearAll} className="sg-nav text-[10px] underline">
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      <div className="sg-container pt-8">
        <div className="flex gap-10">
          {/* 3. Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="sticky top-[calc(var(--sg-promo-h)+var(--sg-header-h)+4.5rem)] max-h-[calc(100vh-var(--sg-promo-h)-var(--sg-header-h)-5.5rem)] overflow-y-auto pr-2">
              <FilterPanel
                facets={facets}
                value={filters}
                onChange={setFilters}
                onClear={clearAll}
              />
            </div>
          </aside>

          {/* 4 + 5 + 6. Grid / load more / empty */}
          <div className="min-w-0 flex-1">
            {filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <>
                {view === "grid" ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-3">
                    {shown.map((p) => (
                      <SlickProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-black/10 border-y border-black/10">
                    {shown.map((p) => (
                      <ListRow key={p.id} product={p} />
                    ))}
                  </ul>
                )}

                {canLoadMore && (
                  <div className="mt-12 text-center">
                    <p className="mb-4 text-[13px] text-[#666]">
                      {shown.length} / {filtered.length} ürün gösteriliyor
                    </p>
                    <button
                      type="button"
                      className="sg-btn"
                      onClick={() => setVisible((v) => v + PLP_PAGE_SIZE)}
                    >
                      Daha Fazla Yükle
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Kapat"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <h2 className="sg-nav text-[13px]">Filtrele</h2>
              <button type="button" className="text-2xl leading-none" onClick={() => setSheetOpen(false)}>
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterPanel
                facets={facets}
                value={draft}
                onChange={setDraft}
                onClear={() => setDraft(EMPTY_PLP_FILTERS)}
              />
            </div>
            <div className="flex gap-3 border-t border-black/10 p-4">
              <button type="button" className="sg-btn flex-1 !py-3" onClick={() => setDraft(EMPTY_PLP_FILTERS)}>
                Temizle
              </button>
              <button type="button" className="sg-btn-red flex-1 !py-3" onClick={applyDraft}>
                {draftPreviewCount} Ürünü Göster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionHeader({
  title,
  description,
  image,
  count,
}: {
  title: string;
  description?: string;
  image?: string;
  count: number;
}) {
  return (
    <section className="relative overflow-hidden bg-[#1a1a1a] text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45 md:opacity-55"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/40" />
      <div className="sg-container relative py-14 md:py-20">
        <h1 className="sg-heading max-w-3xl">{title}</h1>
        {description ? (
          <p className="sg-body mt-4 max-w-xl text-white/85 md:text-[15px]">{description}</p>
        ) : null}
        <p className="sg-nav mt-5 text-[11px] text-white/70">{count} ürün</p>
      </div>
    </section>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="py-24 text-center">
      <p className="sg-heading text-[28px]">Bu filtrelerle ürün bulunamadı</p>
      <p className="sg-body mx-auto mt-4 max-w-md text-[#666]">
        Filtreleri temizleyip koleksiyondaki tüm ürünlere tekrar göz atabilirsin.
      </p>
      <button type="button" className="sg-btn-red mt-8" onClick={onClear}>
        Filtreleri Temizle
      </button>
    </div>
  );
}

function ListRow({ product }: { product: Product }) {
  const add = useLocalCartStore((s) => s.add);
  return (
    <li className="flex items-center gap-4 py-4">
      <Link href={`/products/${product.handle}`} className="h-24 w-24 shrink-0 bg-[var(--sg-off)] sm:h-28 sm:w-28">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="h-full w-full object-contain p-2" />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.handle}`}>
          <h3 className="sg-product-title text-[13px]">{product.title}</h3>
        </Link>
        <p className="sg-star mt-1 text-[11px]">
          ★★★★★{" "}
          <span className="text-[#666]">
            {(product.rating ?? 4.9).toFixed(1)} ({product.reviewCount ?? 0})
          </span>
        </p>
        <p className="sg-price mt-2 text-[15px]">{formatTry(product.price)}</p>
      </div>
      <button
        type="button"
        disabled={!product.availableForSale}
        className="sg-btn hidden shrink-0 !px-4 !py-2.5 text-[10px] sm:inline-flex"
        onClick={() => add(product)}
      >
        {product.availableForSale ? "Add to cart" : "Sold out"}
      </button>
    </li>
  );
}
function FilterPanel({
  facets,
  value,
  onChange,
  onClear,
}: {
  facets: ReturnType<typeof buildPlpFacets>;
  value: SlickPlpFilters;
  onChange: (next: SlickPlpFilters) => void;
  onClear: () => void;
}) {
  const toggleArr = (key: "types" | "volumes" | "colors", item: string) => {
    const list = value[key];
    onChange({
      ...value,
      [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="sg-nav text-[12px]">Filtreler</h3>
        {hasActiveFilters(value) && (
          <button type="button" onClick={onClear} className="text-[11px] underline">
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Fiyat */}
      <fieldset>
        <legend className="sg-nav mb-3 text-[11px]">Fiyat</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(facets.priceMin)}
            value={value.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                minPrice: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full border border-black/20 px-2 py-2 text-[13px] outline-none"
            aria-label="Min fiyat"
          />
          <span className="text-[#888]">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(facets.priceMax)}
            value={value.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                maxPrice: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full border border-black/20 px-2 py-2 text-[13px] outline-none"
            aria-label="Max fiyat"
          />
        </div>
        {facets.priceMax > 0 && (
          <input
            type="range"
            min={facets.priceMin}
            max={facets.priceMax}
            value={value.maxPrice ?? facets.priceMax}
            onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
            className="mt-3 w-full accent-black"
            aria-label="Maksimum fiyat"
          />
        )}
      </fieldset>

      {/* Tip */}
      {facets.types.length > 0 && (
        <fieldset>
          <legend className="sg-nav mb-3 text-[11px]">Kategori / Tip</legend>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {facets.types.map((t) => (
              <li key={t.value}>
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={value.types.includes(t.value)}
                    onChange={() => toggleArr("types", t.value)}
                    className="accent-black"
                  />
                  <span className="flex-1">{t.value}</span>
                  <span className="text-[11px] text-[#888]">{t.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {/* Hacim */}
      {facets.volumes.length > 0 && (
        <fieldset>
          <legend className="sg-nav mb-3 text-[11px]">Hacim</legend>
          <ul className="max-h-40 space-y-2 overflow-y-auto">
            {facets.volumes.map((v) => (
              <li key={v.value}>
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={value.volumes.includes(v.value)}
                    onChange={() => toggleArr("volumes", v.value)}
                    className="accent-black"
                  />
                  <span className="flex-1">{v.value}</span>
                  <span className="text-[11px] text-[#888]">{v.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {/* Renk / koku swatch */}
      {facets.colors.length > 0 && (
        <fieldset>
          <legend className="sg-nav mb-3 text-[11px]">Renk / Nota</legend>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => {
              const active = value.colors.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  title={`${colorLabel(c.value)} (${c.count})`}
                  onClick={() => toggleArr("colors", c.value)}
                  className={`h-9 w-9 border ${active ? "border-black ring-1 ring-black" : "border-black/20"}`}
                  style={{ background: colorSwatch(c.value) }}
                  aria-pressed={active}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Rating */}
      <fieldset>
        <legend className="sg-nav mb-3 text-[11px]">Puan</legend>
        <ul className="space-y-2">
          {[4, 3, 2].map((r) => (
            <li key={r}>
              <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                <input
                  type="radio"
                  name="plp-rating"
                  checked={value.minRating === r}
                  onChange={() => onChange({ ...value, minRating: r })}
                  className="accent-black"
                />
                {r}★ ve üzeri
              </label>
            </li>
          ))}
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-[13px]">
              <input
                type="radio"
                name="plp-rating"
                checked={value.minRating == null}
                onChange={() => onChange({ ...value, minRating: null })}
                className="accent-black"
              />
              Tümü
            </label>
          </li>
        </ul>
      </fieldset>
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <rect x="1" y="1" width="7" height="7" />
      <rect x="10" y="1" width="7" height="7" />
      <rect x="1" y="10" width="7" height="7" />
      <rect x="10" y="10" width="7" height="7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <rect x="1" y="2" width="16" height="3" />
      <rect x="1" y="7.5" width="16" height="3" />
      <rect x="1" y="13" width="16" height="3" />
    </svg>
  );
}
