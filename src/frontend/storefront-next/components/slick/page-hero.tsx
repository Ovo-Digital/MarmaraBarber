"use client";

import { useKoyuUstBildir } from "@/lib/use-koyu-ust";

/**
 * İç sayfaların üst bandı — koleksiyon sayfasındakiyle aynı dil.
 *
 * Koyu olduğu için header'a "üstüm koyu" diye haber veriyor; hap şeffaf durup
 * bandın üzerinde yüzüyor, sayfanın en üstünde beyaz bir boşluk kalmıyor.
 */
export function PageHero({
  eyebrow,
  title,
  subline,
  children,
}: {
  eyebrow?: string;
  title: string;
  subline?: string;
  /** Sağda duracak ek içerik (ör. çıkış yap) */
  children?: React.ReactNode;
}) {
  useKoyuUstBildir();

  return (
    <section
      data-dark-top
      className="relative w-full overflow-hidden"
      style={{ background: "var(--lx-ink)" }}
    >
      <div className="sg-container flex flex-wrap items-end justify-between gap-6 pb-10 pt-28 sm:pb-14 sm:pt-32">
        <div className="min-w-0">
          {eyebrow ? <p className="lx-eyebrow mb-3">{eyebrow}</p> : null}
          <h1
            className="uppercase"
            style={{
              fontFamily: "var(--font-owners-black)",
              fontWeight: 900,
              fontSize: "clamp(34px, 5vw, 68px)",
              lineHeight: 1.02,
              color: "#ffffff",
            }}
          >
            {title}
          </h1>
          {subline ? (
            <p className="mt-4 max-w-[52ch] text-[15px]" style={{ color: "rgba(255,255,255,0.65)" }}>
              {subline}
            </p>
          ) : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}
