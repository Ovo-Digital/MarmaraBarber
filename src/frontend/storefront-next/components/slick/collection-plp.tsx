"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SlickProductCard } from "@/components/slick/product-card";
import {
  EMPTY_PLP_FILTERS,
  activeFilterChips,
  buildPlpFacets,
  filterProducts,
  hasActiveFilters,
  PLP_PAGE_SIZE,
  SLICK_SORT_OPTIONS,
  sortProducts,
  type SlickPlpFilters,
  type SlickPlpSort,
} from "@/lib/slick-plp";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import type { Product } from "@/types/commerce";
import { useKoyuUstBildir } from "@/lib/use-koyu-ust";
import { useUiStore } from "@/store/ui-store";
import { formatMoney } from "@/lib/money";

type Props = {
  title: string;
  description?: string;
  /** Artık kullanılmıyor: bant düz mürekkep zemin (bulanık ürün kırpıntısı kaldırıldı) */
  image?: string;
  products: Product[];
};

export function SlickCollectionPlp({ title, description, image, products }: Props) {
  // Üstteki koyu hero bandı: header şeffaf durabilir
  useKoyuUstBildir();

  const facets = useMemo(() => buildPlpFacets(products), [products]);
  const [filters, setFilters] = useState<SlickPlpFilters>(EMPTY_PLP_FILTERS);
  /** Filtre kolonu açık mı? Kapanınca kolon tamamen kalkıyor, ürünler genişliyor. */
  const [filtreAcik, setFiltreAcik] = useState(true);
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
              {filtered.length} / {products.length} products
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
            <SiralamaSecici value={sort} onChange={setSort} />
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
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="sg-container pt-8">
        <div className="flex gap-10">
          {/* 3. Desktop sidebar */}
          {filtreAcik ? (
            <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
              <div className="sticky top-[calc(var(--sg-header-h)+3rem)] max-h-[calc(100vh-var(--sg-header-h)-4rem)] overflow-y-auto pr-2">
                <FilterPanel
                  facets={facets}
                  value={filters}
                  onChange={setFilters}
                  onClear={clearAll}
                  onKapat={() => setFiltreAcik(false)}
                />
              </div>
            </aside>
          ) : null}

          {/* 4 + 5 + 6. Grid / load more / empty */}
          <div className="min-w-0 flex-1">
            {/* Kolon kapalıyken tekrar açmanın tek yolu bu düğme */}
            {!filtreAcik ? (
              <button
                type="button"
                onClick={() => setFiltreAcik(true)}
                className="mb-6 hidden items-center gap-2 lg:inline-flex"
              >
                <span
                  className="uppercase"
                  style={{
                    fontFamily: "var(--font-owners-black)",
                    fontWeight: 900,
                    fontSize: "16px",
                    color: "var(--lx-ink)",
                  }}
                >
                  Filters
                </span>
                <span aria-hidden="true" className="text-[11px]" style={{ color: "rgba(20,17,15,0.5)" }}>
                  ▸
                </span>
              </button>
            ) : null}
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
                      Showing {shown.length} of {filtered.length}
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
  count,
}: {
  title: string;
  description?: string;
  /** Artık okunmuyor: bant düz mürekkep zemin (bulanık ürün kırpıntısı kaldırıldı) */
  image?: string;
  count: number;
}) {
  return (
    <section
      data-dark-top
      className="relative overflow-hidden text-white"
      style={{ background: "var(--lx-ink)" }}
    >
      {/* Arka planda bulanık ürün fotoğrafı yerine düz mürekkep zemin.
          Yakınlaştırılmış etiket kırpıntısı okunmuyordu ve kaza gibi duruyordu;
          sade zemin hem daha lüks hem başlığı öne çıkarıyor. */}
      <div className="sg-container relative py-16 md:py-24">
        <p className="lx-eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
          Collection
        </p>
        <h1
          className="mt-3 max-w-3xl uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(30px, 4.4vw, 62px)",
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            color: "#ffffff",
          }}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70">{description}</p>
        ) : null}
        <p className="lx-eyebrow mt-7" style={{ color: "rgba(255,255,255,0.45)" }}>
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>
    </section>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="py-24 text-center">
      <p className="sg-heading text-[28px]">No products match these filters</p>
      <p className="sg-body mx-auto mt-4 max-w-md text-[#666]">
        Clear filtersyip koleksiyondaki tüm ürünlere tekrar göz atabilirsin.
      </p>
      <button type="button" className="sg-btn-red mt-8" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}

function ListRow({ product }: { product: Product }) {
  const add = useShopifyCartStore((s) => s.add);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
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
        {/* Yıldız puanı kaldırıldı: Shopify'da ürün puanı yok, uydurma sayıydı. */}
        <p className="sg-price mt-2 text-[15px]">
          {formatMoney(product.price, product.currencyCode)}
        </p>
      </div>
      <button
        type="button"
        disabled={!product.availableForSale}
        className="sg-btn hidden shrink-0 !px-4 !py-2.5 text-[10px] sm:inline-flex"
        onClick={() => {
          add(product);
          openCartDrawer();
        }}
      >
        {product.availableForSale ? "Add to cart" : "Sold out"}
      </button>
    </li>
  );
}
/** Sıralama seçici — tarayıcının kendi menüsü yerine marka dilinde açılır liste */
function SiralamaSecici({
  value,
  onChange,
}: {
  value: SlickPlpSort;
  onChange: (v: SlickPlpSort) => void;
}) {
  const [acik, setAcik] = useState(false);
  const kutuRef = useRef<HTMLDivElement | null>(null);
  const secili = SLICK_SORT_OPTIONS.find((o) => o.value === value);

  // Dışarı tıklayınca kapansın
  useEffect(() => {
    if (!acik) return;
    const disari = (e: MouseEvent) => {
      if (kutuRef.current && !kutuRef.current.contains(e.target as Node)) setAcik(false);
    };
    document.addEventListener("mousedown", disari);
    return () => document.removeEventListener("mousedown", disari);
  }, [acik]);

  return (
    <div ref={kutuRef} className="relative">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        aria-haspopup="listbox"
        className="flex min-w-[190px] items-center justify-between gap-4 px-4 py-3 uppercase"
        style={{
          fontFamily: "var(--font-owners)",
          fontSize: "11px",
          letterSpacing: "0.14em",
          color: "var(--lx-ink)",
          border: "1px solid rgba(20,17,15,0.22)",
        }}
      >
        <span className="truncate">{secili?.label ?? "Sort"}</span>
        <span
          aria-hidden="true"
          className="text-[9px]"
          style={{
            color: "rgba(20,17,15,0.5)",
            transform: acik ? "rotate(180deg)" : "none",
            transition: "transform 220ms var(--lx-ease)",
          }}
        >
          ▼
        </span>
      </button>

      {acik ? (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-1 m-0 w-[240px] list-none p-0"
          style={{
            background: "var(--lx-ink)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 60px rgba(20,17,15,0.35)",
          }}
        >
          {SLICK_SORT_OPTIONS.map((o) => {
            const isActive = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(o.value);
                    setAcik(false);
                  }}
                  className="block w-full px-4 py-3 text-left uppercase transition-colors"
                  style={{
                    fontFamily: "var(--font-owners)",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    color: isActive ? "var(--sg-red)" : "rgba(255,255,255,0.8)",
                  }}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Açılıp kapanan filtre bölümü — başlığa basınca içerik görünür/gizlenir */
function FiltreBolumu({
  baslik,
  children,
  acikBasla = true,
}: {
  baslik: string;
  children: React.ReactNode;
  acikBasla?: boolean;
}) {
  const [acik, setAcik] = useState(acikBasla);

  return (
    <div style={{ borderTop: "1px solid rgba(20,17,15,0.12)" }}>
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--font-owners)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "var(--lx-ink)",
          }}
        >
          {baslik}
        </span>
        {/* Artı/eksi: açıkken yatay çizgi, kapalıyken artı */}
        <span aria-hidden="true" className="relative block h-3 w-3 shrink-0">
          <span
            className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2"
            style={{ background: "var(--lx-ink)" }}
          />
          <span
            className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2"
            style={{
              background: "var(--lx-ink)",
              transform: acik ? "translateX(-50%) scaleY(0)" : "translateX(-50%) scaleY(1)",
              transition: "transform 260ms var(--lx-ease)",
            }}
          />
        </span>
      </button>

      {acik ? <div className="pb-5">{children}</div> : null}
    </div>
  );
}

/** Kare kutucuk — işaretliyken marka kırmızısı */
function Kutucuk({
  isaretli,
  onChange,
  etiket,
  adet,
}: {
  isaretli: boolean;
  onChange: () => void;
  etiket: string;
  adet: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={isaretli}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="flex h-4 w-4 shrink-0 items-center justify-center"
        style={{
          border: `1px solid ${isaretli ? "var(--sg-red)" : "rgba(20,17,15,0.35)"}`,
          background: isaretli ? "var(--sg-red)" : "transparent",
          transition: "background 180ms var(--lx-ease), border-color 180ms var(--lx-ease)",
        }}
      >
        {isaretli ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px]" style={{ color: "var(--lx-ink)" }}>
        {etiket}
      </span>
      <span className="text-[11px]" style={{ color: "rgba(20,17,15,0.45)" }}>
        {adet}
      </span>
    </label>
  );
}

function FilterPanel({
  facets,
  value,
  onChange,
  onClear,
  onKapat,
}: {
  facets: ReturnType<typeof buildPlpFacets>;
  value: SlickPlpFilters;
  onChange: (next: SlickPlpFilters) => void;
  onClear: () => void;
  /** Verilirse başlık tıklanabilir olur ve kolon yerleşimden çıkar.
   *  Mobil çekmecede kolon kavramı yok, o yüzden verilmiyor. */
  onKapat?: () => void;
}) {
  const toggleArr = (key: "types" | "volumes" | "colors", item: string) => {
    const list = value[key];
    onChange({
      ...value,
      [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    });
  };

  return (
    <div>
      {/* Panel başlığı */}
      <div className="flex items-center justify-between pb-4">
        {onKapat ? (
          <button
            type="button"
            onClick={onKapat}
            aria-expanded="true"
            className="flex items-center gap-2"
          >
            <span className="lx-filtre-baslik">Filters</span>
            <span aria-hidden="true" className="text-[11px]" style={{ color: "rgba(20,17,15,0.5)" }}>
              ▾
            </span>
          </button>
        ) : (
          <span className="lx-filtre-baslik">Filters</span>
        )}

        {hasActiveFilters(value) && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "var(--sg-red)", fontFamily: "var(--font-owners)" }}
          >
            Clear
          </button>
        )}
      </div>

      <div>
          <FiltreBolumu baslik="Price">
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder={String(facets.priceMin)}
                value={value.minPrice ?? ""}
                onChange={(e) =>
                  onChange({ ...value, minPrice: e.target.value === "" ? null : Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 text-[13px] outline-none"
                style={{ border: "1px solid rgba(20,17,15,0.22)", color: "var(--lx-ink)" }}
                aria-label="Min price"
              />
              <span style={{ color: "rgba(20,17,15,0.4)" }}>–</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder={String(facets.priceMax)}
                value={value.maxPrice ?? ""}
                onChange={(e) =>
                  onChange({ ...value, maxPrice: e.target.value === "" ? null : Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 text-[13px] outline-none"
                style={{ border: "1px solid rgba(20,17,15,0.22)", color: "var(--lx-ink)" }}
                aria-label="Max price"
              />
            </div>
            {facets.priceMax > 0 && (
              <input
                type="range"
                min={facets.priceMin}
                max={facets.priceMax}
                value={value.maxPrice ?? facets.priceMax}
                onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
                className="mt-4 w-full"
                style={{ accentColor: "var(--sg-red)" }}
                aria-label="Maximum price"
              />
            )}
          </FiltreBolumu>

          {facets.types.length > 0 && (
            <FiltreBolumu baslik="Category">
              <ul className="max-h-56 space-y-0 overflow-y-auto">
                {facets.types.map((t) => (
                  <li key={t.value}>
                    <Kutucuk
                      isaretli={value.types.includes(t.value)}
                      onChange={() => toggleArr("types", t.value)}
                      etiket={t.value}
                      adet={t.count}
                    />
                  </li>
                ))}
              </ul>
            </FiltreBolumu>
          )}

          {facets.volumes.length > 0 && (
            <FiltreBolumu baslik="Size" acikBasla={false}>
              <ul className="max-h-56 space-y-0 overflow-y-auto">
                {facets.volumes.map((v) => (
                  <li key={v.value}>
                    <Kutucuk
                      isaretli={value.volumes.includes(v.value)}
                      onChange={() => toggleArr("volumes", v.value)}
                      etiket={v.value}
                      adet={v.count}
                    />
                  </li>
                ))}
              </ul>
            </FiltreBolumu>
          )}
      </div>
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
