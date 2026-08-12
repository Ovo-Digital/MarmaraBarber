import type { Metadata } from "next";
import { KvkkApplicationForm } from "@/components/slick/kvkk-form";
import { LegalPageLayout } from "@/components/slick/legal-page";
import { LEGAL_PAGES } from "@/lib/legal-content";

const page = LEGAL_PAGES.kvkkForm;

export const metadata: Metadata = { title: page.title };

export default function KvkkBasvuruFormuPage() {
  return (
    <LegalPageLayout title={page.title} sections={[...page.sections]} breadcrumbLabel="KVKK Formu">
      <KvkkApplicationForm />
    </LegalPageLayout>
  );
}
