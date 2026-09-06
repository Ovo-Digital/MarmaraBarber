/**
 * Kayan yazı bandı — iki koyu bölümün arasındaki beyaz boşluğun yerine.
 *
 * Boş beyaz alan "sayfa bitti" gibi duruyordu; buradaki hareket araya nefes
 * koyarken sayfayı da canlı tutuyor.
 *
 * İçerik prop: yalnızca markanın gerçekten arkasında durduğu ifadeler.
 * Animasyon saf CSS — kayarken JavaScript çalışmıyor, sayfayı yormuyor.
 */
export function MarqueeBand({
  items = [
    "Since 1970",
    "Barber grade",
    "Made in Türkiye",
    "Cologne",
    "Wax",
    "Aftershave",
    "Skin care",
    "Beard care",
  ],
  durationSec = 38,
}: {
  items?: string[];
  durationSec?: number;
}) {
  if (!items.length) return null;

  // Aynı dizi iki kez yazılıyor: birincisi ekrandan çıkarken ikincisi
  // yerine geçiyor, böylece dönüş noktasında boşluk oluşmuyor.
  const sira = [...items, ...items];

  return (
    <section
      aria-hidden="true"
      className="w-full overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(14px, 1.4vw, 22px)",
        paddingBottom: "clamp(14px, 1.4vw, 22px)",
        borderTop: "1px solid rgba(20,17,15,0.10)",
        borderBottom: "1px solid rgba(20,17,15,0.10)",
      }}
    >
      <div className="lx-marquee" style={{ ["--lx-marquee-dur" as string]: `${durationSec}s` }}>
        <div className="lx-marquee-track">
          {sira.map((item, i) => (
            <span key={`${item}-${i}`} className="lx-marquee-item">
              <span
                className="uppercase"
                style={{
                  fontFamily: "var(--font-owners-black)",
                  fontWeight: 900,
                  fontSize: "clamp(13px, 1.35vw, 20px)",
                  lineHeight: 1.1,
                  color: "var(--lx-ink)",
                  letterSpacing: "0.02em",
                }}
              >
                {item}
              </span>
              <span
                aria-hidden="true"
                className="lx-marquee-dot"
                style={{ background: "var(--sg-red)" }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
