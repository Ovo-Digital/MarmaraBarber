import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/slick/site-shell";
import { RevizeModu } from "@/components/slick/revize";
import { QueryProvider } from "@/providers/query-provider";
import { storefrontGetHeroSlides } from "@/services/shopify/storefront-direct";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marmara Barber | Professional Barber & Grooming",
    template: "%s | Marmara Barber",
  },
  description:
    "The official Marmara Barber store — cologne, styling, skin care, fragrance and barber accessories. Made for the chair since 1970.",
  openGraph: {
    title: "Marmara Barber",
    description: "Professional barber and grooming products.",
    siteName: "Marmara Barber",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Mobil klavye açılınca görünür alan KÜÇÜLSÜN, içeriğin üstüne binmesin.
     Varsayılan davranışta klavye sabit konumlu header'ı yerinden oynatıyor;
     arama alanına dokununca header kayıp gidiyordu. */
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Menü içeriği Shopify'dan; bağlantı kurulamazsa menü boş kalır ama site açılır.
  let navCollections: Awaited<ReturnType<typeof storefrontGetHeroSlides>> = [];
  try {
    navCollections = await storefrontGetHeroSlides(10);
  } catch {
    navCollections = [];
  }

  /* Revize Modu yalnızca bu değişken tanımlıyken çizilir; yayında
     tanımsız bırakılır ve müşteri düğmeyi hiç görmez. */
  const revizeAcik = process.env.NEXT_PUBLIC_REVIZE === "1";

  return (
    <html lang="tr">
      <body className="flex min-h-screen flex-col antialiased">
        <QueryProvider>
          <SiteShell navCollections={navCollections}>{children}</SiteShell>
        </QueryProvider>
        {revizeAcik ? <RevizeModu /> : null}
      </body>
    </html>
  );
}
