"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAIN_NAV, SITE_NAME } from "@/lib/slick-theme";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import { useUiStore } from "@/store/ui-store";

/**
 * Hap nav'ın altında açılan kategori paneli — numaralı indeks.
 *
 * Solda satırlar: [001] sıra numarası, koleksiyon adı, sağda SHOP işareti.
 * İmleç bir satıra geldiğinde satır kırmızıya döner, boydan boya ince bir
 * çizgi belirir ve SAĞDAKİ görsel o koleksiyonunkine geçer.
 *
 * Görseller üst üste duruyor, sadece opaklıkları değişiyor — geçişte yeniden
 * yükleme olmuyor, bu yüzden takılmıyor.
 *
 * İçerik tamamen Shopify koleksiyonlarından gelir (kodda koleksiyon adı/görseli
 * sabit yazılı DEĞİL) — başka bir mağazaya bağlandığında kendi kategorileri
 * listelenir.
 */
/** Menüyü besleyen koleksiyon — Shopify'dan gelir, kodda sabit değildir. */
export type NavCollection = {
  handle: string;
  title: string;
  imageUrl: string;
  href: string;
};

/** Panelde kaç koleksiyon listelenecek */
const PANEL_SATIR = 8;

function MegaPanel({
  collections,
  onClose,
}: {
  collections: NavCollection[];
  onClose: () => void;
}) {
  const rows = collections.slice(0, PANEL_SATIR);
  /* Görsel geçişi için hem şimdiki hem bir önceki satır tutuluyor: alttaki
     katman eskisini gösterirken üstteki yenisi perde gibi açılıyor. */
  const [{ simdi, onceki, tur }, setIndeks] = useState({ simdi: 0, onceki: 0, tur: 0 });
  const sec = (i: number) =>
    setIndeks((d) => (d.simdi === i ? d : { simdi: i, onceki: d.simdi, tur: d.tur + 1 }));

  if (!rows.length) return null;

  return (
    <div className="px-3 pt-2 sm:px-4 sm:pt-3">
      <div
        data-panel-card
        className="mx-auto w-full max-w-[1180px] rounded-[26px] p-5 sm:rounded-[32px] sm:p-8"
        /* Buzlu cam: arkadaki hero görseli bulanık olarak geçer.
           Satır içi stil kullanılıyor çünkü projenin katmansız CSS kuralları
           Tailwind renk sınıflarını eziyor. */
        /* Zemin KOYU ve büyük ölçüde donuk. Önceden beyaz-şeffaftı; beyaz zeminli
           sayfalarda (ürün, koleksiyon) beyaz yazı beyaz üstüne düşüp
           okunmuyordu. Koyu zemin her sayfada çalışır. */
        style={{
          background: "rgba(16,14,13,0.94)",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
          color: "#ffffff",
        }}
        onMouseLeave={() => sec(0)}
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,300px)] lg:gap-12">
          {/* Sol: numaralı indeks */}
          <ul className="m-0 list-none p-0">
            {rows.map((c, i) => {
              const secili = i === simdi;
              return (
                <li key={c.handle}>
                  <Link
                    href={c.href}
                    onClick={onClose}
                    onMouseEnter={() => sec(i)}
                    onFocus={() => sec(i)}
                    className="relative flex items-center gap-5 py-2.5"
                    style={{ color: secili ? "var(--sg-red)" : "#ffffff" }}
                  >
                    {/* Satırı boydan boya kesen çizgi — sadece imleç üstündeyken */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left"
                      style={{
                        background: "var(--sg-red)",
                        transform: secili ? "scaleX(1)" : "scaleX(0)",
                        transition: "transform 420ms var(--lx-ease)",
                      }}
                    />

                    <span
                      className="shrink-0 tabular-nums text-[11px] tracking-[0.14em]"
                      style={{ color: secili ? "var(--sg-red)" : "rgba(255,255,255,0.5)" }}
                    >
                      [ {String(i + 1).padStart(3, "0")} ]
                    </span>

                    <span
                      className="sg-heading min-w-0 flex-1 truncate uppercase"
                      style={{
                        fontSize: "clamp(15px, 1.45vw, 22px)",
                        lineHeight: 1.1,
                        letterSpacing: "0",
                      }}
                    >
                      {c.title}
                    </span>

                    <span
                      className="shrink-0 text-[11px] uppercase tracking-[0.14em] transition-opacity"
                      style={{
                        color: secili ? "var(--sg-red)" : "rgba(255,255,255,0.5)",
                        opacity: secili ? 1 : 0.7,
                      }}
                    >
                      Shop <span aria-hidden="true">↗</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sağ: imlecin durduğu koleksiyonun görseli */}
          <div className="relative hidden overflow-hidden rounded-2xl bg-white/10 lg:block">
            {/* Alt katman: bir önceki görsel, yerinde duruyor */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rows[onceki]?.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Üst katman: yeni görsel aşağıdan yukarı açılıyor.
                key her seçimde değiştiği için animasyon baştan başlıyor —
                aynı sınıfı yeniden vermek animasyonu tekrar tetiklemez. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${rows[simdi]?.handle}-${tur}`}
              src={rows[simdi]?.imageUrl}
              alt=""
              aria-hidden="true"
              className="lx-menu-gorsel absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div
          className="mt-6 flex items-center justify-between gap-4 pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
        >
          <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.55)" }}>
            {collections.length} collections
          </span>
          <Link
            href="/collections"
            onClick={onClose}
            className="shrink-0 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.06em] transition-opacity hover:opacity-80 sm:px-7 sm:text-[13px]"
            style={{ background: "#000000", color: "#ffffff" }}
          >
            View all
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SlickHeader({
  collections = [],
  dolu = false,
}: {
  collections?: NavCollection[];
  /** Sayfanın üstü açık renkliyse hap en baştan dolu siyah olur */
  dolu?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hesapAcik, setHesapAcik] = useState(false);
  const aramaAlaniRef = useRef<HTMLInputElement | null>(null);
  const [accordion, setAccordion] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [kaydi, setKaydi] = useState(false);
  const count = useShopifyCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const customer = useAuthStore((s) => s.customer);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const closeCartDrawer = useUiStore((s) => s.closeCartDrawer);

  const openShop = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setShopOpen(true);
  };

  const scheduleCloseShop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShopOpen(false), 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  /** Sayfa en üstte mi? Hapın şeffaf mı dolu mu olacağını bu belirliyor. */
  useEffect(() => {
    const olc = () => setKaydi(window.scrollY > 24);
    olc();
    window.addEventListener("scroll", olc, { passive: true });
    return () => window.removeEventListener("scroll", olc);
  }, []);

  /** Arama açılınca imleci alana koy — alan hep DOM'da olduğu için autoFocus yok */
  useEffect(() => {
    if (searchOpen) aramaAlaniRef.current?.focus();
  }, [searchOpen]);

  /**
   * Arama açıkken imleç hapın dışına çıkar ve hiçbir şey yazılmamışsa kapat.
   *
   * Forma onMouseLeave koymak yetmiyor: imleç arama ikonunun üzerindeyken form
   * onun yerine geçiyor, tarayıcı "hiç girmedi" saydığı için ayrılma olayı
   * gelmiyordu. Burada imlecin gerçek konumu ölçülüyor.
   */
  useEffect(() => {
    if (!searchOpen) return;
    const izle = (e: PointerEvent) => {
      if (q.trim()) return; // yazmaya başlamışsa kapatma
      const hap = headerRef.current?.querySelector(".lx-hap");
      if (!hap) return;
      const r = hap.getBoundingClientRect();
      const pay = 16;
      const disarida =
        e.clientX < r.left - pay ||
        e.clientX > r.right + pay ||
        e.clientY < r.top - pay ||
        e.clientY > r.bottom + pay;
      if (disarida) setSearchOpen(false);
    };
    document.addEventListener("pointermove", izle);
    return () => document.removeEventListener("pointermove", izle);
  }, [searchOpen, q]);

  /**
   * Panel açıkken imleç header'ın (hap + panel) dışına çıkarsa kapat.
   *
   * Yalnızca onMouseLeave'e güvenmek yetmiyor: imleç panelin kenarındaki boş
   * alandan çıktığında ya da pencereden ayrıldığında olay her zaman gelmiyor,
   * panel açık kalıyordu. Burada imlecin gerçek konumu ölçülüyor.
   */
  useEffect(() => {
    if (!shopOpen) return;
    const izle = (e: PointerEvent) => {
      const el = headerRef.current;
      if (!el) return;

      /* GÖRÜNEN kutuları ölçüyoruz: hapın kendisi ve panel kartı.
         Önceden header ve panel sarmalayıcısı ölçülüyordu; ikisi de ekran
         genişliğinde olduğu için imleç sağa/sola gidince hâlâ "içeride"
         sayılıyor ve panel kapanmıyordu.

         İkisinin kapsayıcı dikdörtgeni alınıyor: hap ile kart arasındaki
         boşluk da içeri giriyor, aradan geçerken panel kapanmıyor. */
      const hap = el.querySelector(".lx-hap");
      const kart = el.querySelector("[data-panel-card]");
      if (!hap || !kart) return;

      const a = hap.getBoundingClientRect();
      const c = kart.getBoundingClientRect();
      const pay = 12; // küçük taşmalar kapatmasın
      const sol = Math.min(a.left, c.left) - pay;
      const sag = Math.max(a.right, c.right) + pay;
      const ust = Math.min(a.top, c.top) - pay;
      const alt = Math.max(a.bottom, c.bottom) + pay;

      const icinde = e.clientX >= sol && e.clientX <= sag && e.clientY >= ust && e.clientY <= alt;
      // Dışarıdaysa BEKLETMEDEN kapat. Gecikme, hap ile panel arasında geçerken
      // kapanmasın diye vardı; ikisi bitişik olduğu için gerek yok ve imleç
      // çekilince panel bir süre daha açık kalıyordu.
      if (icinde) openShop();
      else setShopOpen(false);
    };
    /* İmleç pencereden tamamen çıkarsa artık pointermove gelmez — panel açık
       kalırdı. Pencereden ayrılma, sekme değişimi ve sayfa kaydırma da
       kapanma sebebi. */
    const pencereyiTerk = () => setShopOpen(false);
    /* İmleç pencereden çıkarken son hareket hapın üzerindeyse pointermove
       "içeride" der ve panel açık kalırdı. mouseout'ta relatedTarget boşsa
       imleç belgeyi tamamen terk etmiş demektir. */
    const belgedenCikti = (e: MouseEvent) => {
      if (!e.relatedTarget) setShopOpen(false);
    };
    const kaydirinca = () => setShopOpen(false);

    document.addEventListener("pointermove", izle);
    document.addEventListener("mouseleave", pencereyiTerk);
    document.addEventListener("mouseout", belgedenCikti);
    window.addEventListener("blur", kaydirinca);
    window.addEventListener("scroll", kaydirinca, { passive: true });
    return () => {
      document.removeEventListener("pointermove", izle);
      document.removeEventListener("mouseleave", pencereyiTerk);
      document.removeEventListener("mouseout", belgedenCikti);
      window.removeEventListener("blur", kaydirinca);
      window.removeEventListener("scroll", kaydirinca);
    };
  }, [shopOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShopOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /**
   * Header her sayfada, hero/içeriğin üzerinde yüzen siyah bir "hap".
   * Sayfa kaydırılsa da, kategori paneli açılsa da hap olarak kalır —
   * panel hapın ALTINDA ayrı bir kart olarak açılır. Sadece mobil menü
   * açıldığında tam genişlik siyah çubuğa döner (menü hapa sığmaz).
   */
  const pill = !menuOpen;

  return (
    <header
      ref={headerRef}
      className={`relative text-white ${pill ? "bg-transparent" : "bg-black"}`}
      onMouseLeave={scheduleCloseShop}
    >
      <div
        className={
          pill
            ? "lx-hap relative mx-auto mt-4 flex w-fit items-center rounded-full px-5 py-2.5 sm:mt-5 sm:px-8 sm:py-3"
            : "mx-auto flex h-[var(--sg-header-h)] max-w-[90rem] items-center gap-6 px-4 sm:gap-10 sm:px-8"
        }
        /* Sayfanın en üstündeyken hap şeffaf — arkadaki görsel kesilmiyor.
           Aşağı kaydırılınca dolu siyaha dönüyor ki içerik altından geçerken
           menü okunur kalsın. Panel açıkken de dolu, yoksa panelden kopuk durur. */
        style={
          pill
            ? {
                background: dolu || kaydi || shopOpen || searchOpen ? "#000000" : "transparent",
                /* Genişlik SABİT: arama açılınca hap ne büyüyor ne küçülüyor,
                   sadece içi boşalıp yerine arama alanı geliyor. */
                transition: "background 320ms var(--lx-ease)",
              }
            : undefined
        }
      >
        {/* Menü ve arama ÜST ÜSTE duruyor, biri diğerinin yerine geçmiyor.
            Böylece hap yeniden ölçülmüyor: genişlik yumuşakça değişiyor,
            içerik yer değiştirirken zıplama/titreme olmuyor. */}
        <div
          className="flex items-center gap-5 sm:gap-9"
          style={{
            opacity: searchOpen ? 0 : 1,
            pointerEvents: searchOpen ? "none" : "auto",
            transition: "opacity 260ms var(--lx-ease)",
          }}
          aria-hidden={searchOpen}
        >
        <button type="button" className="p-1 lg:hidden" aria-label="Menü" onClick={() => setMenuOpen(true)}>
          <BurgerIcon />
        </button>

        <Link
          href="/"
          className="flex shrink-0 items-center"
          onMouseEnter={scheduleCloseShop}
          aria-label={SITE_NAME}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/marmara-logo.png"
            alt={SITE_NAME}
            className={`w-auto object-contain brightness-0 invert ${pill ? "h-7 sm:h-8" : "h-11 sm:h-12"}`}
          />
        </Link>

        <nav className={`hidden min-w-0 lg:block ${pill ? "" : "flex-1"}`}>
          <ul
            className={`flex items-center gap-6 xl:gap-9 ${
              pill ? "" : "h-[var(--sg-header-h)]"
            }`}
          >
            {MAIN_NAV.map((item) => {
              const isShop = Boolean(item.children);
              const active = isShop && shopOpen;
              return (
                <li
                  key={item.label}
                  className="relative flex h-full items-center"
                  onMouseEnter={() => {
                    if (isShop) openShop();
                    else scheduleCloseShop();
                  }}
                >
                  <Link
                    href={item.href}
                    data-no-transition={isShop ? "true" : undefined}
                    className={`sg-header-link relative transition-opacity hover:opacity-70 ${
                      active ? "opacity-100" : ""
                    }`}
                    onClick={(e) => {
                      if (isShop) {
                        e.preventDefault();
                        setShopOpen((v) => !v);
                      }
                    }}
                  >
                    {item.label}
                    {active ? (
                      <span className="absolute inset-x-0 bottom-0 mx-auto h-px w-full bg-white" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={`flex shrink-0 items-center gap-4 sm:gap-5 ${pill ? "" : "ml-auto"}`}
          onMouseEnter={scheduleCloseShop}
        >
          {/* Hesap — imleç gelince açılıyor, tıklamaya gerek yok */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => {
              closeCartDrawer();
              setSearchOpen(false);
              setHesapAcik(true);
            }}
            onMouseLeave={() => setHesapAcik(false)}
          >
            <Link href={customer ? "/account" : "/login"} aria-label="Account" className="hover:opacity-70">
              <UserIcon />
            </Link>

            {hesapAcik ? (
              <div className="absolute right-0 top-full z-50 pt-4">
                <div
                  className="w-[240px] rounded-[20px] px-6 py-5"
                  style={{
                    background: "rgba(16,14,13,0.94)",
                    backdropFilter: "blur(24px) saturate(130%)",
                    WebkitBackdropFilter: "blur(24px) saturate(130%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
                  }}
                >
                  <p className="lx-eyebrow mb-4">Account</p>
                  <ul className="m-0 list-none p-0">
                    {(customer
                      ? [
                          { etiket: "My account", href: "/account" },
                          { etiket: "Orders", href: "/account?section=orders" },
                          { etiket: "Addresses", href: "/account?section=addresses" },
                          { etiket: "Password", href: "/account?section=password" },
                        ]
                      : [
                          { etiket: "Sign in", href: "/login" },
                          { etiket: "Create account", href: "/uye-ol" },
                        ]
                    ).map((satir) => (
                      <li key={satir.href}>
                        <Link
                          href={satir.href}
                          onClick={() => setHesapAcik(false)}
                          className="lx-hesap-menu block"
                        >
                          {satir.etiket}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          {/* Arama — imleç gelince hap arama alanına dönüşüyor */}
          <button
            type="button"
            aria-label="Search"
            className="hover:opacity-70"
            onMouseEnter={() => {
              closeCartDrawer();
              setHesapAcik(false);
              setSearchOpen(true);
            }}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>

          {/* Sepet — imleç gelince mini sepet açılıyor; imleç ayrılınca kapanıyor */}
          <button
            type="button"
            aria-label="Cart"
            className="relative hover:opacity-70"
            onMouseEnter={() => {
              setSearchOpen(false);
              setHesapAcik(false);
              openCartDrawer(true);
            }}
            onClick={() => openCartDrawer()}
          >
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-[var(--sg-red)] px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
        </div>

        <form
          className="absolute inset-y-0 left-5 right-5 flex items-center gap-4 sm:left-8 sm:right-8"
          style={{
            opacity: searchOpen ? 1 : 0,
            pointerEvents: searchOpen ? "auto" : "none",
            transition: "opacity 320ms var(--lx-ease) 90ms",
          }}
          aria-hidden={!searchOpen}
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
          }}
        >
          <span aria-hidden="true" className="shrink-0 opacity-70">
            <SearchIcon />
          </span>
          <input
            ref={aramaAlaniRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            tabIndex={searchOpen ? 0 : -1}
            className="min-w-0 flex-1 border-0 bg-transparent text-[16px] text-white outline-none placeholder:text-white/45"
            style={{ fontFamily: "var(--font-owners)" }}
          />
          <button
            type="button"
            tabIndex={searchOpen ? 0 : -1}
            onClick={() => {
              setSearchOpen(false);
              setQ("");
            }}
            className="shrink-0 text-[11px] uppercase tracking-[0.16em] opacity-70 hover:opacity-100"
            style={{ fontFamily: "var(--font-owners)" }}
          >
            Close
          </button>
        </form>
      </div>

      {shopOpen && (
        <div
          data-shop-panel
          className="absolute inset-x-0 top-full z-50 hidden lg:block"
          onMouseEnter={openShop}
          onMouseLeave={scheduleCloseShop}
        >
          <div className="pointer-events-auto absolute -top-4 left-0 right-0 h-4" aria-hidden />
          <MegaPanel collections={collections} onClose={() => setShopOpen(false)} />
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Kapat"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-black p-5 text-white">
            <div className="mb-6 flex items-center justify-between">
              <span className="sg-nav text-[12px]">Menu</span>
              <button type="button" className="text-2xl" onClick={() => setMenuOpen(false)}>
                ×
              </button>
            </div>
            <ul className="space-y-1">
              {MAIN_NAV.map((item) => (
                <li key={item.label} className="border-b border-white/10">
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className="sg-nav flex w-full items-center justify-between py-3 text-left text-[13px]"
                        onClick={() => setAccordion((a) => (a === item.label ? null : item.label))}
                      >
                        {item.label}
                        <span>{accordion === item.label ? "−" : "+"}</span>
                      </button>
                      {accordion === item.label && (
                        <ul className="space-y-3 pb-4 pl-1">
                          {collections.map((c, i) => (
                            <li key={c.handle}>
                              <Link
                                href={c.href}
                                className="flex items-center gap-3"
                                onClick={() => setMenuOpen(false)}
                              >
                                {/* Masaüstü paneldeki numaralı indeksin aynısı */}
                                <span className="shrink-0 text-[10px] tracking-[0.14em] text-white/45">
                                  [ {String(i + 1).padStart(3, "0")} ]
                                </span>
                                <span className="sg-nav min-w-0 truncate text-[12px]">{c.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="sg-nav block py-3 text-[13px]"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </header>
  );
}

function BurgerIcon() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
      <path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5 21 21" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
