"use client";

import { AuthHydrator } from "@/components/parfois/auth-hydrator";
import { AnnouncementBar } from "@/components/slick/announcement-bar";
import { CartDrawer } from "@/components/slick/cart-drawer";
import { SlickFooter } from "@/components/slick/footer";
import { SlickHeader } from "@/components/slick/header";
import { useUiStore } from "@/store/ui-store";

function GlobalCartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const close = useUiStore((s) => s.closeCartDrawer);
  return <CartDrawer open={open} onClose={close} />;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHydrator />
      <div id="site-chrome" className="sticky top-0 z-50 w-full max-w-[100vw]">
        <AnnouncementBar />
        <SlickHeader />
      </div>
      <main className="w-full max-w-[100vw] flex-1">{children}</main>
      <SlickFooter />
      <GlobalCartDrawer />
    </>
  );
}
