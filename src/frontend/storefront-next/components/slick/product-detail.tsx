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
import { useT } from "@/lib/i18n/dil";
import { urunAdiParcala } from "@/lib/urun-adi";
import { SITE_NAME } from "@/lib/slick-theme";
import type { Product, ProductOption, ProductVariant, SellingPlanGroup } from "@/types/commerce";

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
 * Açıklamayı BÜYÜK HARFLİ başlıklarına göre bloklara ayırır.
 *
 * Shopify açıklamaları "ÖZELLİKLERİ", "KOKU HİKAYESİ" gibi büyük harfli
 * satırlarla bölünmüş durumda. Bunlar akordeon başlığı, altındaki satırlar
 * da gövdesi oluyor. Başlıksız bir giriş metni varsa başlığı boş kalır;
 * çağıran taraf ona kendi adını verir.
 */
function aciklamaBloklari(metin: string): { baslik: string; satirlar: string[] }[] {
  const bloklar: { baslik: string; satirlar: string[] }[] = [];
  for (const ham of metin.split("\n")) {
    const satir = ham.trim();
    if (!satir) continue;
    const buyukHarfli =
      satir.length <= 40 && satir === satir.toLocaleUpperCase("tr") && /[A-ZÇĞİÖŞÜ]/.test(satir);
    if (buyukHarfli) bloklar.push({ baslik: satir, satirlar: [] });
    else if (bloklar.length === 0) bloklar.push({ baslik: "", satirlar: [satir] });
    else bloklar[bloklar.length - 1].satirlar.push(satir);
  }
  return bloklar.filter((b) => b.satirlar.length > 0);
}

/** Akordeon gövdesi: satırlar paragraf, "Etiket: değer" olanlar kırmızı maddeli. */
function BlokMetni({ satirlar }: { satirlar: string[] }) {
  return (
    <div className="space-y-2">
      {satirlar.map((satir, i) => {
        const ayrac = satir.indexOf(":");
        if (!(ayrac > 0 && ayrac < 42)) return <p key={i}>{satir}</p>;
        return (
          <p key={i} className="relative pl-[18px]">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[8px] block h-[5px] w-[5px]"
              style={{ background: "var(--sg-red)" }}
            />
            <span style={{ color: "var(--lx-ink)", fontWeight: 700 }}>{satir.slice(0, ayrac)}</span>
            {satir.slice(ayrac + 1)}
          </p>
        );
      })}
    </div>
  );
}

/** Puan yıldızları — yarım yıldız dahil. Yalnızca gerçek yorum varken çiziliyor. */
function Yildizlar({ puan }: { puan: number }) {
  return (
    <span className="lx-yildiz" aria-hidden="true">
      <span className="lx-yildiz-bos">★★★★★</span>
      <span className="lx-yildiz-dolu" style={{ width: `${Math.max(0, Math.min(5, puan)) * 20}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

/**
 * Sepet butonunun altındaki güven satırı.
 *
 * Üç madde de markanın kendi doğrulanmış bilgisi: 1970'ten beri üretim,
 * Türkiye'deki kendi tesisleri, GMP standardı. Referans sitedeki "30 gün
 * garanti" gibi bizde karşılığı olmayan bir vaat YAZILMADI.
 */
function GuvenSatiri() {
  const t = useT();
  const maddeler = [
    { id: "since", yazi: "Since 1970", ikon: <path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z" /> },
    { id: "made", yazi: "Made in Türkiye", ikon: <><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></> },
    { id: "gmp", yazi: "GMP standards", ikon: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></> },
  ];

  return (
    <ul className="mt-7 m-0 grid list-none grid-cols-3 gap-2 p-0">
      {maddeler.map((m) => (
        <li key={m.id} className="flex flex-col items-center gap-2 text-center">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--lx-ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {m.ikon}
          </svg>
          <span className="text-[12px] leading-tight" style={{ color: "rgba(20,17,15,0.7)" }}>
            {t(m.yazi)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Tek seferlik alım / abonelik seçimi.
 *
 * Planlar Shopify'dan geliyor. Mağazada abonelik uygulaması kurulu değilse
 * `gruplar` boş gelir ve bu bileşen HİÇBİR ŞEY çizmez — çalışmayan bir kutu
 * gösterilmiyor. Tekrarlayan tahsilatı, kart saklamayı ve müşteri onayını
 * Shopify'ın kasası yürütüyor; biz sepete yalnızca plan kimliğini yazıyoruz.
 */
function AbonelikSecimi({
  gruplar,
  fiyat,
  paraBirimi,
  secili,
  onSec,
}: {
  gruplar: SellingPlanGroup[];
  fiyat: number;
  paraBirimi: string;
  secili: string | null;
  onSec: (planId: string | null) => void;
}) {
  const t = useT();
  const grup = gruplar[0];
  const planlar = useMemo(() => grup?.plans.filter((pl) => pl.recurringDeliveries) ?? [], [grup]);
  /* Açılır listede duran plan: Shopify'daki sıranın ilki. Kendimizden
     "en avantajlısı" seçmiyoruz — sırayı mağaza belirliyor. */
  const [gosterilen, setGosterilen] = useState<string>(planlar[0]?.id ?? "");
  if (planlar.length === 0) return null;

  const aktifPlan = planlar.find((pl) => pl.id === gosterilen) ?? planlar[0];
  const indirim = aktifPlan.discountPercent ?? 0;
  const indirimliFiyat = indirim ? fiyat * (1 - indirim / 100) : fiyat;
  const aboneSecili = secili !== null;

  return (
    <div className="mt-7 space-y-2">
      {/* Tek seferlik */}
      <button
        type="button"
        onClick={() => onSec(null)}
        className={`lx-satin-kutu ${!aboneSecili ? "lx-satin-kutu--secili" : ""}`}
        aria-pressed={!aboneSecili}
      >
        <span className="lx-satin-nokta" aria-hidden="true" />
        <span className="flex-1 text-left">
          <span className="block font-semibold">{t("One-time purchase")}</span>
          <span className="block text-[13px]" style={{ color: "rgba(20,17,15,0.6)" }}>
            {formatMoney(fiyat, paraBirimi)}
          </span>
        </span>
      </button>

      {/* Abonelik */}
      <div className={`lx-satin-kutu lx-satin-kutu--blok ${aboneSecili ? "lx-satin-kutu--secili" : ""}`}>
        <button
          type="button"
          onClick={() => onSec(aktifPlan.id)}
          className="flex w-full items-center gap-3 text-left"
          aria-pressed={aboneSecili}
        >
          <span className="lx-satin-nokta" aria-hidden="true" />
          <span className="flex-1">
            <span className="block font-semibold">{grup.name || t("Subscribe & save")}</span>
            <span className="block text-[13px]">
              {indirim ? (
                <>
                  <span className="line-through" style={{ color: "rgba(20,17,15,0.45)" }}>
                    {formatMoney(fiyat, paraBirimi)}
                  </span>{" "}
                  <strong>{formatMoney(indirimliFiyat, paraBirimi)}</strong>
                </>
              ) : (
                formatMoney(fiyat, paraBirimi)
              )}
            </span>
          </span>
          {indirim ? (
            <span className="lx-satin-rozet">{t("Save {percent}%", { percent: String(Math.round(indirim)) })}</span>
          ) : null}
        </button>

        {aboneSecili ? (
          <div className="mt-3 pl-8">
            <label className="sr-only" htmlFor="abonelik-siklik">
              {t("Select frequency")}
            </label>
            <select
              id="abonelik-siklik"
              className="lx-satin-secim"
              value={gosterilen}
              onChange={(e) => {
                setGosterilen(e.target.value);
                onSec(e.target.value);
              }}
            >
              {planlar.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
            </select>
            <p className="mt-3 text-[13px]" style={{ color: "rgba(20,17,15,0.6)" }}>
              {t("Billed automatically each period. Skip, edit or cancel anytime from your account.")}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function productTypeHref(type?: string) {
  if (!type) return "/products";
  return `/products?type=${encodeURIComponent(type)}`;
}

function Accordion({
  items,
}: {
  items: { id: string; title: string; body: React.ReactNode }[];
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
                <div className="sg-body pb-5 text-[14px] leading-[1.62] text-[#444]">{item.body}</div>
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
  const t = useT();
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
      <button type="button" className="absolute inset-0" aria-label={t("Close")} onClick={onClose} />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 text-3xl text-white"
        aria-label={t("Close")}
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
  const t = useT();
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
              <div className="flex h-full items-center justify-center text-[12px] text-[#999]">{t("No image")}</div>
            )}
          </AnimatePresence>
          <span className="sg-nav pointer-events-none absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-[9px] opacity-0 transition group-hover:opacity-100">
            {t("Zoom")}
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

/**
 * Stokta olmayan ürün için.
 *
 * Önceden burada bir "stok gelince haber ver" formu vardı; e-postayı hiçbir
 * yere göndermiyor, yalnızca "mail atacağız" yazısını gösteriyordu. Shopify
 * Storefront API'de stok bildirimi yok. Söz verip tutamayacağımız bir form
 * yerine iletişim sayfasına yönlendiriyoruz.
 */
function NotifyForm() {
  const t = useT();
  return (
    <p className="mt-3 text-[13px]" style={{ color: "rgba(20,17,15,0.65)" }}>
      {t("Out of stock right now.")}{" "}
      <Link href="/iletisim" className="underline underline-offset-4" style={{ color: "var(--lx-ink)" }}>
        {t("Ask us about restock")}
      </Link>
    </p>
  );
}

export function SlickProductDetail({
  product,
  images,
  descriptionHtml,
  sellingPlanGroups = [],
  crossSell,
  related,
}: {
  product: Product;
  images: string[];
  descriptionHtml?: string;
  /** Shopify'daki abonelik planları. Boşsa abonelik kutusu çizilmez. */
  sellingPlanGroups?: SellingPlanGroup[];
  crossSell: Product[];
  related: Product[];
}) {
  const t = useT();
  /* Ürün adları markanın kendi isimleri ("Hangover", "No.1", "Space Wax");
     tanım kısmı ("Edp Erkek Parfüm 100 ML") ayrı satıra iniyor. */
  const { ad: urunAdi, detay: urunDetayi } = useMemo(
    () => urunAdiParcala(product.title, product.productType, SITE_NAME),
    [product.title, product.productType],
  );
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
  const [seciliPlan, setSeciliPlan] = useState<string | null>(null);

  /* YALNIZCA TASARIM ÖNİZLEMESİ İÇİN.
     Mağazada abonelik uygulaması kurulu olmadığı için gerçek plan gelmiyor.
     NEXT_PUBLIC_ABONELIK_DEMO=1 iken örnek planlarla kutu çiziliyor ki
     tasarım localde görülebilsin. Bu planların kimlikleri Shopify'da yok;
     demo açıkken sepete ekleme plansız yapılıyor (aşağıda). Yayında bu
     değişken tanımlı olmadığı için hiçbir şey değişmez. */
  const demoAcik = process.env.NEXT_PUBLIC_ABONELIK_DEMO === "1";
  const planGruplari = useMemo<SellingPlanGroup[]>(() => {
    if (sellingPlanGroups.length > 0) return sellingPlanGroups;
    if (!demoAcik) return [];
    return [
      {
        name: "Subscribe & save",
        plans: [
          { id: "demo-1", name: "Delivered every month", recurringDeliveries: true, discountPercent: 10 },
          { id: "demo-2", name: "Delivered every 2 months", recurringDeliveries: true, discountPercent: 10 },
          { id: "demo-3", name: "Delivered every 3 months", recurringDeliveries: true, discountPercent: 15 },
        ],
      },
    ];
  }, [sellingPlanGroups, demoAcik]);
  const demoPlan = seciliPlan?.startsWith("demo-") ?? false;

  const plain = useMemo(() => {
    return (descriptionHtml || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim() || product.description;
  }, [descriptionHtml, product.description]);

  const satirliMetin = useMemo(
    () =>
      (descriptionHtml || product.description || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|h[1-6]|pre)>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"'),
    [descriptionHtml, product.description],
  );

  /* Satın alma sütunundaki akordeonlar.
     Başlıklar Shopify açıklamasındaki büyük harfli satırlardan geliyor, biz
     başlık uydurmuyoruz. Hiç bölüm yoksa tüm metin tek "Details" başlığında
     toplanıyor. Kargo bölümünün metni sitedeki kargo sayfasının kendi metni —
     gün/ücret gibi uydurma rakam yok. */
  const akordeonlar = useMemo(() => {
    const bloklar = aciklamaBloklari(satirliMetin);
    const items: { id: string; title: string; body: React.ReactNode }[] = bloklar.map((b, i) => ({
      id: `blok-${i}`,
      title: b.baslik || t("Details"),
      body: <BlokMetni satirlar={b.satirlar} />,
    }));

    if (items.length === 0 && plain.trim()) {
      items.push({ id: "details", title: t("Details"), body: <p>{plain}</p> });
    }

    items.push({
      id: "shipping",
      title: t("Shipping"),
      body: (
        <div className="space-y-2">
          <p>{t("Carriers, delivery areas, lead times and shipping rates are set per market and are shown at checkout before you pay.")}</p>
          <Link href="/kargo-ve-teslimat" className="lx-link inline-block">
            {t("Shipping & delivery")}
          </Link>
        </div>
      ),
    });
    return items;
  }, [satirliMetin, plain, t]);

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
    await add(product, qty, variant?.id, demoPlan ? undefined : (seciliPlan ?? undefined));
    setAdding(false);
    openCart();
  }, [inStock, adding, add, product, qty, variant?.id, seciliPlan, demoPlan, openCart]);

  const valueAvailable = (opt: ProductOption, value: string) => {
    const next = { ...selected, [opt.name]: value };
    const match = findVariant(product.variants, options, next);
    return Boolean(match?.availableForSale);
  };

  return (
    <div className="bg-white pb-24 lg:pb-20">
      <div className="sg-container pt-5">
        {/* 1. Breadcrumb */}
        <nav aria-label={t("Breadcrumb")} className="mb-6 truncate text-[12px] text-[#666]">
          <Link href="/" className="hover:text-black">
            {t("Home")}
          </Link>
          <span className="mx-2">/</span>
          <Link href={productTypeHref(product.productType)} className="hover:text-black">
            {product.productType || t("Products")}
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

          <div className="min-w-0 lg:sticky lg:top-[calc(var(--sg-header-h)+1.5rem)] lg:self-start">
            {/* Puan yalnızca Shopify'da gerçek yorum varsa çıkıyor; yoksa satır hiç yok. */}
            {product.reviewCount && product.rating ? (
              <a href="#yorumlar" className="mb-3 flex items-center gap-2 no-underline">
                <Yildizlar puan={product.rating} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--lx-ink)" }}>
                  {product.reviewCount === 1
                    ? t("1 review")
                    : t("{count} reviews", { count: String(product.reviewCount) })}
                </span>
              </a>
            ) : null}
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
              {urunAdi}
            </h1>
            {urunDetayi ? (
              <p
                className="mt-3 uppercase"
                style={{
                  fontFamily: "var(--font-owners)",
                  fontSize: "13px",
                  letterSpacing: "0.16em",
                  color: "rgba(20,17,15,0.5)",
                }}
              >
                {urunDetayi}
              </p>
            ) : null}

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
                  -{discount}%
                </span>
              ) : null}
            </div>


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


            <AbonelikSecimi
              gruplar={planGruplari}
              fiyat={price}
              paraBirimi={product.currencyCode}
              secili={seciliPlan}
              onSec={setSeciliPlan}
            />

            {/* Adet */}
            <div className="mt-8">
              <p className="lx-eyebrow mb-3" style={{ color: "rgba(20,17,15,0.45)" }}>
                {t("Quantity")}
              </p>
              <div className="lx-adet">
                <button
                  type="button"
                  className="lx-adet-dugme"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label={t("Decrease")}
                >
                  <span aria-hidden="true">−</span>
                </button>
                <span className="lx-adet-sayi" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  className="lx-adet-dugme"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label={t("Increase")}
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            </div>

            <button
              ref={ctaRef}
              type="button"
              disabled={!inStock || adding}
              className="lx-btn mt-4 flex w-full gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ minHeight: 60 }}
              onClick={onAdd}
            >
              {adding ? (
                <>
                  <Spinner />
                  {t("Adding…")}
                </>
              ) : inStock ? (
                t("Add to cart")
              ) : (
                t("Sold out")
              )}
            </button>
            {!inStock ? <NotifyForm /> : null}

            <GuvenSatiri />

            {/* Açıklama artık sayfanın dibinde duvar gibi değil, burada
                bölüm bölüm açılıyor — referans sayfadaki düzen bu. */}
            <div className="mt-6">
              <Accordion items={akordeonlar} />
            </div>
          </div>
        </div>

        {/* 3. Cross-sell */}
        {crossSell.length > 0 && (
          <section className="mt-16 border-t border-black/10 pt-12">
            <h2 className="sg-section-title mb-8">{t("Pairs well with")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {crossSell.map((p) => (
                <SlickProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Detaylı açıklama artık satın alma sütunundaki akordeonlarda:
            aynı metni sayfanın dibinde ikinci kez göstermiyoruz. */}

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
                {adding ? "…" : inStock ? t("Add to cart") : t("Sold out")}
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
