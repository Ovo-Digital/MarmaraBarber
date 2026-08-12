"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TurkeyAddressFields } from "@/components/parfois/turkey-address-fields";
import {
  EMPTY_TURKEY_ADDRESS,
  isTurkeyAddressComplete,
  shopifyFieldsToTurkeyAddress,
  turkeyAddressToShopifyFields,
  type TurkeyAddressSelection,
} from "@/lib/tr-address";
import {
  apiCreateAddress,
  apiDeleteAddress,
  apiUpdateAddress,
} from "@/services/api/storefront-api";
import type { Customer, CustomerAddress } from "@/types/customer";
import { AccountField, accountInputClass } from "./account-field";

const emptyAddress: Omit<CustomerAddress, "id"> = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "Turkey",
  phone: "",
};

interface AccountAddressesProps {
  customer: Customer;
  onUpdated: () => Promise<void>;
}

function AddressFormModal({
  title,
  initial,
  initialTurkeyAddress,
  customerEmail,
  onClose,
  onSave,
  isPending,
  error,
}: {
  title: string;
  initial: Omit<CustomerAddress, "id">;
  initialTurkeyAddress?: TurkeyAddressSelection;
  customerEmail: string;
  onClose: () => void;
  onSave: (payload: Omit<CustomerAddress, "id">) => void;
  isPending: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState(initial);
  const [turkeyAddress, setTurkeyAddress] = useState(initialTurkeyAddress ?? EMPTY_TURKEY_ADDRESS);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto bg-white p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-[20px] leading-none text-[#666] hover:text-black">
            ×
          </button>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setLocalError(null);
            if (!isTurkeyAddressComplete(turkeyAddress)) {
              setLocalError("Lütfen il, ilçe, mahalle ve açık adresi doldurun.");
              return;
            }
            const mapped = turkeyAddressToShopifyFields(turkeyAddress);
            onSave({
              ...form,
              province: mapped.province,
              city: mapped.city,
              address1: mapped.address1,
              zip: mapped.zip,
            });
          }}
        >
          <AccountField label="Adres Adı" required>
            <input
              required
              value={form.company ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="Ev, İş..."
              className={accountInputClass}
            />
          </AccountField>

          <div className="grid gap-5 sm:grid-cols-2">
            <AccountField label="Ad" required>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={accountInputClass}
              />
            </AccountField>
            <AccountField label="Soyad" required>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={accountInputClass}
              />
            </AccountField>
          </div>

          <AccountField label="E-posta">
            <input readOnly value={customerEmail} className={`${accountInputClass} text-[#666]`} />
          </AccountField>

          <AccountField label="Telefon" required>
            <div className="flex items-end gap-2">
              <span className="pb-2 text-[13px] shrink-0">🇹🇷 +90</span>
              <input
                required
                value={(form.phone ?? "").replace(/^\+90/, "")}
                onChange={(e) => setForm((f) => ({ ...f, phone: `+90${e.target.value.replace(/\D/g, "")}` }))}
                className={accountInputClass}
              />
            </div>
          </AccountField>

          <TurkeyAddressFields value={turkeyAddress} onChange={setTurkeyAddress} />

          {(localError || error) && (
            <p className="text-[11px] text-red-600">{localError ?? error}</p>
          )}

          <button type="submit" disabled={isPending} className="pf-btn-primary w-auto px-8 !text-[10px]">
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AccountAddresses({ customer, onUpdated }: AccountAddressesProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: Omit<CustomerAddress, "id">) => apiCreateAddress(payload),
    onSuccess: async () => {
      setShowAdd(false);
      setFormError(null);
      await onUpdated();
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Adres eklenemedi"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<CustomerAddress, "id"> }) =>
      apiUpdateAddress(id, payload),
    onSuccess: async () => {
      setEditing(null);
      setFormError(null);
      await onUpdated();
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Adres güncellenemedi"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteAddress(id),
    onSuccess: async () => {
      await onUpdated();
    },
  });

  const formatPhone = (phone?: string) => {
    if (!phone) return "—";
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("90")) return `+${digits}`;
    return phone.startsWith("+") ? phone : `+90${digits}`;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e0e0] pb-4">
        <h2 className="text-[15px] font-semibold">Adreslerim</h2>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setShowAdd(true);
          }}
          className="pf-btn-primary w-auto px-5 !py-2.5 !text-[10px] gap-2"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white text-[12px] leading-none">
            +
          </span>
          Yeni Ekle
        </button>
      </div>

      {customer.addresses.length === 0 ? (
        <p className="py-12 text-center text-[12px] text-[#666]">Kayıtlı adresiniz bulunmuyor.</p>
      ) : (
        <div className="hidden border-b border-[#e0e0e0] pb-3 text-[11px] font-semibold text-black sm:grid sm:grid-cols-[1fr_2fr_auto] sm:gap-6">
          <span>Adres Adı</span>
          <span>Adres Açıklamaları</span>
          <span className="sr-only">İşlemler</span>
        </div>
      )}

      <ul>
        {customer.addresses.map((addr) => (
          <li
            key={addr.id}
            className="grid gap-4 border-b border-[#e0e0e0] py-6 text-[12px] sm:grid-cols-[1fr_2fr_auto] sm:items-start sm:gap-6"
          >
            <div>
              <p className="font-semibold text-[13px]">{addr.company || "Adres"}</p>
              <p className="mt-2">
                {addr.firstName} {addr.lastName}
              </p>
              <p className="mt-1 text-[#666]">{customer.email}</p>
            </div>

            <div className="text-[12px] leading-relaxed">
              <p>
                <span className="font-semibold">Telefon Numarası:</span> {formatPhone(addr.phone)}
              </p>
              <p className="mt-2">{addr.address1}</p>
              {addr.address2 && <p>{addr.address2}</p>}
              <p className="mt-1">
                {addr.province}
                {addr.city ? ` ${addr.city}` : ""}
                {addr.zip ? ` ${addr.zip}` : ""}
              </p>
              <p>{addr.country === "Turkey" ? "Türkiye" : addr.country}</p>
              <p className="mt-2">
                <span className="font-semibold">Kurumsal Fatura:</span> Hayır
              </p>
            </div>

            <div className="flex gap-2 sm:flex-col sm:items-end">
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setEditing(addr);
                }}
                className="min-w-[88px] border border-black px-4 py-2 text-[10px] font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
              >
                Düzenle
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(addr.id)}
                className="min-w-[88px] bg-[#999] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-[#777] transition-colors disabled:opacity-50"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showAdd && (
        <AddressFormModal
          title="Yeni Adres Ekle"
          initial={{
            ...emptyAddress,
            firstName: customer.firstName ?? "",
            lastName: customer.lastName ?? "",
            phone: customer.phone ?? "",
          }}
          customerEmail={customer.email}
          onClose={() => setShowAdd(false)}
          onSave={(payload) => createMutation.mutate(payload)}
          isPending={createMutation.isPending}
          error={formError}
        />
      )}

      {editing && (
        <AddressFormModal
          title="Adresi Düzenle"
          initial={{
            firstName: editing.firstName,
            lastName: editing.lastName,
            company: editing.company ?? "",
            address1: editing.address1,
            address2: editing.address2 ?? "",
            city: editing.city,
            province: editing.province ?? "",
            zip: editing.zip,
            country: editing.country,
            phone: editing.phone ?? "",
          }}
          initialTurkeyAddress={shopifyFieldsToTurkeyAddress({
            province: editing.province,
            city: editing.city,
            address1: editing.address1,
            zip: editing.zip,
          })}
          customerEmail={customer.email}
          onClose={() => setEditing(null)}
          onSave={(payload) => updateMutation.mutate({ id: editing.id, payload })}
          isPending={updateMutation.isPending}
          error={formError}
        />
      )}
    </div>
  );
}
