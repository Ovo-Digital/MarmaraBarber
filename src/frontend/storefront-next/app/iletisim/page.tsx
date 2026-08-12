import type { Metadata } from "next";
import { SlickContactPage } from "@/components/slick/contact-page";

export const metadata: Metadata = { title: "Contact us" };

export default function IletisimPage() {
  return <SlickContactPage />;
}
