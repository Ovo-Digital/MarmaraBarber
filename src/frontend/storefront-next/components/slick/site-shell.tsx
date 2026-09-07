"use client";

import { usePathname } from "next/navigation";
import { AuthHydrator } from "@/components/parfois/auth-hydrator";
import { CartDrawer } from "@/components/slick/cart-drawer";
import { SlickFooter } from "@/components/slick/footer";
import { SlickHeader, type NavCollection } from "@/components/slick/header";
import { PageTransition } from "@/components/slick/page-transition";
import { useUiStore } from "@/store/ui-store";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const chromeRef = useRef<HTMLDivElement | null>(null);
  /** Header'ın arkasındaki alan koyu mu? Şeffaf durabilmesi buna bağlı. */

  /**
   * Header yüzüyor ve sayfanın en üst şeridini kapatıyor.
   *
   * Üstünde koyu hero bandı olan sayfalar bunu useKoyuUstBildir() ile haber
   * veriyor: orada hap şeffaf durur, içerik altından geçer. Haber vermeyen
   * sayfanın üstü açık renklidir — hap dolu olur ve içeriğe header yüksekliği
   * kadar boşluk bırakılır, yoksa içerik hapın altında kalıyor.
   */
  const koyuUst = useUiStore((s) => s.koyuUst);
  const [baslikYuksekligi, setBaslikYuksekligi] = useState(0);

  useLayoutEffect(() => {
    const olc = () => setBaslikYuksekligi(chromeRef.current?.getBoundingClientRect().height ?? 0);
    olc();
    window.addEventListener("resize", olc);
    return () => window.removeEventListener("resize", olc);
  }, [pathname]);

  return (
    <>
      <AuthHydrator />
      <CartHydrator />
      <div
        ref={chromeRef}
        id="site-chrome"
        /* Header HER sayfada içeriğin üzerinde yüzüyor (yer kaplamıyor).
           Önceden anasayfa dışında yapışkan bir çubuktu; kendi 78px'lik boş
           alanı sayfanın en üstünde beyaz bir şerit olarak görünüyordu. */
        className="fixed inset-x-0 top-0 z-50 w-full max-w-[100vw]"
      >
        <SlickHeader collections={navCollections} dolu={!koyuUst} />
      </div>
      <main className="w-full max-w-[100vw] flex-1" style={{ paddingTop: koyuUst ? 0 : baslikYuksekligi }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <SlickFooter />
      <GlobalCartDrawer />
    </>
  );
}
