import Link from "next/link";
import type { LegalSection } from "@/lib/legal-content";

type Props = {
  title: string;
  sections: LegalSection[];
  breadcrumbLabel: string;
  children?: React.ReactNode;
};

export function LegalPageLayout({ title, sections, breadcrumbLabel, children }: Props) {
  return (
    <div className="bg-white">
      <div className="sg-container max-w-3xl py-10 md:py-14">
        <nav className="mb-8 truncate text-[12px] text-[#666]">
          <Link href="/" className="hover:text-black">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{breadcrumbLabel}</span>
        </nav>

        <h1 className="sg-heading text-[clamp(1.75rem,1.2rem+2vw,2.5rem)]">{title}</h1>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="sg-nav-bold mb-4 text-[12px]">{section.title}</h2>
              <div className="space-y-3">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="sg-body text-[14px] text-[#444]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {children ? <div className="mt-12 border-t border-black/10 pt-10">{children}</div> : null}
      </div>
    </div>
  );
}
