"use client";

import { usePathname } from "next/navigation";
import { AuthHydrator } from "@/components/parfois/auth-hydrator";
import { CartDrawer } from "@/components/slick/cart-drawer";
import { SlickFooter } from "@/components/slick/footer";
import { SlickHeader, type NavCollection } from "@/components/slick/header";
import { PageTransition } from "@/components/slick/page-transition";
import { useUiStore } from "@/store/ui-store";
import { useEffect } from "react";
import { useShopifyCartStore } from "@/store/shopify-cart-store";

/** Sayfa açılışında kayıtlı sepeti Shopify'dan tazeler (fiyat/stok güncel kalsın) */
function CartHydrator() {
  const hydrate = useShopifyCartStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return null;
}

function GlobalCartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const close = useUiStore((s) => s.closeCartDrawer);
  return <CartDrawer open={open} onClose={close} />;
}

export function SiteShell({
  children,
  navCollections = [],
}: {
  children: React.ReactNode;
  /** Menüyü besleyen Shopify koleksiyonları — layout'ta sunucuda çekilir. */
  navCollections?: NavCollection[];
}) {
  const pathname = usePathname();
  // Ana sayfada header hero görselinin ÜZERİNDE yüzer (yer kaplamaz),
  // diğer sayfalarda eskisi gibi yapışkan üst çubuk olarak kalır.
  const overlay = pathname === "/";

  return (
    <>
      <AuthHydrator />
      <CartHydrator />
      <div
        id="site-chrome"
        className={`z-50 w-full max-w-[100vw] ${overlay ? "fixed inset-x-0 top-0" : "sticky top-0"}`}
      >
        <SlickHeader collections={navCollections} />
      </div>
      <main className="w-full max-w-[100vw] flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SlickFooter />
      <GlobalCartDrawer />
    </>
  );
}
