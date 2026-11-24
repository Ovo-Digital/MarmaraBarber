"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlickProductCard } from "@/components/slick/product-card";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/types/commerce";
import { useT } from "@/lib/i18n/dil";
import { FINDER_ALANLAR, type FinderAlan, type FinderSecenek } from "@/lib/slick-theme";

/**
 * Dört adımlı ürün bulucu: alan → tip → bütçe → eşleşme.
 *
 * Alanlar ve tip soruları `FINDER_ALANLAR`'dan, ürünler ve fiyatlar
 * Shopify'dan geliyor. Kodda ürün ya da fiyat sabitlenmiyor.
 */
export function Finder({ products }: { products: Product[] }) {
  const t = useT();
  const [alan, setAlan] = useState<FinderAlan | null>(null);
  const [tip, setTip] = useState<FinderSecenek | null>(null);
  const [budget, setBudget] = useState<[number, number] | null>(null);

  const currency = products[0]?.currencyCode ?? "TRY";

  /* Alana giren ürünler: önce productType eşleşmesi, o boş kalırsa ürün adında
     alan adının kendisi (ör. "sakal") geçenler — katalog farklı etiketlenmişse
     adım boş kalmasın. */
  const alanUrunleri = useMemo(() => {
    if (!alan) return [];
    const tipKumesi = new Set(alan.tipler.map((s) => s.toLocaleLowerCase("tr")));
    const tipeGore = products.filter((p) =>
      tipKumesi.has((p.productType || "").trim().toLocaleLowerCase("tr")),
    );
    if (tipeGore.length) return tipeGore;
    const ad = alan.label.toLocaleLowerCase("tr");
    return products.filter((p) => p.title.toLocaleLowerCase("tr").includes(ad));
  }, [products, alan]);

  /* Tip seçimi: ürün adında anahtar kelimelerden biri geçiyorsa listeye girer.
     Hiçbiri tutmazsa alanın tüm ürünleri gösterilir. */
  const tipUrunleri = useMemo(() => {
    if (!tip) return alanUrunleri;
    const eslesen = alanUrunleri.filter((p) => {
      const ad = p.title.toLocaleLowerCase("tr");
      return tip.anahtar.some((k) => ad.includes(k.toLocaleLowerCase("tr")));
    });
    return eslesen.length ? eslesen : alanUrunleri;
  }, [alanUrunleri, tip]);

  /* Bütçe aralıkları gerçek fiyatlardan. Seçilen tip aralık kurmaya yetmiyorsa
     alanın tamamından hesaplanıyor — bütçe sorusu kaybolmasın. */
  const budgets = useMemo(() => {
    const kaynak = tipUrunleri.length >= 4 ? tipUrunleri : alanUrunleri;
    const fiyatlar = kaynak
      .map((p) => p.price)
      .filter((n) => n > 0)
      .sort((a, b) => a - b);
    if (fiyatlar.length < 4) return [];
    const q = (r: number) => fiyatlar[Math.floor((fiyatlar.length - 1) * r)];
    return [
      [fiyatlar[0], q(0.33)],
      [q(0.33), q(0.66)],
      [q(0.66), fiyatlar[fiyatlar.length - 1]],
    ] as [number, number][];
  }, [tipUrunleri, alanUrunleri]);

  /* Sonuç: önce tipe + bütçeye uyanlar. O aralıkta o tipten ürün yoksa aynı
     bütçedeki diğer alan ürünleri gösteriliyor; hiçbiri yoksa bütçe gözetmeden
     tipin kendisi. Kullanıcı hiçbir durumda boş ekranla kalmıyor. */
  const results = useMemo(() => {
    if (!alan || !tip) return [];
    if (!budget) return tipUrunleri.slice(0, 8);
    const aralikta = (liste: Product[]) =>
      liste.filter((p) => p.price >= budget[0] && p.price <= budget[1]);
    const tam = aralikta(tipUrunleri);
    if (tam.length) return tam.slice(0, 8);
    const yakin = aralikta(alanUrunleri);
    return (yakin.length ? yakin : tipUrunleri).slice(0, 8);
  }, [tipUrunleri, alanUrunleri, alan, tip, budget]);

  /* Ürün sayısı aralık kurmaya yetmiyorsa bütçe adımı atlanıyor —
     tek seçenekli bir soru sormanın anlamı yok. */
  const butceSorulacak = budgets.length > 0;
  const step = !alan ? 1 : !tip ? 2 : butceSorulacak && !budget ? 3 : 4;

  function bastanBasla() {
    setAlan(null);
    setTip(null);
    setBudget(null);
  }

  /* Gösterge hep dört adım: alan seçilmeden bütçe sorulup sorulmayacağı
     bilinmiyor, liste ekranda kısalıp uzamasın. */
  const adimlar = ["Hair or beard", "Type", "Budget", "Match"];
  const gorunenAdim = step;

  return (
    <div className="sg-container py-14 md:py-20">
      {/* Adım göstergesi */}
      <ol className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {adimlar.map((label, i) => {
          const n = i + 1;
          const active = gorunenAdim >= n;
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
                {t(label)}
              </span>
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <Adim baslik={t("Hair or beard?")}>
          {FINDER_ALANLAR.map((a) => (
            <Secenek key={a.id} onClick={() => setAlan(a)}>
              {t(a.label)}
            </Secenek>
          ))}
        </Adim>
      )}

      {step === 2 && alan && (
        <Adim baslik={t(alan.soru)} geri={bastanBasla} geriEtiket={t("Back")}>
          {alan.secenekler.map((s) => (
            <Secenek key={s.label} onClick={() => setTip(s)}>
              {t(s.label)}
            </Secenek>
          ))}
        </Adim>
      )}

      {step === 3 && (
        <Adim baslik={t("What's your budget?")} geri={() => setTip(null)} geriEtiket={t("Back")}>
          {budgets.map(([min, max]) => (
            <Secenek key={`${min}-${max}`} onClick={() => setBudget([min, max])}>
              {formatMoney(Math.floor(min), currency)} – {formatMoney(Math.ceil(max), currency)}
            </Secenek>
          ))}
        </Adim>
      )}

      {step === 4 && (
        <div>
          <div className="mb-8 text-center">
            <h2 className="lx-title">{results.length ? t("Your matches") : t("No exact match")}</h2>
            <p className="mt-3 text-[14px] text-[var(--lx-stone)]">
              {[
                alan ? t(alan.label) : null,
                tip ? t(tip.label) : null,
                budget
                  ? `${formatMoney(Math.floor(budget[0]), currency)} – ${formatMoney(Math.ceil(budget[1]), currency)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <button type="button" onClick={bastanBasla} className="lx-link mt-4">
              {t("Start over")}
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
              {t("Nothing in that range.")}{" "}
              <Link href="/products" className="lx-link">
                {t("Browse all products")}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Adim({
  baslik,
  children,
  geri,
  geriEtiket,
}: {
  baslik: string;
  children: React.ReactNode;
  geri?: () => void;
  geriEtiket?: string;
}) {
  return (
    <div className="text-center">
      <h2 className="lx-title">{baslik}</h2>
      <div className="mt-9 flex flex-wrap justify-center gap-3">{children}</div>
      {geri ? (
        <button type="button" onClick={geri} className="lx-link mt-7">
          {geriEtiket}
        </button>
      ) : null}
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
