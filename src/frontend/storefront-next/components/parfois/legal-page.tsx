import { Breadcrumb } from "@/components/parfois/breadcrumb";
import type { LegalSection } from "@/lib/legal-content";

type Props = {
  title: string;
  sections: LegalSection[];
  breadcrumbLabel: string;
};

export function LegalPageLayout({ title, sections, breadcrumbLabel }: Props) {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-10 lg:px-8 lg:py-16">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: breadcrumbLabel }]} />
      <h1 className="text-[22px] font-light uppercase tracking-[0.15em] mb-10">{title}</h1>
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.content.map((paragraph, i) => (
                <p key={i} className="text-[13px] text-[#444] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
