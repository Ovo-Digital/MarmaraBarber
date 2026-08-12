import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/slick/legal-page";
import { LEGAL_PAGES } from "@/lib/legal-content";

const page = LEGAL_PAGES.aydinlatma;

export const metadata: Metadata = { title: page.title };

export default function AydinlatmaMetniPage() {
  return (
    <LegalPageLayout title={page.title} sections={[...page.sections]} breadcrumbLabel="Aydınlatma Metni" />
  );
}
