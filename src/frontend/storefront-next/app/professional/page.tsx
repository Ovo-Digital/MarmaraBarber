import type { Metadata } from "next";
import { ApplicationForm } from "@/components/slick/application-form";
import { PageHero } from "@/components/slick/page-hero";

export const metadata: Metadata = {
  title: "Barber & professional registration",
  description:
    "Working behind the chair? Register as a Marmara Barber professional for trade access, education and support.",
};

const KUTULAR = [
  { baslik: "Trade access", metin: "Professional pricing and priority on new releases." },
  { baslik: "Education", metin: "Product training and technique support from our team." },
  { baslik: "Support", metin: "A direct contact for stock, display and campaign questions." },
];

export default function ProfessionalPage() {
  return (
    <>
      <PageHero
        eyebrow="For professionals"
        title="Barber registration"
        subline="Working behind the chair? Register with us for trade access, education and product support."
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

          <ApplicationForm type="barber" />
        </div>
      </div>
    </>
  );
}
