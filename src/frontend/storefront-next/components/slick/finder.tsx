"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlickProductCard } from "@/components/slick/product-card";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/types/commerce";

/**
 * İki adımlı ürün bulucu.
 *
 * Seçenekler mağazanın GERÇEK verisinden üretilir: kategoriler Shopify'daki
 * ürün tiplerinden, bütçe aralıkları gerçek fiyatlardan. Kodda sabit kategori
 * ya da fiyat yoktur — başka bir mağazaya bağlandığında kendi verisiyle çalışır.
 */
export function Finder({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [budget, setBudget] = useState<[number, number] | null>(null);

  const currency = products[0]?.currencyCode ?? "USD";

  // Kategoriler: gerçek ürün tipleri, ürün sayısına göre
  const categories = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      if (p.productType) m.set(p.productType, (m.get(p.productType) ?? 0) + 1);
    }
    return [...m.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [products]);

  // Bütçe aralıkları: seçilen kategorinin gerçek fiyat dağılımından
  const budgets = useMemo(() => {
    const list = category ? products.filter((p) => p.productType === category) : products;
    const fiyatlar = list.map((p) => p.price).filter((n) => n > 0).sort((a, b) => a - b);
    if (fiyatlar.length < 3) return [];
    const q = (r: number) => fiyatlar[Math.floor((fiyatlar.length - 1) * r)];
    return [
      [fiyatlar[0], q(0.33)],
      [q(0.33), q(0.66)],
      [q(0.66), fiyatlar[fiyatlar.length - 1]],
    ] as [number, number][];
  }, [products, category]);

  const results = useMemo(() => {
    if (!category || !budget) return [];
    return products
      .filter((p) => p.productType === category && p.price >= budget[0] && p.price <= budget[1])
      .slice(0, 8);
  }, [products, category, budget]);

  const step = !category ? 1 : !budget ? 2 : 3;

  return (
    <div className="sg-container py-14 md:py-20">
      {/* Adım göstergesi */}
      <ol className="mb-10 flex items-center justify-center gap-8">
        {["Category", "Budget", "Match"].map((label, i) => {
          const n = i + 1;
          const active = step >= n;
          return (
            <li key={label} className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-[12px]"
                style={{
                  border: `1px solid ${active ? "var(--sg-red)" : "var(--lx-line)"}`,
                  color: active ? "var(--sg-red)" : "var(--lx-stone)",
                  fontFamily: "var(--font-owners)",
                }}
              >
                {n}
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.16em]"
                style={{
                  fontFamily: "var(--font-owners)",
                  color: active ? "var(--lx-ink)" : "var(--lx-stone)",
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <Adim baslik="What are you shopping for?">
          {categories.map(([name, n]) => (
            <Secenek key={name} onClick={() => setCategory(name)}>
              {name}
              <span className="ml-2 text-[12px] opacity-50">{n}</span>
            </Secenek>
          ))}
        </Adim>
      )}

      {step === 2 && (
        <Adim baslik="What's your budget?">
          {budgets.map(([min, max]) => (
            <Secenek key={`${min}-${max}`} onClick={() => setBudget([min, max])}>
              {formatMoney(Math.floor(min), currency)} – {formatMoney(Math.ceil(max), currency)}
            </Secenek>
          ))}
        </Adim>
      )}

      {step === 3 && (
        <div>
          <div className="mb-8 text-center">
            <h2 className="lx-title">{results.length ? "Your matches" : "No exact match"}</h2>
            <p className="mt-3 text-[14px] text-[var(--lx-stone)]">
              {category} · {budget ? `${formatMoney(Math.floor(budget[0]), currency)} – ${formatMoney(Math.ceil(budget[1]), currency)}` : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setBudget(null);
              }}
              className="lx-link mt-4"
            >
              Start over
            </button>
          </div>

          {results.length ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <SlickProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-[14px] text-[var(--lx-stone)]">
              Nothing in that range.{" "}
              <Link href="/products" className="lx-link">
                Browse all products
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Adim({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="lx-title">{baslik}</h2>
      <div className="mt-9 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

function Secenek({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lx-finder-opt inline-flex min-h-12 items-center px-6"
      style={{
        border: "1px solid var(--lx-line)",
        fontFamily: "var(--font-owners)",
        fontSize: "13px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--lx-ink)",
      }}
    >
      {children}
    </button>
  );
}
