import { HeroSlider } from "@/components/slick/hero-slider";
import type { HeroSlide } from "@/services/shopify/storefront-direct";
import type { Product } from "@/types/commerce";

/**
 * Listede okunabilir bir isim bırak: her satır zaten Marmara ürünü olduğu için
 * baştaki marka adı bilgi taşımıyor, sadece adı uzatıp kırpılmasına yol açıyor.
 */
function rowTitle(title: string) {
  return title
    .replace(/^\s*marmara\s+barber\s+/i, "")
    .replace(/^\s*marmara\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ürün bölümü — hero'daki kayan liste mekaniğinin aynısı, ama satırlar
 * koleksiyon değil ÜRÜN. Kategoriler zaten üstteki hero listesinde veriliyor.
 *
 * Başlık ayrı bir bant değil, görselin üzerinde duruyor; üstteki karartma
 * her görselde okunmasını sağlıyor.
 *
 * Görseli olmayan ürün listeye alınmaz — arka plan boş kalırdı.
 */
export function ProductRoller({
  products,
  eyebrow = "The range",
  title = "Shop the products",
  limit = 8,
}: {
  products: Product[];
  eyebrow?: string;
  title?: string;
  limit?: number;
}) {
  const rows: HeroSlide[] = products
    .filter((p) => Boolean(p.imageUrl))
    .slice(0, limit)
    .map((p) => ({
      handle: p.handle,
      title: rowTitle(p.title) || p.title,
      imageUrl: p.imageUrl as string,
      href: `/products/${p.handle}`,
      curated: true,
    }));

  if (!rows.length) return null;

  return (
    <section className="relative w-full" style={{ background: "var(--lx-ink)" }}>
      <HeroSlider slides={rows} height="clamp(560px, 72vh, 780px)" minHeight="520px" />

      {/* Başlığın okunması için üstten ince karartma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,17,15,.94) 0%, rgba(20,17,15,.72) 32%, rgba(20,17,15,.34) 66%, rgba(20,17,15,0) 100%)",
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
