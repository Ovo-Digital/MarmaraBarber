import Link from "next/link";

/**
 * Tam genişlik promosyon bandı: arka planda görsel, ortada büyük başlık,
 * alt metin ve kırmızı çağrı butonu.
 *
 * Tüm içerik prop olarak geliyor — kodda kampanya metni/görseli sabit değil,
 * başka bir mağazaya devredildiğinde buradan değiştirilir.
 */
export function PromoBanner({
  image,
  eyebrow,
  headline,
  subline,
  ctaLabel,
  ctaHref,
}: {
  image?: string;
  /** Başlığın üstünde küçük, harfleri açılmış etiket */
  eyebrow?: string;
  headline: string;
  subline?: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--lx-ink)" }}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Metnin okunması için karartma */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,17,15,.55) 0%, rgba(20,17,15,.30) 45%, rgba(20,17,15,.85) 100%)",
        }}
      />

      <div className="relative flex min-h-[420px] flex-col items-center justify-end px-5 pb-12 pt-24 text-center sm:min-h-[520px] sm:pb-16 md:min-h-[600px]">
        {eyebrow ? (
          <p className="lx-eyebrow mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
            {eyebrow}
          </p>
        ) : null}

        <h2
          className="max-w-[20ch] uppercase"
          style={{
            fontFamily: "var(--font-owners-black)",
            fontWeight: 900,
            fontSize: "clamp(30px, 5.2vw, 68px)",
            lineHeight: 1.02,
            letterSpacing: "0px",
            color: "#FFFFFF",
          }}
        >
          {headline}
        </h2>

        {subline?.length ? (
          <p
            className="mt-4 max-w-[46ch]"
            style={{
              fontFamily: "var(--font-owners)",
              fontSize: "clamp(14px, 1.5vw, 21px)",
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {subline.map((satir, i) => (
              <span key={satir} className="block">
                {satir}
                {i < subline.length - 1 ? <br className="hidden sm:block" /> : null}
              </span>
            ))}
          </p>
        ) : null}

        <Link
          href={ctaHref}
          className="lx-btn-outline mt-9"
          style={{ color: "#FFFFFF" }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
