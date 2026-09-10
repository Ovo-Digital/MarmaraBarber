/**
 * Sayfa açılırken görünen marka ekranı.
 *
 * Önceden gri kutulardan oluşan bir iskelet vardı; sayfa geçişlerinde araya
 * girip yabancı duruyordu. Yerine koyu zeminde marka logosu ve ince bir
 * kırmızı çubuk kondu — geçiş perdesiyle aynı dilde.
 *
 * Sadece CSS: JavaScript beklemeden, sayfanın ilk boyanmasında çalışıyor.
 */
export default function Loading() {
  return (
    <div
      className="flex w-full items-center justify-center"
      style={{ background: "var(--lx-ink)", minHeight: "70vh" }}
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/marmara-logo.png"
          alt=""
          aria-hidden="true"
          className="lx-yukleniyor-logo w-[150px] max-w-[52vw] sm:w-[190px]"
        />
        <span className="lx-yukleniyor-cubuk mt-8" aria-hidden="true" />
      </div>
    </div>
  );
}
