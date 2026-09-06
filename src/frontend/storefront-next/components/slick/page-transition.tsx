"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Sayfa geçişi — perde.
 *
 * Site içi bir bağlantıya tıklandığında ekranı alttan yukarı kaplayan koyu
 * bir panel giriyor, sayfa onun arkasında değişiyor, sonra panel yukarı
 * doğru çıkıp yeni sayfayı ortaya bırakıyor. Böylece beyaz bir sıçrama ya da
 * yarım yüklenmiş sayfa görünmüyor.
 *
 * Gezinme elle yakalanıyor çünkü perdenin sayfa DEĞİŞMEDEN önce kapanması
 * gerekiyor; sadece adres değişimini dinlemek buna yetmiyor.
 */

const KAPANMA_MS = 420;
const ACILMA_MS = 560;

type Durum = "bos" | "kapaniyor" | "aciliyor";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [durum, setDurum] = useState<Durum>("bos");

  // Site içi bağlantıları yakala, önce perdeyi kapat sonra gezin
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;

      // Kendi işini kendi yapan bağlantılar (mega menüyü açan, listede
      // seçim yapan) perdeyi tetiklemesin.
      if (a.dataset.noTransition === "true") return;

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const hedef = href.split("#")[0].split("?")[0];
      if (hedef === pathname) return; // aynı sayfa

      // Yakalama aşamasında durduruyoruz: next/link kendi tıklama
      // işleyicisinde preventDefault çağırıp hemen geziniyor. Ondan önce
      // araya girmezsek perde kapanmadan sayfa değişiyor.
      e.preventDefault();
      e.stopPropagation();
      setDurum("kapaniyor");
      window.setTimeout(() => router.push(href), KAPANMA_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  // Adres değiştiğinde perdeyi aç
  useEffect(() => {
    setDurum("aciliyor");
    const t = window.setTimeout(() => setDurum("bos"), ACILMA_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <div aria-hidden="true" className={`lx-curtain lx-curtain--${durum}`} />
      <div key={pathname} className="lx-page">
        {children}
      </div>
    </>
  );
}
