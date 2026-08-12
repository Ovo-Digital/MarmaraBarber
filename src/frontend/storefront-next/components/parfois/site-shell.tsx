import { PromoBar } from "@/components/parfois/promo-bar";
import { AuthHydrator } from "@/components/parfois/auth-hydrator";
import { ParfoisHeader } from "@/components/parfois/header";
import { ParfoisFooter } from "@/components/parfois/footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHydrator />
      <div id="site-chrome" className="fixed top-0 left-0 right-0 z-50 w-full max-w-[100vw]">
        <PromoBar />
        <ParfoisHeader />
      </div>
      {/* Sabit header için yer tutucu — ana sayfa hero negatif margin ile üste taşınır */}
      <div className="h-[var(--pf-chrome-h)] shrink-0" aria-hidden />
      <main className="w-full max-w-[100vw] flex-1">{children}</main>
      <ParfoisFooter />
    </>
  );
}
