import Link from "next/link";

/**
 * Koyu bordo → kırmızı degradeli tanıtım karoları.
 *
 * İçerik prop olarak gelir; kodda kampanya metni sabit değildir. Böylece
 * başka bir mağazaya devredildiğinde kendi kampanyaları yazılır.
 *
 * ÖNEMLİ: Buraya indirim oranı / kampanya vaadi yazılacaksa gerçek olmalı.
 * Var olmayan bir indirimi duyurmak müşteriyi yanıltır.
 */
export type PromoTile = {
  eyebrow?: string;
  title: string;
  cta: string;
  href: string;
};

export function PromoTiles({ tiles }: { tiles: PromoTile[] }) {
  if (!tiles.length) return null;

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
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {tiles.map((t) => (
            <Link
              key={t.href + t.title}
              href={t.href}
              className="lx-red-field lx-red-field-hover group relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden p-8 text-center sm:min-h-[340px] sm:p-12"
            >
              {t.eyebrow ? (
                <p className="lx-eyebrow mb-3" style={{ color: "rgba(255,255,255,0.62)" }}>
                  {t.eyebrow}
                </p>
              ) : null}

              <h3
                className="uppercase"
                style={{
                  fontFamily: "var(--font-owners-black)",
                  fontWeight: 900,
                  fontSize: "clamp(26px, 3vw, 42px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                  whiteSpace: "pre-line",
                }}
              >
                {t.title}
              </h3>

              <span
                className="mt-7 inline-flex items-center gap-2 pb-1"
                style={{
                  fontFamily: "var(--font-owners)",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  borderBottom: "1px solid rgba(255,255,255,0.45)",
                }}
              >
                {t.cta}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 group-hover:translate-x-1"
                  style={{ transitionTimingFunction: "var(--lx-ease)" }}
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
