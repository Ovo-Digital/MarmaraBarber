import Link from "next/link";

/**
 * Marka hikayesi bölümü — solda metin, sağda tam yükseklik görsel.
 *
 * Görsel `image` prop'u ile verilir. Verilmezse bölüm görselsiz ama düzgün
 * görünür; uydurma bir görsel yerleştirilmez.
 */
export function StorySection({
  eyebrow = "Since 1970",
  title = "Our story",
  lines,
  ctaLabel = "Read more",
  ctaHref = "/hakkimizda",
  image,
  imageAlt = "",
}: {
  eyebrow?: string;
  title?: string;
  lines: string[];
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="w-full" style={{ background: "var(--lx-bone)" }}>
      <div className="grid items-stretch lg:grid-cols-2">
        {/* Metin */}
        <div
          className="flex flex-col justify-center px-6 text-center sm:px-10 lg:px-16"
          style={{
            paddingTop: "var(--lx-section-y)",
            paddingBottom: "var(--lx-section-y)",
          }}
        >
          <div className="mx-auto max-w-[46ch]">
            <p className="lx-eyebrow">{eyebrow}</p>

            <h2
              className="mt-4 uppercase"
              style={{
                fontFamily: "var(--font-owners-black)",
                fontWeight: 900,
                fontSize: "clamp(30px, 3.6vw, 52px)",
                lineHeight: 1.04,
                letterSpacing: "-0.012em",
                color: "var(--lx-ink)",
              }}
            >
              {title}
            </h2>

            <div className="mt-6 space-y-4">
              {lines.map((satir) => (
                <p key={satir} className="text-[15px] leading-relaxed text-[var(--lx-stone)]">
                  {satir}
                </p>
              ))}
            </div>

            <Link href={ctaHref} className="lx-btn mt-9">
              {ctaLabel}
            </Link>
          </div>
        </div>

        {/* Görsel */}
        <div className="relative min-h-[320px] bg-[#e9e6e2] lg:min-h-[560px]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="lx-eyebrow" style={{ color: "rgba(20,17,15,0.35)" }}>
                Add a brand image here
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
