"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AccountField, accountInputClass, accountSelectClass } from "./account-field";
import {
  BIRTH_DAYS,
  BIRTH_MONTHS,
  BIRTH_YEARS,
  loadProfileExtra,
  saveProfileExtra,
  type ProfileExtra,
} from "./account-utils";
import { apiUpdateCustomer } from "@/services/api/storefront-api";
import type { Customer } from "@/types/customer";

interface AccountPersonalInfoProps {
  customer: Customer;
  onUpdated: () => Promise<void>;
}

export function AccountPersonalInfo({ customer, onUpdated }: AccountPersonalInfoProps) {
  const [firstName, setFirstName] = useState(customer.firstName ?? "");
  const [lastName, setLastName] = useState(customer.lastName ?? "");
  const [email] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [extra, setExtra] = useState<ProfileExtra>({});
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(customer.firstName ?? "");
    setLastName(customer.lastName ?? "");
    setPhone(customer.phone ?? "");
    setExtra(loadProfileExtra(customer.id));
  }, [customer]);

  const updateMutation = useMutation({
    mutationFn: (payload: { firstName?: string; lastName?: string; phone?: string }) =>
      apiUpdateCustomer(payload),
    onSuccess: async () => {
      setMessage("Your details have been updated.");
      setError(null);
      await onUpdated();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Update failed"),
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileExtra(customer.id, extra);
    updateMutation.mutate({ firstName, lastName });
  };

  const handleSavePhone = () => {
    updateMutation.mutate(
      { phone },
      {
        onSuccess: () => {
          setPhoneEditing(false);
          setMessage("Your phone number has been updated.");
        },
      }
    );
  };

  const displayPhone = phone.replace(/^\+90/, "").replace(/\s/g, "");

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveProfile} className="border border-[#e0e0e0] p-6 sm:p-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] mb-8">
          Personal details
        </h2>

        <div className="grid gap-8 sm:grid-cols-2">
          <AccountField label="First name" required>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={accountInputClass}
            />
          </AccountField>
          <AccountField label="Last name" required>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={accountInputClass}
            />
          </AccountField>
        </div>

        <div className="mt-8">
          <AccountField label="Email" required>
            <input type="email" readOnly value={email} className={`${accountInputClass} text-[#666]`} />
          </AccountField>
        </div>

        <div className="mt-8">
          <AccountField label="Date of birth" required>
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <select
                  required
                  value={extra.birthDay ?? ""}
                  onChange={(e) => setExtra((x) => ({ ...x, birthDay: e.target.value }))}
                  className={accountSelectClass}
                >
                  <option value="">Day</option>
                  {BIRTH_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  required
                  value={extra.birthMonth ?? ""}
                  onChange={(e) => setExtra((x) => ({ ...x, birthMonth: e.target.value }))}
                  className={accountSelectClass}
                >
                  <option value="">Month</option>
                  {BIRTH_MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  required
                  value={extra.birthYear ?? ""}
                  onChange={(e) => setExtra((x) => ({ ...x, birthYear: e.target.value }))}
                  className={accountSelectClass}
                >
                  <option value="">Year</option>
                  {BIRTH_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </AccountField>
        </div>

        <div className="mt-8">
          <p className="text-[11px] text-[#666] mb-3">Gender</p>
          <div className="flex flex-wrap gap-6 text-[13px]">
            {(
              [
                ["male", "Male"],
                ["female", "Female"],
                ["unspecified", "Prefer not to say"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={(extra.gender ?? "unspecified") === value}
                  onChange={() => setExtra((x) => ({ ...x, gender: value }))}
                  className="h-3.5 w-3.5 accent-black"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="pf-btn-primary mt-8 w-auto px-8 !text-[10px]"
        >
          {updateMutation.isPending ? "Saving…" : "Save"}
        </button>
      </form>

      <div className="border border-[#e0e0e0] p-6 sm:p-8">
        <h2 className="text-[13px] font-semibold mb-8">Contact details</h2>

        <AccountField label="Telefon" required>
          {phoneEditing ? (
            <div className="flex items-end gap-2">
              <span className="pb-2 text-[13px] shrink-0">🇹🇷 +90</span>
              <input
                value={displayPhone}
                onChange={(e) => setPhone(`+90${e.target.value.replace(/\D/g, "")}`)}
                className={accountInputClass}
                placeholder="5XX XXX XX XX"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 border-b border-[#ccc] py-2 text-[13px]">
              <span>🇹🇷</span>
              <span>+90</span>
              <span>{displayPhone || "—"}</span>
            </div>
          )}
        </AccountField>

        {phoneEditing ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSavePhone}
              disabled={updateMutation.isPending}
              className="pf-btn-primary w-auto px-6 !text-[10px]"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoneEditing(false);
                setPhone(customer.phone ?? "");
              }}
              className="pf-btn-outline-dark px-6 !text-[10px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPhoneEditing(true)}
            className="pf-btn-primary mt-6 w-auto px-6 !text-[10px] gap-2"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Change phone number
          </button>
        )}
      </div>

      {message && <p className="text-[11px] text-[#2e7d32]">{message}</p>}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
