import type { Metadata } from "next";
import { ApplicationForm } from "@/components/slick/application-form";
import { PageHero } from "@/components/slick/page-hero";

export const metadata: Metadata = {
  title: "Ambassador programme",
  description:
    "Barbers, educators and creators — apply to represent Marmara Barber and work with us on content and events.",
};

const KUTULAR = [
  { baslik: "Product support", metin: "The range to work with, restocked as you need it." },
  { baslik: "Content", metin: "We share your work across our channels and campaigns." },
  { baslik: "Events", metin: "Shows, education days and demos alongside our team." },
];

export default function AmbassadorPage() {
  return (
    <>
      <PageHero
        eyebrow="Ambassadors"
        title="Work with us"
        subline="Barbers, educators and creators — tell us what you do and we'll take it from there."
      />

      <div className="bg-white">
        <div
          className="sg-container"
          style={{ paddingTop: "clamp(48px,5vw,80px)", paddingBottom: "clamp(64px,7vw,110px)" }}
        >
          <div className="mx-auto mb-12 grid max-w-[860px] gap-8 sm:grid-cols-3">
            {KUTULAR.map((k) => (
              <div key={k.baslik} style={{ borderTop: "2px solid var(--sg-red)" }} className="pt-4">
                <p
                  className="uppercase"
                  style={{ fontFamily: "var(--font-owners-black)", fontSize: "15px", color: "var(--lx-ink)" }}
                >
                  {k.baslik}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "rgba(20,17,15,0.6)" }}>
                  {k.metin}
                </p>
              </div>
            ))}
          </div>

          <ApplicationForm type="ambassador" />
        </div>
      </div>
    </>
  );
}
