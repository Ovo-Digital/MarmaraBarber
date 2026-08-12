import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/slick/legal-page";
import { LEGAL_PAGES } from "@/lib/legal-content";

const page = LEGAL_PAGES.kvkk;

export const metadata: Metadata = { title: page.title };

export default function KvkkPage() {
  return <LegalPageLayout title={page.title} sections={[...page.sections]} breadcrumbLabel="KVKK" />;
}
