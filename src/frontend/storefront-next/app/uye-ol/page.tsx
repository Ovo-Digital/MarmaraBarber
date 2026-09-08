import { PageHero } from "@/components/slick/page-hero";
import { RegisterPageClient } from "@/components/parfois/register-page";

export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Create account"
        subline="Save your details, track orders, check out faster."
      />
      <div className="bg-white">
        <div
          className="sg-container"
          style={{ paddingTop: "clamp(48px, 5vw, 80px)", paddingBottom: "clamp(64px, 7vw, 120px)" }}
        >
          <RegisterPageClient />
        </div>
      </div>
    </>
  );
}
