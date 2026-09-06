"use client";

import Link from "next/link";
import { useState } from "react";
import type { HeroSlide } from "@/services/shopify/storefront-direct";

/**
 * Ana kategori vitrini — solda satırlar, sağda görsel.
 *
 * GEÇİŞ: görsel tek parça değil, yatay ŞERİTLERE bölünmüş halde çiziliyor.
 * Kategori değişince her şerit sırayla ve yandan kayarak giriyor; bu yüzden
 * görsel yatay çizgilere ayrışarak toparlanıyormuş gibi görünüyor.
 *
 * Şeritler aynı görselin farklı dilimini gösteriyor: her şeride görsel
 * arka plan olarak veriliyor, arka plan yüksekliği şerit sayısı kadar
 * büyütülüp konumu kaydırılıyor. Böylece parçalar birleşince tam görsel çıkıyor.
 *
 * İçerik Shopify koleksiyonlarından gelir; kodda kategori adı/görseli sabit
 * değildir, başka bir mağazaya bağlandığında onun kategorileri çıkar.
 */

/** Görselin bölüneceği yatay şerit sayısı */
const SERIT = 18;

export function CategoryShowcase({
  rows,
  eyebrow = "The range",
  title = "Shop by category",
}: {
  rows: HeroSlide[];
  eyebrow?: string;
  title?: string;
}) {
  const [aktif, setAktif] = useState(0);

  if (!rows.length) return null;

  const gorsel = rows[aktif]?.imageUrl;

  return (
    <section
      className="w-full"
      style={{
        background: "var(--lx-paper)",
        paddingTop: "var(--lx-section-y)",
        paddingBottom: "var(--lx-section-y)",
      }}
    >
      <div className="sg-container">
        <div className="text-center">
          <p className="lx-eyebrow mb-2">{eyebrow}</p>
          <h2 className="lx-title">{title}</h2>
        </div>

        {/* Liste ve görsel eşit ağırlıkta, ortada hizalı — aralarında ölü boşluk yok */}
        <div
          className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16"
          style={{ marginTop: "clamp(28px, 3vw, 48px)" }}
        >
          <ul className="m-0 list-none p-0">
            {rows.map((row, i) => {
              const secili = i === aktif;
              return (
                <li key={row.handle}>
                  <Link
                    href={row.href}
                    onMouseEnter={() => setAktif(i)}
                    onFocus={() => setAktif(i)}
                    className="lx-idx group flex items-center gap-5 py-5 sm:gap-7 sm:py-6"
                    style={{ color: secili ? "var(--sg-red)" : "var(--lx-ink)" }}
                  >
                    <span
                      className="shrink-0 tabular-nums"
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "12px",
                        letterSpacing: "0.14em",
                        color: secili ? "var(--sg-red)" : "var(--lx-stone)",
                      }}
                    >
                      [ {String(i + 1).padStart(3, "0")} ]
                    </span>

                    <span
                      className="min-w-0 flex-1 truncate uppercase"
                      style={{
                        fontFamily: "var(--font-owners-black)",
                        fontWeight: 900,
                        fontSize: "clamp(22px, 2.7vw, 38px)",
                        lineHeight: 1.06,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {row.title}
                    </span>

                    <span
                      className="hidden shrink-0 items-center gap-2 sm:flex"
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "12px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: secili ? "var(--sg-red)" : "var(--lx-stone)",
                      }}
                    >
                      Shop
                      <span aria-hidden="true" className="lx-idx-arrow inline-block">
                        ↗
                      </span>
                    </span>

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

          {/* Şeritli görsel — key değişince şeritler yeniden animasyona giriyor */}
          <div
            aria-hidden="true"
            className="relative hidden aspect-[4/5] w-full overflow-hidden lg:block"
          >
            <div key={aktif} className="absolute inset-0">
              {Array.from({ length: SERIT }, (_, i) => (
                <span
                  key={i}
                  className="lx-slit absolute inset-x-0 block bg-no-repeat"
                  style={{
                    top: `${(i / SERIT) * 100}%`,
                    height: `${100 / SERIT}%`,
                    backgroundImage: gorsel ? `url(${gorsel})` : undefined,
                    backgroundSize: `100% ${SERIT * 100}%`,
                    backgroundPosition: `center ${(i / (SERIT - 1)) * 100}%`,
                    ["--i" as string]: String(i),
                    ["--yon" as string]: i % 2 === 0 ? "-1" : "1",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
