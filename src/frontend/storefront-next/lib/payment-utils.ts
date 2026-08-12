import type { CardBrand, InstallmentOption } from "@/types/payment";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(number: string): CardBrand {
  const n = onlyDigits(number);
  if (/^3[47]/.test(n)) return "amex";
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(n)) return "mastercard";
  if (/^9792|^650/.test(n)) return "troy";
  return "unknown";
}

export function brandLabel(brand: CardBrand): string {
  switch (brand) {
    case "visa":
      return "VISA";
    case "mastercard":
      return "Mastercard";
    case "troy":
      return "TROY";
    case "amex":
      return "AMEX";
    case "unknown":
      return "";
    default: {
      const _exhaustive: never = brand;
      return _exhaustive;
    }
  }
}

/**
 * Mock taksit — ileride iyzico Installment & BIN API ile değiştirilecek.
 * @see https://docs.iyzico.com/ek-servisler/taksit-ve-bin-sorgulama
 */
export function getMockInstallments(cardNumber: string, amount: number): InstallmentOption[] {
  const bin = onlyDigits(cardNumber).slice(0, 6);
  const brand = detectCardBrand(cardNumber);

  const peşin: InstallmentOption = {
    count: 1,
    label: "Tek Çekim",
    monthlyAmount: amount,
    totalAmount: amount,
    interestRate: 0,
  };

  // BIN yoksa veya debit benzeri kısa numara → sadece peşin
  if (bin.length < 6) return [peşin];

  // Debit / banka kartı mock: peşin only (test debit BIN'leri)
  const debitBins = ["589004", "476662", "498749", "517041", "447505", "405903", "589283", "491005", "516888"];
  if (debitBins.includes(bin) || brand === "unknown") {
    return [peşin];
  }

  const counts = [2, 3, 6, 9, 12];
  const rates: Record<number, number> = {
    2: 0,
    3: 0,
    6: 1.89,
    9: 2.49,
    12: 2.99,
  };

  return [
    peşin,
    ...counts.map((count) => {
      const rate = rates[count] ?? 0;
      const total = rate === 0 ? amount : amount * (1 + (rate / 100) * (count / 3));
      return {
        count,
        label: `${count} Taksit${rate === 0 ? " (Faizsiz)" : ""}`,
        monthlyAmount: total / count,
        totalAmount: total,
        interestRate: rate,
      } satisfies InstallmentOption;
    }),
  ];
}

export function isValidCardForm(number: string, name: string, expiry: string, cvc: string): boolean {
  const digits = onlyDigits(number);
  const exp = onlyDigits(expiry);
  const cvcDigits = onlyDigits(cvc);
  return (
    digits.length >= 15 &&
    name.trim().length >= 3 &&
    exp.length === 4 &&
    cvcDigits.length >= 3
  );
}
