import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/slick/site-shell";
import { QueryProvider } from "@/providers/query-provider";
import { storefrontGetHeroSlides } from "@/services/shopify/storefront-direct";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marmara Barber | Profesyonel Berber & Grooming",
    template: "%s | Marmara Barber",
  },
  description:
    "Marmara Barber resmi online mağaza — kolonya, saç şekillendirme, cilt bakımı, parfüm ve berber aksesuarları.",
  openGraph: {
    title: "Marmara Barber",
    description: "Profesyonel berber ve grooming ürünleri.",
    siteName: "Marmara Barber",
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Menü içeriği Shopify'dan; bağlantı kurulamazsa menü boş kalır ama site açılır.
  let navCollections: Awaited<ReturnType<typeof storefrontGetHeroSlides>> = [];
  try {
    navCollections = await storefrontGetHeroSlides(10);
  } catch {
    navCollections = [];
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <QueryProvider>
          <SiteShell navCollections={navCollections}>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}
