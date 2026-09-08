import type { Customer } from "@/types/customer";

/**
 * Tasarımı görmek için sahte müşteri.
 *
 * SADECE geliştirme ortamında ve yalnızca /account?demo=1 adresiyle devreye
 * girer. Shopify'a hiçbir istek gitmez, mağazada müşteri kaydı OLUŞMAZ —
 * sadece hesap ekranlarının nasıl göründüğüne bakmak için.
 *
 * Üretim derlemesinde bu yol tamamen kapalıdır.
 */
export const DEMO_MUSTERI: Customer = {
  id: "gid://demo/Customer/1",
  email: "demo@marmarabarber.test",
  firstName: "Demo",
  lastName: "User",
  phone: "555-000-00-00",
  addresses: [
    {
      id: "gid://demo/Address/1",
      firstName: "Demo",
      lastName: "User",
      address1: "123 Barber Street",
      address2: "Suite 4",
      city: "Brooklyn",
      province: "NY",
      zip: "11201",
      country: "United States",
      phone: "555-000-00-00",
    },
  ],
  orders: [
    {
      orderNumber: 1042,
      processedAt: "2026-08-21T10:24:00Z",
      financialStatus: "PAID",
      fulfillmentStatus: "FULFILLED",
      totalPrice: 84.5,
      currencyCode: "USD",
      statusUrl: "#",
    },
    {
      orderNumber: 1051,
      processedAt: "2026-09-02T15:10:00Z",
      financialStatus: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      totalPrice: 129,
      currencyCode: "USD",
      statusUrl: "#",
    },
  ],
};

/** Demo görünümü açık mı? Üretimde her zaman false. */
export function demoModu(arama: string | null): boolean {
  return process.env.NODE_ENV !== "production" && arama === "1";
}
