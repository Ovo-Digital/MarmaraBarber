"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AccountField, accountInputClass, accountSelectClass } from "@/components/parfois/account/account-field";
import {
  BIRTH_DAYS,
  BIRTH_MONTHS,
  BIRTH_YEARS,
  saveProfileExtra,
} from "@/components/parfois/account/account-utils";
import { apiRegister } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 8) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <AccountField label={label} required>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${accountInputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-black"
          aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          {visible ? (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9.5 3.5 11 8-1 2.4-2.8 4.4-5 5.7M6.7 6.7C4.1 8.2 2.2 10.5 1 13c1.5 4.5 6 8 11 8 1.4 0 2.7-.2 4-.7" />
            </svg>
          ) : (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </AccountField>
  );
}

export function RegisterPageClient() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const cartId = useCartStore((s) => s.cartId);

  const mutation = useMutation({
    mutationFn: () =>
      apiRegister({
        firstName,
        lastName,
        email,
        password,
        phone: phoneDigits ? `+90${phoneDigits}` : undefined,
        cartId,
      }),
    onSuccess: ({ customer }) => {
      if (birthDay || birthMonth || birthYear) {
        saveProfileExtra(customer.id, { birthDay, birthMonth, birthYear });
      }
      setCustomer(customer);
      router.push("/account");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Kayıt başarısız"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (phoneDigits.length < 10) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-[560px] px-4 py-12 lg:py-20">
      <h1 className="mb-10 text-[15px] font-semibold uppercase tracking-[0.04em]">Hesap Oluştur</h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <AccountField label="İsim" required>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="İsim"
            className={accountInputClass}
          />
        </AccountField>

        <AccountField label="Soyad" required>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Soyad"
            className={accountInputClass}
          />
        </AccountField>

        <AccountField label="Doğum Tarihi">
          <div className="grid grid-cols-3 gap-4 border-b border-[#ccc]">
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className={`${accountSelectClass} border-b-0`}
            >
              <option value="">Gün</option>
              {BIRTH_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className={`${accountSelectClass} border-b-0`}
            >
              <option value="">Ay</option>
              {BIRTH_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className={`${accountSelectClass} border-b-0`}
            >
              <option value="">Yıl</option>
              {BIRTH_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </AccountField>

        <AccountField label="E-Posta" required>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            className={accountInputClass}
          />
        </AccountField>

        <AccountField label="Telefon" required>
          <div className="flex items-center gap-2 border-b border-[#ccc]">
            <span className="shrink-0 pb-2 text-[13px]">🇹🇷 +90</span>
            <input
              required
              type="tel"
              inputMode="numeric"
              value={formatPhoneDisplay(phoneDigits)}
              onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="000-000-00-00"
              className={`${accountInputClass} border-b-0`}
            />
          </div>
        </AccountField>

        <PasswordInput
          id="password"
          label="Şifre"
          value={password}
          onChange={setPassword}
          placeholder="Şifre"
        />

        <PasswordInput
          id="confirmPassword"
          label="Şifreyi Onayla"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Şifreyi Onayla"
        />

        {error && <p className="text-[11px] text-red-600">{error}</p>}

        <button type="submit" disabled={mutation.isPending} className="pf-btn-primary mt-4">
          {mutation.isPending ? "Kaydediliyor..." : "Hesap Oluştur"}
        </button>
      </form>

      <p className="mt-8 text-[11px] text-[#666]">
        Zaten üye misiniz?{" "}
        <Link href="/login" className="underline text-black">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
