import type { Metadata } from "next";
import { AboutPage } from "@/components/slick/about-page";

export const metadata: Metadata = {
  title: "About",
  description: "Marmara Barber — grooming made for the chair, produced in Türkiye and sold in barbershops around the world.",
};

export default function HakkimizdaPage() {
  return <AboutPage />;
}
