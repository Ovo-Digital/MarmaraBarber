import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/slick/legal-page";
import { LEGAL_PAGES } from "@/lib/legal-content";

const page = LEGAL_PAGES.hakkimizda;

export const metadata: Metadata = { title: page.title };

export default function HakkimizdaPage() {
  return <LegalPageLayout title={page.title} sections={[...page.sections]} breadcrumbLabel="About" />;
}
