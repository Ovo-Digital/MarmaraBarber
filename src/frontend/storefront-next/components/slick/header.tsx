"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAIN_NAV, SITE_NAME } from "@/lib/slick-theme";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyCartStore } from "@/store/shopify-cart-store";
import { useUiStore } from "@/store/ui-store";

/**
 * Hap nav'ın altında açılan kategori paneli.
 *
 * İçerik tamamen Shopify koleksiyonlarından gelir (kodda koleksiyon adı/görseli
 * sabit yazılı DEĞİL) — böylece başka bir mağazaya bağlandığında kendi
 * kategorileri görünür. İlk 4 koleksiyon görselli kart, kalanlar alt satırda
 * metin link olur.
 */
/** Menüyü besleyen koleksiyon — Shopify'dan gelir, kodda sabit değildir. */
export type NavCollection = {
  handle: string;
  title: string;
  imageUrl: string;
  href: string;
};

function MegaPanel({
  collections,
  onClose,
}: {
  collections: NavCollection[];
  onClose: () => void;
}) {
  const cards = collections.slice(0, 4);
  const links = collections.slice(4, 10);

  if (!cards.length) return null;

  return (
    <div className="px-3 pt-2 sm:px-4 sm:pt-3">
      <div
        className="mx-auto w-full max-w-[1100px] rounded-[26px] p-4 sm:rounded-[32px] sm:p-7"
        /* Buzlu cam: arkadaki hero görseli bulanık olarak geçer.
           Satır içi stil kullanılıyor çünkü projenin katmansız CSS kuralları
           Tailwind renk sınıflarını eziyor. */
        style={{
          background: "rgba(255,255,255,0.11)",
          backdropFilter: "blur(34px) saturate(150%)",
          WebkitBackdropFilter: "blur(34px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
          color: "#ffffff",
        }}
      >
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-6">
          {cards.map((c) => (
            <Link
              key={c.handle}
              href={c.href}
              onClick={onClose}
              className="group flex items-center gap-4 sm:items-start"
              style={{ color: "#ffffff" }}
            >
              <span className="block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10 sm:h-28 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <span
                className="sg-heading min-w-0 transition-opacity group-hover:opacity-60 sm:pt-1"
                style={{ fontSize: "clamp(15px, 1.45vw, 21px)", lineHeight: 1.08 }}
              >
                {c.title}
              </span>
            </Link>
          ))}
        </div>

        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-5 sm:mt-7"
          style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
        >
          <div className="flex min-w-0 flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.handle}
                href={l.href}
                onClick={onClose}
                className="text-[12px] font-bold uppercase tracking-[0.04em] transition-opacity hover:opacity-100 sm:text-[13px]"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                {l.title}
              </Link>
            ))}
          </div>

          <Link
            href="/collections"
            onClick={onClose}
            className="shrink-0 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.06em] transition-opacity hover:opacity-80 sm:px-7 sm:text-[13px]"
            style={{ background: "#000000", color: "#ffffff" }}
          >
            View all
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SlickHeader({ collections = [] }: { collections?: NavCollection[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useShopifyCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const customer = useAuthStore((s) => s.customer);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

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
      className={`relative text-white ${pill ? "bg-transparent" : "bg-black"}`}
      onMouseLeave={scheduleCloseShop}
    >
      <div
        className={
          pill
            ? "mx-auto mt-4 flex w-fit items-center gap-5 rounded-full bg-black px-5 py-2.5 sm:mt-5 sm:gap-9 sm:px-8 sm:py-3"
            : "mx-auto flex h-[var(--sg-header-h)] max-w-[90rem] items-center gap-6 px-4 sm:gap-10 sm:px-8"
        }
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
          <Link href={customer ? "/account" : "/login"} aria-label="Login" className="hover:opacity-70">
            <UserIcon />
          </Link>
          <button
            type="button"
            aria-label="Search"
            className="hover:opacity-70"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Cart"
            className="relative hover:opacity-70"
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

      {shopOpen && (
        <div
          className="absolute inset-x-0 top-full z-50 hidden lg:block"
          onMouseEnter={openShop}
          onMouseLeave={scheduleCloseShop}
        >
          <div className="pointer-events-auto absolute -top-4 left-0 right-0 h-4" aria-hidden />
          <MegaPanel collections={collections} onClose={() => setShopOpen(false)} />
        </div>
      )}

      {searchOpen && (
        <div className="border-t border-white/10 bg-black px-4 py-5">
          <form
            className="mx-auto flex max-w-[90rem] gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/search?q=${encodeURIComponent(q)}`;
            }}
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full border-0 border-b border-white/40 bg-transparent py-2 text-[16px] text-white outline-none placeholder:text-white/40"
            />
            <button type="submit" className="sg-btn-red !py-2">
              Search
            </button>
          </form>
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
                        <ul className="space-y-3 pb-4 pl-3">
                          {collections.map((c) => (
                            <li key={c.handle}>
                              <Link
                                href={c.href}
                                className="sg-nav text-[12px]"
                                onClick={() => setMenuOpen(false)}
                              >
                                {c.title}
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
