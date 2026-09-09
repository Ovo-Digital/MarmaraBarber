import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationForm } from "@/components/slick/application-form";
import { PageHero } from "@/components/slick/page-hero";

export const metadata: Metadata = {
  title: "Wholesale & distribution",
  description:
    "Stock Marmara Barber, or distribute the range in your market. Send us your details and we will come back to you.",
};

const KUTULAR = [
  { baslik: "Since 1970", metin: "A barber brand with its own production, exporting to 54 countries." },
  { baslik: "Full range", metin: "Cologne, styling, skin and beard care, accessories — one supplier." },
  { baslik: "Own production", metin: "Manufactured in our own facilities to GMP standards." },
];

export default function WholesalePage() {
  return (
    <>
      <PageHero
        eyebrow="Wholesale"
        title="Stock Marmara Barber"
        subline="Retailers, distributors and barbershop chains — tell us about your business and we'll come back to you."
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

          <ApplicationForm type="wholesale" />

          <p className="mt-10 text-center text-[13px]" style={{ color: "rgba(20,17,15,0.55)" }}>
            Working behind the chair rather than buying to resell?{" "}
            <Link href="/professional" style={{ color: "var(--sg-red)" }}>
              Register as a barber
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
