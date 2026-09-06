/**
 * Para biçimlendirme — birim Shopify'dan gelir, kodda sabit değildir.
 * Böylece mağaza TRY, USD ya da EUR ile çalışsa da doğru gösterilir.
 */
export function formatMoney(amount: number, currencyCode = "USD", locale?: string): string {
  const dil = locale ?? (currencyCode === "TRY" ? "tr-TR" : "en-US");
  try {
    return new Intl.NumberFormat(dil, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    // Geçersiz para birimi kodu gelirse sayıyı ham göster, sayfa çökmesin
    return `${amount} ${currencyCode}`;
  }
}
