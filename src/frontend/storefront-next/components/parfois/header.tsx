"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MAIN_NAV } from "@/lib/parfois-theme";
import { useDesktopHoverMenu } from "@/lib/use-hover-capable";
import { BrandLogo } from "@/components/parfois/brand-logo";
import { MiniCart } from "@/components/parfois/mini-cart";
import { SearchOverlay } from "@/components/parfois/search-overlay";
import { useAuthStore } from "@/store/auth-store";

export function ParfoisHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const desktopHoverMenu = useDesktopHoverMenu();
  const [menuOpen, setMenuOpen] = useState(false);
  const [backdropReady, setBackdropReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customer = useAuthStore((s) => s.customer);

  const accountLabel = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Hesabım"
    : "Üye Girişi";

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(false);
    setBackdropReady(false);
  };

  const scheduleCloseMenu = () => {
    if (!desktopHoverMenu) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => closeMenu(), 160);
  };

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (closeTimer.current) clearTimeout(closeTimer.current);

    if (menuOpen) {
      closeMenu();
      return;
    }

    setBackdropReady(false);
    setMenuOpen(true);
  };

  const desktopHoverHandlers = desktopHoverMenu
    ? { onMouseEnter: openMenu, onMouseLeave: scheduleCloseMenu }
    : {};

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setBackdropReady(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setIsScrolled(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /** Ana sayfa tepede: hero üzerinde şeffaf/beyaz chrome; scroll sonrası sabit beyaz bar */
  const lightChrome = isHome && !isScrolled && !menuOpen && !searchOpen && !accountOpen;
  const showBackdrop = menuOpen && !desktopHoverMenu;

  /** Mobilde açılış dokunuşunun backdrop'a düşmesini engelle */
  useEffect(() => {
    if (!menuOpen || desktopHoverMenu) {
      setBackdropReady(false);
      return;
    }

    setBackdropReady(false);
    const id = window.setTimeout(() => setBackdropReady(true), 400);
    return () => window.clearTimeout(id);
  }, [menuOpen, desktopHoverMenu]);

  return (
    <>
      <header
        className={`w-full max-w-[100vw] transition-[background-color,border-color,color,box-shadow] duration-200 ${
          lightChrome
            ? "border-b border-transparent bg-transparent"
            : "border-b border-[#e5e5e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]"
        }`}
      >
        <div
          className={`relative flex h-12 items-center justify-between gap-2 px-3 sm:h-14 sm:px-4 md:h-16 md:px-6 lg:h-[4.5rem] lg:px-8 ${
            lightChrome ? "text-white" : "text-[var(--pf-black)]"
          }`}
        >
          <div
            className="relative z-20 flex min-w-0 items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4"
            {...desktopHoverHandlers}
          >
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center"
              aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-nav"
              onClick={toggleMenu}
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M3 4H17M3 10H17M3 16H17" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <Link href="/" className="hidden min-w-0 items-center md:flex" aria-label="Dominant">
              <BrandLogo variant="header" priority />
            </Link>
          </div>

          <Link
            href="/"
            className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center md:hidden"
            aria-label="Dominant"
          >
            <BrandLogo variant="header" priority />
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 touch-manipulation flex-col items-center md:flex"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.22em]">ARAMA</span>
            <span
              className={`mt-1.5 block h-px w-[72px] ${
                lightChrome ? "bg-white/85" : "bg-[var(--pf-black)]/35"
              }`}
            />
          </button>

          <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
            <button
              type="button"
              className="flex h-10 w-10 touch-manipulation items-center justify-center sm:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Ara"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path
                  d="M18 16.5L13.88 13.28M13.88 13.28A6.36 6.36 0 0015.23 9.36C15.23 5.85 12.38 3 8.86 3S2.5 5.85 2.5 9.36s2.85 6.36 6.36 6.36c2.04 0 3.85-.96 5.02-2.45z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="relative hidden sm:block" ref={accountRef}>
              <AccountButton
                accountLabel={accountLabel}
                accountOpen={accountOpen}
                customer={customer}
                onToggle={() => setAccountOpen((v) => !v)}
                onClose={() => setAccountOpen(false)}
              />
            </div>

            <MiniCart light={lightChrome} />
          </div>
        </div>
      </header>

      {showBackdrop ? (
        <button
          type="button"
          className={`fixed inset-0 z-[60] cursor-default bg-black/30 transition-opacity ${
            backdropReady ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-label="Menüyü kapat"
          onClick={closeMenu}
          tabIndex={backdropReady ? 0 : -1}
        />
      ) : null}

      <div
        id="site-mobile-nav"
        role="dialog"
        aria-modal={menuOpen}
        aria-hidden={!menuOpen}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[min(100vw,420px)] max-w-full flex-col bg-white shadow-[8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out sm:w-[min(92vw,440px)] md:max-w-[480px] ${
          menuOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        {...desktopHoverHandlers}
      >
        <div className="flex min-h-12 shrink-0 items-center border-b border-[#f0f0f0] px-5 py-2 sm:min-h-14 sm:px-6 md:min-h-16 md:px-7 lg:min-h-[4.5rem]">
          <Link href="/" className="flex min-w-0 items-center py-1" onClick={closeMenu} aria-label="Dominant">
            <BrandLogo variant="drawer" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-1 md:px-7">
          <ul>
            {MAIN_NAV.map((item) => {
              const hasChildren = !!item.children?.length;
              const isExpanded = expanded === item.label;
              const itemClassName = `text-[13px] font-medium tracking-[0.02em] ${
                item.accent ? "uppercase text-[var(--pf-pink)]" : "text-[var(--pf-black)]"
              }`;

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <button
                      type="button"
                      className={`flex w-full items-center py-[10px] text-left ${itemClassName}`}
                      aria-expanded={isExpanded}
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                    >
                      {item.label}
                      {item.badge ? (
                        <sup className="ml-1 align-super text-[9px] font-semibold text-[var(--pf-pink)]">
                          {item.badge}
                        </sup>
                      ) : null}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={`block py-[10px] ${itemClassName}`}
                    >
                      {item.label}
                      {item.badge ? (
                        <sup className="ml-1 align-super text-[9px] font-semibold text-[var(--pf-pink)]">
                          {item.badge}
                        </sup>
                      ) : null}
                    </Link>
                  )}

                  {hasChildren && isExpanded ? (
                    <ul className="mb-3 space-y-2 pl-3">
                      {item.children!.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={closeMenu}
                            className="block py-1 text-[12px] text-[#666] hover:text-black"
                          >
                            {child.label}
                            {child.badge ? (
                              <sup className="ml-1 align-super text-[9px] font-semibold text-[var(--pf-pink)]">
                                {child.badge}
                              </sup>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-[#eee] pt-4 sm:hidden">
            <Link
              href={customer ? "/account" : "/login"}
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 text-[12px] text-[#666]"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M13.5 5.97a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                <path d="M16 17.55c0-2.35-1.71-5.95-6-5.95s-6 3.6-6 5.95" strokeLinecap="round" />
              </svg>
              {accountLabel}
            </Link>
          </div>
        </nav>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#eee] px-5 py-4 text-[11px] text-[#666] md:px-7">
          <span className="flex items-center gap-1.5 tracking-[0.02em]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
            </svg>
            Türkiye - Türkçe
          </span>
          <Link
            href={customer ? "/account" : "/login"}
            onClick={closeMenu}
            className="hidden max-w-[48%] items-center gap-1.5 truncate hover:text-black sm:flex"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M13.5 5.97a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
              <path d="M16 17.55c0-2.35-1.71-5.95-6-5.95s-6 3.6-6 5.95" strokeLinecap="round" />
            </svg>
            <span className="truncate">{accountLabel}</span>
          </Link>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function AccountButton({
  accountLabel,
  accountOpen,
  customer,
  onToggle,
  onClose,
}: {
  accountLabel: string;
  accountOpen: boolean;
  customer: ReturnType<typeof useAuthStore.getState>["customer"];
  onToggle: () => void;
  onClose: () => void;
}) {
  const triggerLabel = customer ? accountLabel : "Üye Girişi";

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2"
        onClick={onToggle}
        aria-expanded={accountOpen}
        aria-haspopup="true"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M13.5 5.97a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" strokeLinejoin="round" />
          <path
            d="M16 17.55c0-2.35-1.71-5.95-6-5.95s-6 3.6-6 5.95"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden max-w-[160px] truncate text-[11px] font-medium tracking-[0.02em] sm:inline">
          {triggerLabel}
        </span>
      </button>

      {accountOpen && (
        <div className="pf-account-dropdown absolute right-0 top-full z-50 mt-3 w-[292px] bg-white text-[var(--pf-black)]">
          <span className="pf-account-dropdown-caret" aria-hidden />

          {customer ? (
            <div className="px-6 pb-5 pt-6 text-center">
              <p className="text-[12px] font-medium">Merhaba, {accountLabel}</p>
              <Link
                href="/account"
                className="pf-btn-primary mt-4 !text-white hover:!text-white"
                onClick={onClose}
              >
                Hesabım
              </Link>
            </div>
          ) : (
            <div className="px-6 pb-5 pt-6">
              <Link href="/login" className="pf-btn-primary !text-white hover:!text-white" onClick={onClose}>
                Oturum Aç
              </Link>
              <p className="mt-4 text-center text-[12px] leading-none text-[#333]">
                Üye Girişi{" "}
                <Link href="/uye-ol" className="underline underline-offset-[3px]" onClick={onClose}>
                  Üye Ol
                </Link>
              </p>
            </div>
          )}

          <div className="border-t border-[#e8e8e8]" />

          <div className="flex items-center justify-between px-6 py-5">
            <Link
              href={customer ? "/account?section=orders" : "/login"}
              onClick={onClose}
              className="flex items-center gap-2 text-[12px] text-[#333] hover:text-black"
            >
              <OrdersIcon />
              <span>Siparişlerim</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-2 text-[12px] text-[#333] hover:text-black"
            >
              <HeartIcon />
              <span>Favorilerim</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <path d="M3 7.5L12 3l9 4.5v9L12 21 3 16.5v-9z" strokeLinejoin="round" />
      <path d="M12 3v18M3 7.5l9 4.5 9-4.5" strokeLinejoin="round" />
      <path d="M1 10.5h2.5M1 13.5h2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <path
        d="M12 20.5s-6.5-4.2-6.5-9.2A3.8 3.8 0 0 1 12 8.2a3.8 3.8 0 0 1 6.5 3.1c0 5-6.5 9.2-6.5 9.2z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
