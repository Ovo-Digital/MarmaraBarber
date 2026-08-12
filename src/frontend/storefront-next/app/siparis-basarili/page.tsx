"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatPrice } from "@/lib/parfois-theme";

interface LastOrder {
  orderRef: string;
  total: number;
  installment: number;
  currency: string;
  email: string;
  mock: boolean;
}

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref");
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ovo_last_order");
      if (raw) setOrder(JSON.parse(raw) as LastOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-[560px] px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="text-[20px] font-light uppercase tracking-[0.15em]">Sipariş Alındı</h1>
      <p className="mt-3 text-[13px] text-[#666]">
        {order?.mock
          ? "Bu bir sandbox / mock ödemedir. Gerçek tahsilat yapılmadı."
          : "Ödemeniz başarıyla alındı."}
      </p>

      <div className="mt-10 border border-[#e5e5e5] p-6 text-left text-[12px]">
        <div className="flex justify-between border-b border-[#e5e5e5] pb-3">
          <span className="text-[#666]">Sipariş No</span>
          <span className="font-medium">{order?.orderRef ?? ref ?? "—"}</span>
        </div>
        {order && (
          <>
            <div className="flex justify-between border-b border-[#e5e5e5] py-3">
              <span className="text-[#666]">Tutar</span>
              <span className="font-medium">{formatPrice(order.total, order.currency)}</span>
            </div>
            <div className="flex justify-between border-b border-[#e5e5e5] py-3">
              <span className="text-[#666]">Taksit</span>
              <span className="font-medium">
                {order.installment === 1 ? "Tek Çekim" : `${order.installment} Taksit`}
              </span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-[#666]">E-posta</span>
              <span className="font-medium">{order.email}</span>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-[11px] text-[#999]">
        Sonraki adım: iyzico sandbox API + Shopify Admin&apos;de sipariş oluşturma.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link href="/products" className="pf-btn-primary w-auto px-10">
          Alışverişe Devam
        </Link>
        <Link href="/account" className="text-[11px] uppercase tracking-wider underline">
          Hesabım
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[560px] px-4 py-20 text-center animate-pulse">
          <div className="mx-auto h-6 w-40 bg-[#e5e5e5]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
