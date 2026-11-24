import type { Metadata } from "next";
import { BerberPanel } from "@/components/slick/berber-panel";

export const metadata: Metadata = {
  title: "Barber panel",
  robots: { index: false },
};

export default function Page() {
  return <BerberPanel />;
}
