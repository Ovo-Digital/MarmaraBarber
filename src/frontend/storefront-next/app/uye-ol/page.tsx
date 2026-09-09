import { RegisterPageClient } from "@/components/parfois/register-page";

export default function RegisterPage() {
  return (
    <div className="bg-white">
      <div
        className="sg-container"
        style={{ paddingTop: "clamp(56px, 6vw, 96px)", paddingBottom: "clamp(64px, 7vw, 120px)" }}
      >
        {/* Başlık formun üstünde; ayrı koyu bant kaldırıldı */}
        <div className="mx-auto mb-10 w-full max-w-[560px] text-center">
          <p className="lx-eyebrow mb-3">Account</p>
          <h1
            className="uppercase"
            style={{
              fontFamily: "var(--font-owners-black)",
              fontWeight: 900,
              fontSize: "clamp(30px, 3.4vw, 44px)",
              lineHeight: 1.02,
              color: "var(--lx-ink)",
            }}
          >
            Create account
          </h1>
          <p className="mt-3 text-[14px]" style={{ color: "rgba(20,17,15,0.55)" }}>
            Save your details, track orders, check out faster.
          </p>
        </div>
        <RegisterPageClient />
      </div>
    </div>
  );
}
