"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAIN_NAV, MEGA_FEATURED, MEGA_LINKS, SITE_NAME } from "@/lib/slick-theme";
import { useAuthStore } from "@/store/auth-store";
import { useLocalCartStore } from "@/store/local-cart-store";
import { useUiStore } from "@/store/ui-store";

function MegaPanel({ onClose }: { onClose: () => void }) {
  const mid = Math.ceil(MEGA_LINKS.length / 2);
  const col1 = MEGA_LINKS.slice(0, mid);
  const col2 = MEGA_LINKS.slice(mid);

  return (
    <div className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-[90rem] items-start gap-8 px-6 py-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12 lg:px-8 lg:py-7">
        {/* Sol: kompakt 2 kolon link */}
        <div className="grid grid-cols-2 gap-x-8 content-start">
          <ul className="space-y-3.5">
            {col1.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="sg-nav-bold text-[16px] transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-3.5">
            {col2.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="sg-nav-bold text-[16px] transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Sağ: yatay/kısa featured kartlar (full-height değil) */}
        <div className="grid grid-cols-2 gap-4">
          {MEGA_FEATURED.map((f) => (
            <Link key={f.href} href={f.href} onClick={onClose} className="group block max-w-xs">
              <div className="aspect-[16/10] overflow-hidden bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.image}
                  alt={f.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="sg-nav mt-2.5 text-[11px] tracking-[0.04em]">{f.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SlickHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useLocalCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
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

  return (
    <header className="relative bg-black text-white" onMouseLeave={scheduleCloseShop}>
      <div className="mx-auto flex h-[var(--sg-header-h)] max-w-[90rem] items-center gap-6 px-4 sm:gap-10 sm:px-8">
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
            className="h-11 w-auto object-contain brightness-0 invert sm:h-12"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex h-[var(--sg-header-h)] items-center gap-6 xl:gap-9">
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
          className="ml-auto flex shrink-0 items-center gap-4 sm:gap-5"
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
          <MegaPanel onClose={() => setShopOpen(false)} />
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
            className="absolute inset-0 bg-black/50"
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
                          {MEGA_LINKS.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="sg-nav text-[12px]"
                                onClick={() => setMenuOpen(false)}
                              >
                                {link.label}
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
