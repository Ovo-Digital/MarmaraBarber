import { RegisterPageClient } from "@/components/parfois/register-page";
import { T } from "@/lib/i18n/dil";
import { KoyuUst } from "@/components/slick/koyu-ust";

export default function RegisterPage() {
  return (
    <div data-dark-top className="relative overflow-hidden" style={{ background: "var(--lx-ink)" }}>
      {/* Üstü koyu: başlık şeffaf durup bandın üzerinde yüzsün */}
      <KoyuUst />
      <div aria-hidden="true" className="lx-kirmizi-isik" />
      <div
        className="sg-container relative"
        style={{ paddingTop: "clamp(120px, 14vh, 180px)", paddingBottom: "clamp(72px, 8vw, 130px)" }}
      >
        <div className="lx-cam-panel mx-auto w-full max-w-[620px] p-7 sm:p-10">
          <div className="mb-10 text-center">
            <p className="lx-eyebrow mb-3"><T k="Account" /></p>
            <h1
              className="uppercase"
              style={{
                fontFamily: "var(--font-owners-black)",
                fontWeight: 900,
                fontSize: "clamp(30px, 3.4vw, 44px)",
                lineHeight: 1.02,
                color: "#fff",
              }}
            >
              <T k="Create account" />
            </h1>
            <p className="mt-3 text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              <T k="Save your details, track orders, check out faster." />
            </p>
          </div>
          <RegisterPageClient />
        </div>
      </div>
    </div>
  );
}
