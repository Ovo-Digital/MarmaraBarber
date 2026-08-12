export type CardBrand = "visa" | "mastercard" | "troy" | "amex" | "unknown";

export interface InstallmentOption {
  count: number;
  label: string;
  monthlyAmount: number;
  totalAmount: number;
  /** Aylık faiz oranı (mock) — 0 = peşin / faizsiz */
  interestRate: number;
}

export interface CheckoutAddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

export interface CardFormState {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused: "number" | "name" | "expiry" | "cvc" | null;
}

export const EMPTY_ADDRESS: CheckoutAddressForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "Turkey",
};

export const EMPTY_CARD: CardFormState = {
  number: "",
  name: "",
  expiry: "",
  cvc: "",
  focused: null,
};

/** iyzico sandbox test kartları — https://docs.iyzico.com/ek-bilgiler/test-kartlari */
export const IYZICO_TEST_CARDS = [
  { number: "5526080000000006", bank: "Akbank", brand: "mastercard" as const, type: "Kredi" },
  { number: "5400360000000003", bank: "Garanti", brand: "mastercard" as const, type: "Kredi" },
  { number: "4543590000000006", bank: "İş Bankası", brand: "visa" as const, type: "Kredi" },
  { number: "5451030000000000", bank: "Yapı Kredi", brand: "mastercard" as const, type: "Kredi" },
  { number: "4157920000000002", bank: "Vakıfbank", brand: "visa" as const, type: "Kredi" },
  { number: "9792030000000000", bank: "QNB", brand: "troy" as const, type: "Kredi" },
] as const;
