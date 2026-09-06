"use client";

import Link from "next/link";
import { useState } from "react";
import type { CollectionIndexRow } from "@/services/shopify/storefront-direct";

/**
 * Koleksiyon indeksi — solda satır listesi, sağda eşzamanlı görsel paneli.
 *
 * İmleç bir satıra geldiğinde satır kırmızıya döner, altında ince bir çizgi
 * belirir ve sağdaki panel o koleksiyonun görseline geçer. Görseller üst üste
 * durur, sadece opaklıkları değişir — bu yüzden geçiş takılmadan olur ve
 * her seferinde yeniden yükleme yaşanmaz.
 *
 * İçerik Shopify koleksiyonlarından gelir; kodda koleksiyon adı/görseli sabit
 * değildir, başka bir mağazaya bağlandığında onun koleksiyonları listelenir.
 */
export function CollectionIndex({
  rows,
  eyebrow = "The index",
  title = "All collections",
}: {
  rows: CollectionIndexRow[];
  eyebrow?: string;
  title?: string;
}) {
  const [aktif, setAktif] = useState(0);

  if (!rows.length) return null;

  return (
    <section
      className="w-full"
      style={{
        background: "var(--lx-bone)",
        paddingTop: "var(--lx-section-y)",
        paddingBottom: "var(--lx-section-y)",
      }}
    >
      <div className="sg-container">
        <div className="text-center">
          <p className="lx-eyebrow mb-2">{eyebrow}</p>
          <h2 className="lx-title">{title}</h2>
        </div>

        <div
          className="grid gap-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-14"
          style={{ marginTop: "clamp(24px, 2.6vw, 42px)" }}
        >
          {/* Sol: satır listesi */}
          <ul className="m-0 list-none p-0">
            {rows.map((row, i) => {
              const secili = i === aktif;
              return (
                <li key={row.handle}>
                  <Link
                    href={row.href}
                    onMouseEnter={() => setAktif(i)}
                    onFocus={() => setAktif(i)}
                    className="lx-idx group flex items-center gap-4 py-3.5 sm:gap-7"
                    style={{ color: secili ? "var(--sg-red)" : "var(--lx-ink)" }}
                  >
                    {/* Sıra numarası */}
                    <span
                      className="shrink-0 tabular-nums"
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "12px",
                        letterSpacing: "0.1em",
                        color: secili ? "var(--sg-red)" : "var(--lx-stone)",
                      }}
                    >
                      [ {String(i + 1).padStart(3, "0")} ]
                    </span>

                    {/* Ürün sayısı */}
                    <span
                      className="hidden shrink-0 tabular-nums sm:block"
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "12px",
                        letterSpacing: "0.1em",
                        color: secili ? "var(--sg-red)" : "var(--lx-stone)",
                        minWidth: "82px",
                      }}
                    >
                      {row.count}
                      {row.count >= 24 ? "+" : ""} ITEMS
                    </span>

                    {/* Koleksiyon adı */}
                    <span
                      className="min-w-0 flex-1 truncate uppercase"
                      style={{
                        fontFamily: "var(--font-owners-black)",
                        fontWeight: 900,
                        fontSize: "clamp(17px, 1.9vw, 26px)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {row.title}
                    </span>

                    {/* Sağ uç */}
                    <span
                      className="hidden shrink-0 items-center gap-2 sm:flex"
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "12px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: secili ? "var(--sg-red)" : "var(--lx-stone)",
                      }}
                    >
                      Shop
                      <span
                        aria-hidden="true"
                        className="lx-idx-arrow inline-block"
                      >
                        ↗
                      </span>
                    </span>

                    {/* Altta beliren ince kırmızı çizgi */}
                    <span
                      aria-hidden="true"
                      className="lx-idx-rule pointer-events-none absolute inset-x-0 bottom-0 block h-px"
                      style={{ background: "var(--sg-red)" }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sağ: eşzamanlı görsel paneli — mobilde gizli */}
          <div className="relative hidden aspect-[4/5] self-start overflow-hidden lg:block">
            {rows.map((row, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={row.handle}
                src={row.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-contain p-8 transition-opacity duration-500 ease-out"
                style={{ opacity: i === aktif ? 1 : 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
