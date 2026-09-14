"use client";

import { useDil, useT } from "@/lib/i18n/dil";

/** Hukuki sayfalarda: İngilizce dışındaki dillerde metnin İngilizce olduğunu söyler */
export function HukukiNot() {
  const [dil] = useDil();
  const t = useT();
  if (dil === "en") return null;
  return (
    <p className="mt-6 px-4 py-3 text-[13px]" style={{ border: "1px solid rgba(20,17,15,0.15)", color: "rgba(20,17,15,0.7)" }}>
      {t("This document is available in English only.")}
    </p>
  );
}
