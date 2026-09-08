import { formatPrice } from "@/lib/parfois-theme";

export type AccountSection = "profile" | "addresses" | "orders" | "returns" | "password";

export const ACCOUNT_SECTIONS: { id: AccountSection; label: string; href?: string }[] = [
  { id: "profile", label: "Personal details" },
  { id: "addresses", label: "Addresses" },
  { id: "orders", label: "Orders" },
  { id: "returns", label: "Returns", href: "/iade-ve-degisim" },
  { id: "password", label: "Password" },
];

export function parseAccountSection(value: string | null): AccountSection {
  if (value === "addresses" || value === "orders" || value === "returns" || value === "password") {
    return value;
  }
  return "profile";
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOrderStatus(financialStatus: string, fulfillmentStatus: string): string {
  const financial = financialStatus.toUpperCase();
  if (financial === "VOIDED" || financial === "REFUNDED" || financial === "PARTIALLY_REFUNDED") {
    return "İptal";
  }
  if (fulfillmentStatus === "FULFILLED" || financial === "PAID") {
    return "Tamamlandı";
  }
  if (financial === "PENDING" || fulfillmentStatus === "UNFULFILLED") {
    return "Beklemede";
  }
  return "İşleniyor";
}

export function formatOrderNumber(orderNumber: number): string {
  return `PRF-${orderNumber}`;
}

export function formatOrderTotal(amount: number, currencyCode: string): string {
  return formatPrice(amount, currencyCode);
}

export interface ProfileExtra {
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  gender?: "male" | "female" | "unspecified";
}

const PROFILE_EXTRA_PREFIX = "pf_profile_extra_";

export function loadProfileExtra(customerId: string): ProfileExtra {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${PROFILE_EXTRA_PREFIX}${customerId}`);
    return raw ? (JSON.parse(raw) as ProfileExtra) : {};
  } catch {
    return {};
  }
}

export function saveProfileExtra(customerId: string, extra: ProfileExtra): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PROFILE_EXTRA_PREFIX}${customerId}`, JSON.stringify(extra));
}

export const BIRTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
export const BIRTH_MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
export const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
