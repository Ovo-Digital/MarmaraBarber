"use client";

/**
 * Üye ol ekranının gövdesi — müşteri formu ile berber başvurusu arasında
 * AYNI SAYFADA geçiş yapıyor.
 *
 * Önceden "Berberim" kartı /berber sayfasına atıyordu: adam üye olmaya
 * gelmişken 5000 piksellik tanıtım sayfasının ortasına düşüyordu. Artık
 * kart formu yerinde değiştiriyor.
 *
 * Seçim adres çubuğuna ?tur=berber olarak yazılıyor (geçmişe yeni kayıt
 * eklemeden) ki bağlantı paylaşılabilsin ve geri tuşu sayfadan atmasın.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ApplicationForm } from "@/components/slick/application-form";
import { RegisterPageClient } from "@/components/parfois/register-page";
import { UyelikSecim } from "@/components/slick/uyelik-secim";
import { T, useT } from "@/lib/i18n/dil";

type Yol = "musteri" | "berber";

export function UyelikIcerik() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [yol, setYol] = useState<Yol>(params.get("tur") === "berber" ? "berber" : "musteri");

  const sec = useCallback(
    (yeni: Yol) => {
      setYol(yeni);
      router.replace(yeni === "berber" ? "/uye-ol?tur=berber" : "/uye-ol", { scroll: false });
    },
    [router],
  );

  return (
    <>
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
          {yol === "berber" ? t("Barber account") : t("Create account")}
        </h1>
        <p className="mt-3 text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
          {yol === "berber"
            ? t("Tell us about your shop and verify it once — then barber pricing is on every order.")
            : t("Save your details, track orders, check out faster.")}
        </p>
      </div>

      <div className="mb-10">
        <UyelikSecim aktif={yol} onSec={sec} />
      </div>

      {yol === "berber" ? <ApplicationForm type="barber" koyu /> : <RegisterPageClient />}
    </>
  );
}
