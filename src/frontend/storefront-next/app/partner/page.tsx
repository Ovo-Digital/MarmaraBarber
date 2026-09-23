import type { Metadata } from "next";
import { PartnerPage } from "@/components/slick/partner-page";

export const metadata: Metadata = {
  title: "Partner portal",
  description: "Marmara Barber wholesale partners — orders, account and support.",
  robots: { index: false },
};

export default function Page() {
  return <PartnerPage />;
}
