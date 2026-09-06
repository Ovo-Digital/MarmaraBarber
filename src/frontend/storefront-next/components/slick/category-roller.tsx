import { HeroSlider } from "@/components/slick/hero-slider";
import type { HeroSlide } from "@/services/shopify/storefront-direct";

/**
 * Ana kategori bölümü — anasayfa hero'sundaki kayan liste mekaniğinin aynısı.
 *
 * Başlık ayrı bir bant değil, görselin ÜZERİNDE duruyor. Üstte ince bir
 * karartma var ki başlık her görselde okunabilsin. Böylece bölüm tek parça
 * olarak okunuyor, başlık bir önceki bölüme aitmiş gibi durmuyor.
 *
 * Hero ile aynı bileşeni kullanıyor — iki yerde iki ayrı kod olmasın diye.
 */
export function CategoryRoller({
  rows,
  eyebrow = "The range",
  title = "Shop by category",
}: {
  rows: HeroSlide[];
  eyebrow?: string;
  title?: string;
}) {
  if (!rows.length) return null;

  return (
    <section className="relative w-full" style={{ background: "var(--lx-ink)" }}>
      <HeroSlider slides={rows} height="clamp(560px, 72vh, 780px)" minHeight="520px" />

      {/* Başlığın okunması için üstten ince karartma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,17,15,.86) 0%, rgba(20,17,15,.45) 55%, rgba(20,17,15,0) 100%)",
        }}
      />

      {/* Başlık — görselin üzerinde */}
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <div className="sg-container pt-10 text-center sm:pt-14">
          <p className="lx-eyebrow mb-2">{eyebrow}</p>
          <h2 className="lx-title" style={{ color: "#ffffff" }}>
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
}
