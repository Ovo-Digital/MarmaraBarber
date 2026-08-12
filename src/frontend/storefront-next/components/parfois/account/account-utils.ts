import { formatPrice } from "@/lib/parfois-theme";

export type AccountSection = "profile" | "addresses" | "orders" | "returns" | "password";

export const ACCOUNT_SECTIONS: { id: AccountSection; label: string; href?: string }[] = [
  { id: "profile", label: "Kişisel Bilgilerim" },
  { id: "addresses", label: "Adreslerim" },
  { id: "orders", label: "Siparişlerim" },
  { id: "returns", label: "İadeler", href: "/iade-ve-degisim" },
  { id: "password", label: "Şifre Değiştir" },
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
  { value: "1", label: "Ocak" },
  { value: "2", label: "Şubat" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Nisan" },
  { value: "5", label: "Mayıs" },
  { value: "6", label: "Haziran" },
  { value: "7", label: "Temmuz" },
  { value: "8", label: "Ağustos" },
  { value: "9", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
];
export const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
