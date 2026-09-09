"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProductCarousel } from "@/components/slick/product-carousel";
import { SlickProductCard } from "@/components/slick/product-card";
import { formatMoney } from "@/lib/money";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import { useUiStore } from "@/store/ui-store";
import type { Product, ProductOption, ProductVariant } from "@/types/commerce";

function isDefaultOnly(options: ProductOption[] | undefined) {
  if (!options?.length) return true;
  return options.every(
    (o) =>
      o.values.length === 0 ||
      (o.values.length === 1 && /default title/i.test(o.values[0])),
  );
}

function isColorOption(name: string) {
  return /renk|color|colour|swatch/i.test(name);
}

function findVariant(
  variants: ProductVariant[],
  options: ProductOption[],
  selected: Record<string, string>,
): ProductVariant | undefined {
  return variants.find((v) => {
    const vals = [v.option1, v.option2, v.option3];
    return options.every((opt, idx) => {
      const chosen = selected[opt.name];
      if (!chosen) return true;
      return vals[idx] === chosen;
    });
  });
}

function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Açıklamadan bölüm çıkar.
 *
 * Bulunamayan bölüm için metin UYDURULMUYOR — önceden "profesyonel formül,
 * ambalajı inceleyin" gibi cümleler yazılıyordu; hiçbiri Shopify'dan gelmiyordu.
 * Bölüm yoksa hiç gösterilmiyor.
 */
function extractSections(html: string, plain: string) {
  const text = plain || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const usage = text.match(/(?:NASIL KULLANILIR|Kullanım|How to use)[:\s]+(.{40,320})/i)?.[1] ?? "";
  const ingredients = text.match(/(?:İçindekiler|Ingredients|INCI)[:\s]+(.{40,320})/i)?.[1] ?? "";
  return { usage: usage.trim(), ingredients: ingredients.trim() };
}

function productTypeHref(type?: string) {
  if (!type) return "/products";
  return `/products?type=${encodeURIComponent(type)}`;
}

function Accordion({
  items,
}: {
  items: { id: string; title: string; body: string }[];
}) {
  /* Hepsi kapalı başlıyor: ilk bölüm açık gelince uzun açıklama sayfayı
     yine duvara çeviriyordu. */
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="divide-y divide-black/10 border-y border-black/10">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <span className="sg-nav text-[12px]">{item.title}</span>
              <span className="text-lg leading-none">{isOpen ? "−" : "+"}</span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="sg-body pb-4 text-[14px] text-[#444]">{item.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={onClose} />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 text-3xl text-white"
        aria-label="Kapat"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="relative z-10 max-h-[90vh] max-w-full object-contain" />
    </div>
  );
}

function Gallery({
  images,
  title,
  active,
  onSelect,
}: {
  images: string[];
  title: string;
  active: number;
  onSelect: (i: number) => void;
}) {
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const src = images[active];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          className="group relative aspect-square w-full overflow-hidden bg-[var(--sg-off)]"
          onClick={() => setLightbox(true)}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          <AnimatePresence mode="wait">
            {src ? (
              <motion.img
                key={src}
                src={src}
                alt={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: zoomed ? 1.08 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="absolute inset-0 h-full w-full object-contain p-6 md:p-10"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-[#999]">No image</div>
            )}
          </AnimatePresence>
          <span className="sg-nav pointer-events-none absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-[9px] opacity-0 transition group-hover:opacity-100">
            Büyüt
          </span>
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => onSelect(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden bg-[var(--sg-off)] lg:h-20 lg:w-full ${
                i === active ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {lightbox && src ? <Lightbox src={src} alt={title} onClose={() => setLightbox(false)} /> : null}
    </div>
  );
}

function NotifyForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done) {
    return <p className="mt-3 text-[13px] text-[#444]">Haber verildi — stok gelince mail atacağız.</p>;
  }
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="min-w-0 flex-1 px-3 py-2.5 text-[13px] outline-none"
        style={{ border: "1px solid rgba(20,17,15,0.25)", color: "var(--lx-ink)" }}
      />
      <button
        type="submit"
        className="shrink-0 px-5 uppercase tracking-[0.14em]"
        style={{ background: "var(--lx-ink)", color: "#fff", fontFamily: "var(--font-owners)", fontSize: "11px" }}
      >
        Notify me
      </button>
    </form>
  );
}

export function SlickProductDetail({
  product,
  images,
  descriptionHtml,
  series = [],
  seriesLabel,
  crossSell,
  related,
}: {
  product: Product;
  images: string[];
  descriptionHtml?: string;
  /** Serinin diğer ürünleri — küçük görsellerle, renk seçici gibi */
  series?: Product[];
  seriesLabel?: string;
  crossSell: Product[];
  related: Product[];
}) {
  const options = useMemo(
    () => (isDefaultOnly(product.options) ? [] : product.options ?? []),
    [product.options],
  );

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const opt of options) {
      const firstAvailable = product.variants.find((v) => v.availableForSale);
      const vals = [firstAvailable?.option1, firstAvailable?.option2, firstAvailable?.option3];
      const idx = product.options?.findIndex((o) => o.name === opt.name) ?? -1;
      init[opt.name] = (idx >= 0 ? vals[idx] : null) || opt.values[0];
    }
    return init;
  });

  const variant = useMemo(
    () => findVariant(product.variants, options, selected) ?? product.variants[0],
    [product.variants, options, selected],
  );

  const gallery = useMemo(() => {
    const list = images.length ? images : product.imageUrl ? [product.imageUrl] : [];
    return list;
  }, [images, product.imageUrl]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const add = useShopifyCartStore((s) => s.add);
  const openCart = useUiStore((s) => s.openCartDrawer);

  const price = variant?.price ?? product.price;
  const compareAt =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > price
      ? product.compareAtPrice
      : null;
  const discount = discountPercent(price, compareAt);
  const inStock = Boolean(variant?.availableForSale ?? product.availableForSale);

  const plain = useMemo(() => {
    return (descriptionHtml || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim() || product.description;
  }, [descriptionHtml, product.description]);
  const sections = useMemo(() => extractSections(descriptionHtml || "", plain), [descriptionHtml, plain]);

  // Varyant görseline geç
  useEffect(() => {
    if (!variant?.imageUrl) return;
    const idx = gallery.findIndex((g) => g === variant.imageUrl);
    if (idx >= 0) setActiveImage(idx);
  }, [variant?.id, variant?.imageUrl, gallery]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onAdd = useCallback(async () => {
    if (!inStock || adding) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 450));
    add(product, qty, variant?.id);
    setAdding(false);
    openCart();
  }, [inStock, adding, add, product, qty, variant?.id, openCart]);

  const valueAvailable = (opt: ProductOption, value: string) => {
    const next = { ...selected, [opt.name]: value };
    const match = findVariant(product.variants, options, next);
    return Boolean(match?.availableForSale);
  };

  return (
    <div className="bg-white pb-24 lg:pb-20">
      <div className="sg-container pt-5">
        {/* 1. Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 truncate text-[12px] text-[#666]">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href={productTypeHref(product.productType)} className="hover:text-black">
            {product.productType || "Products"}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.title}</span>
        </nav>

        {/* 2. Ana grid */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <Gallery
            images={gallery}
            title={product.title}
            active={activeImage}
            onSelect={setActiveImage}
          />

          <div className="lg:sticky lg:top-[calc(var(--sg-header-h)+1.5rem)] lg:self-start">
            {product.productType ? <p className="lx-eyebrow mb-3">{product.productType}</p> : null}
            <h1
              className="uppercase"
              style={{
                fontFamily: "var(--font-owners-black)",
                fontWeight: 900,
                fontSize: "clamp(28px, 3vw, 44px)",
                // 0.9 satır yüksekliği Ş/Ç/Ğ gibi harflerin altını kırpıyordu
                lineHeight: 1.04,
                letterSpacing: "-0.012em",
                color: "var(--lx-ink)",
              }}
            >
              {product.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {compareAt ? (
                <span className="text-[14px] line-through" style={{ color: "rgba(20,17,15,0.45)" }}>
                  {formatMoney(compareAt, product.currencyCode)}
                </span>
              ) : null}
              <span
                style={{ fontFamily: "var(--font-owners-black)", fontWeight: 900, fontSize: "26px", color: "var(--lx-ink)" }}
              >
                {formatMoney(price, product.currencyCode)}
              </span>
              {discount ? (
                <span className="bg-[var(--sg-red)] px-2 py-1 text-[10px] font-bold tracking-wide text-white">
                  -%{discount}
                </span>
              ) : null}
            </div>

            {/* Üstte yalnızca iki satır: tamamı aşağıdaki "Details" bölümünde.
                Ham Shopify metni burada duvar gibi duruyordu. */}
            {plain ? (
              <p className="mt-5 line-clamp-2 text-[15px] leading-relaxed" style={{ color: "rgba(20,17,15,0.7)" }}>
                {plain}
              </p>
            ) : null}

            {/* Varyant seçiciler */}
            {options.map((opt) => {
              const color = isColorOption(opt.name);
              return (
                <div key={opt.name} className="mt-7">
                  <p className="sg-nav mb-3 text-[11px]">
                    {opt.name}: <span className="font-normal normal-case tracking-normal">{selected[opt.name]}</span>
                  </p>
                  <div className={`flex flex-wrap gap-2 ${color ? "" : ""}`}>
                    {opt.values.map((value) => {
                      const available = valueAvailable(opt, value);
                      const active = selected[opt.name] === value;
                      if (color) {
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!available}
                            onClick={() => setSelected((s) => ({ ...s, [opt.name]: value }))}
                            title={value}
                            className={`h-10 w-10 border ${
                              active ? "border-black ring-1 ring-black" : "border-black/20"
                            } ${!available ? "cursor-not-allowed opacity-35 line-through" : ""}`}
                            style={{ background: swatchColor(value) }}
                          />
                        );
                      }
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelected((s) => ({ ...s, [opt.name]: value }))}
                          className={`sg-nav border px-4 py-2 text-[11px] ${
                            active ? "border-black bg-black text-white" : "border-black/25 bg-white"
                          } ${!available ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Serinin diğer ürünleri — tekstildeki renk seçici gibi */}
            {series.length > 0 ? (
              <div className="mt-8">
                <p className="mb-3 text-[11px] uppercase tracking-[0.14em]" style={{ color: "rgba(20,17,15,0.55)", fontFamily: "var(--font-owners)" }}>
                  More in {seriesLabel ?? "this range"}
                  <span style={{ color: "rgba(20,17,15,0.35)" }}> · {series.length}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {series.map((p) => (
                    <Link
                      key={p.handle}
                      href={`/products/${p.handle}`}
                      title={p.title}
                      aria-label={p.title}
                      className="lx-seri-kare block h-16 w-16 overflow-hidden bg-white"
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Adet */}
            <div className="mt-8 flex max-w-[200px] items-center" style={{ border: "1px solid rgba(20,17,15,0.25)" }}>
              <button
                type="button"
                className="px-4 py-3 text-[16px]"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-10 flex-1 text-center text-[14px] font-semibold">{qty}</span>
              <button
                type="button"
                className="px-4 py-3 text-[16px]"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase"
              >
                +
              </button>
            </div>

            <button
              ref={ctaRef}
              type="button"
              disabled={!inStock || adding}
              className="mt-4 flex w-full items-center justify-center gap-2 uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                minHeight: 56,
                background: inStock ? "var(--sg-red)" : "var(--lx-ink)",
                color: "#fff",
                fontFamily: "var(--font-owners)",
                fontSize: "12px",
              }}
              onClick={onAdd}
            >
              {adding ? (
                <>
                  <Spinner />
                  Adding…
                </>
              ) : inStock ? (
                "Add to cart"
              ) : (
                "Sold out"
              )}
            </button>
            {!inStock ? <NotifyForm /> : null}

            <div className="mt-2">
              <Accordion
                items={[
                  { id: "details", title: "Details", body: plain },
                  { id: "usage", title: "How to use", body: sections.usage },
                  { id: "ingredients", title: "Ingredients", body: sections.ingredients },
                ].filter((b) => b.body.trim().length > 0)}
              />
            </div>
          </div>
        </div>

        {/* 3. Cross-sell */}
        {crossSell.length > 0 && (
          <section className="mt-16 border-t border-black/10 pt-12">
            <h2 className="sg-section-title mb-8">Pairs well with</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {crossSell.map((p) => (
                <SlickProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Detaylı açıklama */}
        <section className="mt-16 border-t border-black/10 pt-12">
          <h2 className="sg-section-title mb-8">Ürün Açıklaması</h2>
          {descriptionHtml ? (
            <div
              className="sg-body prose-pdp mx-auto max-w-3xl text-[#222] [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-[family-name:var(--font-owners)] [&_h2]:text-[18px] [&_h2]:uppercase [&_img]:my-6 [&_img]:max-w-full [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(descriptionHtml) }}
            />
          ) : (
            <p className="sg-body mx-auto max-w-3xl text-[#333]">{plain}</p>
          )}
        </section>

      </div>

      {/* 6. Related carousel */}
      {related.length > 0 && (
        <div className="mt-8 bg-[var(--sg-off)]">
          <ProductCarousel
            title="You may also like"
            products={related}
            viewAllHref={productTypeHref(product.productType)}
          />
        </div>
      )}

      {/* 7. Sticky mobile ATC */}
      <AnimatePresence>
        {!ctaVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-[60] border-t border-black/10 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 bg-[var(--sg-off)]">
                {gallery[activeImage] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gallery[activeImage]} alt="" className="h-full w-full object-contain p-1" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="sg-product-title truncate text-[11px]">{product.title}</p>
                <p className="sg-price text-[14px]">{formatMoney(price, product.currencyCode)}</p>
              </div>
              <button
                type="button"
                disabled={!inStock || adding}
                className="sg-btn-red shrink-0 !px-4 !py-3 text-[11px]"
                onClick={onAdd}
              >
                {adding ? "…" : inStock ? "Add to cart" : "Sold out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-hidden
    />
  );
}

function swatchColor(value: string) {
  const palette = ["#111", "#444", "#8B4513", "#C4A574", "#1a3a5c", "#2d5a3d", "#6b2d2d", "#d4d4d4"];
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash + value.charCodeAt(i) * (i + 1)) % palette.length;
  return palette[hash];
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}
