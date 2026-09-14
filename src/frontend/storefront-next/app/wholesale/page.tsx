import type { Metadata } from "next";
import { Suspense } from "react";
import { WholesalePage } from "@/components/slick/wholesale-page";

export const metadata: Metadata = {
  title: "Wholesale & distribution",
  description:
    "Stock Marmara Barber, or distribute the range in your market. Apply to become a partner, or sign in to your partner account.",
};

export default function Page() {
  // useSearchParams (?tab=login) derleme sırasında Suspense sınırı istiyor
  return (
    <Suspense>
      <WholesalePage />
    </Suspense>
  );
}
