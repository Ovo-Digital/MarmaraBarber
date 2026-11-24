import { Suspense } from "react";
import { KoyuUst } from "@/components/slick/koyu-ust";
import { UyelikIcerik } from "@/components/slick/uyelik-icerik";

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
          {/* useSearchParams Suspense istiyor: ?tur=berber ile gelen bağlantı
              doğrudan berber formunu açsın diye adresten okuyoruz. */}
          <Suspense fallback={null}>
            <UyelikIcerik />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
