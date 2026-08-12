"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "@/components/parfois/breadcrumb";
import { CreditCardVisual } from "@/components/checkout/credit-card-visual";
import { formatPrice } from "@/lib/parfois-theme";
import {
  formatCardNumber,
  formatExpiry,
  getMockInstallments,
  isValidCardForm,
  onlyDigits,
} from "@/lib/payment-utils";
import { getCart } from "@/services/shopify/commerce-api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { TurkeyAddressFields } from "@/components/parfois/turkey-address-fields";
import {
  EMPTY_TURKEY_ADDRESS,
  isTurkeyAddressComplete,
  shopifyFieldsToTurkeyAddress,
  turkeyAddressToShopifyFields,
} from "@/lib/tr-address";
import {
  EMPTY_ADDRESS,
  EMPTY_CARD,
  IYZICO_TEST_CARDS,
  type CardFormState,
  type CheckoutAddressForm,
} from "@/types/payment";

type Step = "address" | "payment";

export function CheckoutPageClient() {
  const router = useRouter();
  const { cartId, cart, setCart, clearCart } = useCartStore();
  const customer = useAuthStore((s) => s.customer);
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<CheckoutAddressForm>(EMPTY_ADDRESS);
  const [turkeyAddress, setTurkeyAddress] = useState(EMPTY_TURKEY_ADDRESS);
  const [card, setCard] = useState<CardFormState>(EMPTY_CARD);
  const [installment, setInstallment] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => getCart(cartId!),
    enabled: !!cartId,
    retry: false,
  });

  useEffect(() => {
    if (data) setCart(data);
  }, [data, setCart]);

  useEffect(() => {
    if (isError) clearCart();
  }, [isError, clearCart]);

  useEffect(() => {
    if (!customer) return;
    setAddress((prev) => ({
      ...prev,
      firstName: prev.firstName || customer.firstName || "",
      lastName: prev.lastName || customer.lastName || "",
      email: prev.email || customer.email || "",
      phone: prev.phone || customer.phone || "",
      ...(customer.defaultAddress
        ? {
            address1: prev.address1 || customer.defaultAddress.address1,
            address2: prev.address2 || customer.defaultAddress.address2 || "",
            city: prev.city || customer.defaultAddress.city,
            province: prev.province || customer.defaultAddress.province || "",
            zip: prev.zip || customer.defaultAddress.zip,
            country: prev.country || customer.defaultAddress.country || "Turkey",
          }
        : {}),
    }));
    if (customer.defaultAddress) {
      setTurkeyAddress(
        shopifyFieldsToTurkeyAddress({
          province: customer.defaultAddress.province,
          city: customer.defaultAddress.city,
          address1: customer.defaultAddress.address1,
          zip: customer.defaultAddress.zip,
        }),
      );
    }
  }, [customer]);

  useEffect(() => {
    const mapped = turkeyAddressToShopifyFields(turkeyAddress);
    setAddress((prev) => ({
      ...prev,
      province: mapped.province,
      city: mapped.city,
      address1: mapped.address1,
      zip: mapped.zip,
    }));
  }, [turkeyAddress]);

  const activeCart = data ?? cart;

  const installments = useMemo(
    () => getMockInstallments(card.number, activeCart?.totalAmount ?? 0),
    [card.number, activeCart?.totalAmount]
  );

  useEffect(() => {
    if (!installments.some((i) => i.count === installment)) {
      setInstallment(1);
    }
  }, [installments, installment]);

  const selectedInstallment = installments.find((i) => i.count === installment) ?? installments[0];

  const addressValid =
    address.firstName.trim() &&
    address.lastName.trim() &&
    address.email.includes("@") &&
    address.phone.trim().length >= 10 &&
    isTurkeyAddressComplete(turkeyAddress);

  const cardValid = isValidCardForm(card.number, card.name, card.expiry, card.cvc);

  const fillTestCard = (number: string) => {
    setCard((c) => ({
      ...c,
      number: formatCardNumber(number),
      name: c.name || "TEST KULLANICI",
      expiry: c.expiry || "12/30",
      cvc: c.cvc || "123",
    }));
  };

  const handlePay = async () => {
    setError(null);
    if (!cardValid || !addressValid || !activeCart) {
      setError("Lütfen tüm alanları kontrol edin.");
      return;
    }
    setSubmitting(true);
    // Sandbox UI adımı: gerçek iyzico çağrısı sonraki sprintte
    await new Promise((r) => setTimeout(r, 1200));
    const orderRef = `DOM-${Date.now().toString(36).toUpperCase()}`;
    sessionStorage.setItem(
      "ovo_last_order",
      JSON.stringify({
        orderRef,
        total: selectedInstallment.totalAmount,
        installment: selectedInstallment.count,
        currency: activeCart.currencyCode,
        email: address.email,
        mock: true,
      })
    );
    clearCart();
    router.push(`/siparis-basarili?ref=${orderRef}`);
  };

  if (!cartId && !activeCart) {
    return (
      <EmptyCheckout
        title="Sepetiniz Boş"
        message="Ödeme yapmak için sepetinize ürün ekleyin."
        href="/products"
        cta="Alışverişe Başla"
      />
    );
  }

  if (isLoading && !activeCart) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center animate-pulse">
        <div className="mx-auto mb-4 h-6 w-40 bg-[#e5e5e5]" />
        <div className="mx-auto h-4 w-64 bg-[#e5e5e5]" />
      </div>
    );
  }

  if (!activeCart || activeCart.lines.length === 0) {
    return <EmptyCheckout title="Sepetiniz Boş" href="/cart" cta="Sepete dön" />;
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 lg:px-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Sepet", href: "/cart" },
          { label: "Ödeme" },
        ]}
      />
      <h1 className="mb-2 text-[20px] font-light uppercase tracking-[0.15em]">Ödeme</h1>
      <p className="mb-8 text-[12px] text-[#666]">
        Güvenli ödeme — iyzico sandbox (mock). Kart bilgileri henüz sunucuya gönderilmez.
      </p>

      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em]">
        <button
          type="button"
          onClick={() => setStep("address")}
          className={step === "address" ? "font-semibold" : "text-[#999]"}
        >
          1. Teslimat
        </button>
        <span className="text-[#ccc]">/</span>
        <button
          type="button"
          onClick={() => addressValid && setStep("payment")}
          className={step === "payment" ? "font-semibold" : "text-[#999]"}
        >
          2. Kart & Taksit
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {step === "address" ? (
            <section className="border border-[#e5e5e5] p-6">
              <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em]">
                Teslimat Bilgileri
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["firstName", "Ad", "text"],
                    ["lastName", "Soyad", "text"],
                    ["email", "E-posta", "email"],
                    ["phone", "Telefon", "tel"],
                  ] as const
                ).map(([key, label, type]) => (
                  <input
                    key={key}
                    type={type}
                    required
                    value={address[key]}
                    onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                    placeholder={label}
                    className="border border-[#e5e5e5] px-3 py-3 text-[12px] outline-none focus:border-black"
                  />
                ))}
                <div className="sm:col-span-2">
                  <TurkeyAddressFields value={turkeyAddress} onChange={setTurkeyAddress} />
                </div>
                <input
                  type="text"
                  value={address.address2}
                  onChange={(e) => setAddress((a) => ({ ...a, address2: e.target.value }))}
                  placeholder="Adres tarifi (opsiyonel)"
                  className="border border-[#e5e5e5] px-3 py-3 text-[12px] outline-none focus:border-black sm:col-span-2"
                />
              </div>
              <button
                type="button"
                disabled={!addressValid}
                onClick={() => setStep("payment")}
                className="pf-btn-primary mt-6 max-w-xs"
              >
                Ödemeye Geç
              </button>
            </section>
          ) : (
            <section className="space-y-8">
              <div className="border border-[#e5e5e5] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]">Kart Bilgileri</h2>
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    className="text-[10px] uppercase tracking-wider text-[#666] underline"
                  >
                    Adresi Düzenle
                  </button>
                </div>

                <CreditCardVisual card={card} />

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <input
                    className="border border-[#e5e5e5] px-3 py-3 font-mono text-[13px] outline-none focus:border-black sm:col-span-2"
                    placeholder="Kart Numarası"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onFocus={() => setCard((c) => ({ ...c, focused: "number" }))}
                    onBlur={() => setCard((c) => ({ ...c, focused: null }))}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))
                    }
                  />
                  <input
                    className="border border-[#e5e5e5] px-3 py-3 text-[12px] uppercase outline-none focus:border-black sm:col-span-2"
                    placeholder="Kart Üzerindeki İsim"
                    autoComplete="cc-name"
                    value={card.name}
                    onFocus={() => setCard((c) => ({ ...c, focused: "name" }))}
                    onBlur={() => setCard((c) => ({ ...c, focused: null }))}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                  />
                  <input
                    className="border border-[#e5e5e5] px-3 py-3 font-mono text-[13px] outline-none focus:border-black"
                    placeholder="AA/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={card.expiry}
                    onFocus={() => setCard((c) => ({ ...c, focused: "expiry" }))}
                    onBlur={() => setCard((c) => ({ ...c, focused: null }))}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))
                    }
                  />
                  <input
                    className="border border-[#e5e5e5] px-3 py-3 font-mono text-[13px] outline-none focus:border-black"
                    placeholder="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={card.cvc}
                    onFocus={() => setCard((c) => ({ ...c, focused: "cvc" }))}
                    onBlur={() => setCard((c) => ({ ...c, focused: null }))}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, cvc: onlyDigits(e.target.value).slice(0, 4) }))
                    }
                  />
                </div>

                {/* Sandbox test kartları */}
                <div className="mt-6 border-t border-[#e5e5e5] pt-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999]">
                    Sandbox Test Kartları
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {IYZICO_TEST_CARDS.map((t) => (
                      <button
                        key={t.number}
                        type="button"
                        onClick={() => fillTestCard(t.number)}
                        className="border border-[#e5e5e5] px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black"
                      >
                        {t.bank} · {t.brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Taksit */}
              <div className="border border-[#e5e5e5] p-6">
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Taksit Seçenekleri
                </h2>
                <p className="mb-5 text-[11px] text-[#999]">
                  Mock taksit — kart BIN&apos;ine göre. Sonraki adımda iyzico Installment API bağlanacak.
                </p>
                <div className="space-y-2">
                  {installments.map((opt) => {
                    const selected = installment === opt.count;
                    return (
                      <label
                        key={opt.count}
                        className={`flex cursor-pointer items-center justify-between border px-4 py-3 transition ${
                          selected ? "border-black bg-[#fafafa]" : "border-[#e5e5e5] hover:border-[#ccc]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="installment"
                            checked={selected}
                            onChange={() => setInstallment(opt.count)}
                            className="accent-black"
                          />
                          <span className="text-[12px] font-medium">{opt.label}</span>
                        </span>
                        <span className="text-right text-[12px]">
                          <span className="font-medium">
                            {formatPrice(opt.monthlyAmount, activeCart.currencyCode)}
                            {opt.count > 1 ? " / ay" : ""}
                          </span>
                          {opt.count > 1 && (
                            <span className="mt-0.5 block text-[10px] text-[#999]">
                              Toplam {formatPrice(opt.totalAmount, activeCart.currencyCode)}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-[11px] text-red-600">{error}</p>}

              <button
                type="button"
                disabled={submitting || !cardValid}
                onClick={handlePay}
                className="pf-btn-primary"
              >
                {submitting
                  ? "İşleniyor..."
                  : `${formatPrice(selectedInstallment?.totalAmount ?? activeCart.totalAmount, activeCart.currencyCode)} Öde`}
              </button>
              <p className="text-center text-[10px] text-[#999]">
                Bu adım mock&apos;tur. Gerçek çekim iyzico sandbox entegrasyonunda yapılacak. Sipariş
                Shopify Admin&apos;e sonraki sprintte yazılacak.
              </p>
            </section>
          )}
        </div>

        {/* Sipariş özeti */}
        <aside className="h-fit border border-[#e5e5e5] p-6 lg:sticky lg:top-28">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em]">Sipariş Özeti</h2>
          <ul className="space-y-3 border-b border-[#e5e5e5] pb-5">
            {activeCart.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-3 text-[12px]">
                <span className="flex-1 line-clamp-2">
                  {line.title}
                  <span className="text-[#666]"> × {line.quantity}</span>
                </span>
                <span className="whitespace-nowrap font-medium">
                  {formatPrice(line.price * line.quantity, activeCart.currencyCode)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#666]">Ara Toplam</span>
              <span>{formatPrice(activeCart.totalAmount, activeCart.currencyCode)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Kargo</span>
              <span className="text-[#666]">Ücretsiz</span>
            </div>
            {selectedInstallment && selectedInstallment.count > 1 && (
              <div className="flex justify-between">
                <span className="text-[#666]">Taksit</span>
                <span>
                  {selectedInstallment.count} ×{" "}
                  {formatPrice(selectedInstallment.monthlyAmount, activeCart.currencyCode)}
                </span>
              </div>
            )}
          </div>
          <div className="mt-5 flex justify-between border-t border-[#e5e5e5] pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">Toplam</span>
            <span className="text-[18px] font-medium">
              {formatPrice(
                selectedInstallment?.totalAmount ?? activeCart.totalAmount,
                activeCart.currencyCode
              )}
            </span>
          </div>
          <Link href="/cart" className="mt-6 block text-center text-[11px] uppercase tracking-wider text-[#666] underline">
            Sepeti Düzenle
          </Link>
        </aside>
      </div>
    </div>
  );
}

function EmptyCheckout({
  title,
  message,
  href,
  cta,
}: {
  title: string;
  message?: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
      <h1 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.15em]">{title}</h1>
      {message && <p className="mb-8 text-[12px] text-[#666]">{message}</p>}
      <Link href={href} className="pf-btn-primary inline-block w-auto px-10">
        {cta}
      </Link>
    </div>
  );
}
