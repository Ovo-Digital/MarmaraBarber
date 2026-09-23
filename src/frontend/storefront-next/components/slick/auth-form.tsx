"use client";

/**
 * Giriş / üyelik formlarının ortak parçaları.
 *
 * Etiket küçük ve harf aralıklı, alan alt çizgili, odaklanınca çizgi kırmızıya
 * dönüyor — sitenin geri kalanıyla aynı dil. Sınıflar tek yerde tutuluyor ki
 * hesap sayfasındaki formlar da aynı görünsün.
 */

export const lxAlan =
  "w-full border-0 border-b bg-transparent py-2.5 text-[14px] outline-none placeholder:text-[rgba(20,17,15,0.35)]";

export const lxAlanStil: React.CSSProperties = {
  borderColor: "rgba(20,17,15,0.25)",
  color: "var(--lx-ink)",
};

/**
 * Koyu zemindeki formlar (ör. /wholesale ortak portalı).
 * Renkler ve odak çizgisi CSS'te: .lx-alan-koyu
 */
export const lxAlanKoyu = "lx-alan-koyu w-full border-0 bg-transparent py-3 text-[15px] outline-none";

export function LxEtiket({
  htmlFor,
  children,
  zorunlu,
  koyu = false,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  zorunlu?: boolean;
  koyu?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[11px] uppercase tracking-[0.14em]"
      style={{ color: koyu ? "rgba(255,255,255,0.5)" : "rgba(20,17,15,0.55)", fontFamily: "var(--font-owners)" }}
    >
      {children}
      {zorunlu ? <span style={{ color: "var(--sg-red)" }}> *</span> : null}
    </label>
  );
}

/** Form hatası — kırmızı, ince çerçeveli */
export function LxHata({ mesaj, koyu = false }: { mesaj: string; koyu?: boolean }) {
  return (
    <p
      role="alert"
      className="px-3 py-2.5 text-[13px]"
      style={{
        border: "1px solid var(--sg-red)",
        color: koyu ? "#fff" : "var(--sg-red)",
        background: koyu ? "rgba(225,6,0,0.12)" : "transparent",
      }}
    >
      {mesaj}
    </p>
  );
}
