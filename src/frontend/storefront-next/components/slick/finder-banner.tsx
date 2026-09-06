import Link from "next/link";

/**
 * "Ürün bulucu" bölümü — koyu zemin, alttan kırmızı ışıma, ortalanmış kurgu.
 *
 * Buton gerçek bir sayfaya gider (/finder). Çalışmayan bir teste yönlendirmek
 * müşteriye verilmiş boş bir söz olurdu.
 */
export function FinderBanner({
  eyebrow = "Not sure where to start",
  title = "Find your formula",
  body = "Answer two quick questions and we'll show you the products that fit.",
  ctaLabel = "Start now",
  href = "/finder",
  steps = ["Pick a category", "Set your budget", "Get your match"],
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  href?: string;
  steps?: string[];
}) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "var(--lx-ink)" }}
    >
      {/* Alttan yükselen kırmızı ışıma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 70% at 50% 118%, rgba(225,6,0,0.42) 0%, rgba(225,6,0,0.10) 45%, rgba(225,6,0,0) 72%)",
        }}
      />

      <div
        className="sg-container relative text-center"
        style={{ paddingTop: "var(--lx-section-y)", paddingBottom: "var(--lx-section-y)" }}
      >
        <p className="lx-eyebrow" style={{ color: "var(--sg-red)" }}>
          {eyebrow}
        </p>

        <h2
          className="mt-5 uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(34px, 5.4vw, 76px)",
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            color: "#ffffff",
          }}
        >
          {title}
        </h2>

        <p className="mx-auto mt-6 max-w-[46ch] text-[15px] leading-relaxed text-white/70">
          {body}
        </p>

        <Link
          href={href}
          className="lx-finder-btn mt-9 inline-flex min-h-12 items-center gap-2 px-9"
          style={{
            background: "var(--sg-red)",
            color: "#ffffff",
            fontFamily: "var(--font-owners)",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {ctaLabel}
          <span aria-hidden="true" className="lx-finder-arrow">
            →
          </span>
        </Link>

        <ol className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px]"
                style={{
                  border: "1px solid var(--sg-red)",
                  color: "var(--sg-red)",
                  fontFamily: "var(--font-owners)",
                }}
              >
                {i + 1}
              </span>
              <span
                className="text-[12px] uppercase tracking-[0.14em] text-white/75"
                style={{ fontFamily: "var(--font-owners)" }}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
