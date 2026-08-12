"use client";

import { brandLabel, detectCardBrand, onlyDigits } from "@/lib/payment-utils";
import type { CardFormState } from "@/types/payment";

interface Props {
  card: CardFormState;
}

export function CreditCardVisual({ card }: Props) {
  const brand = detectCardBrand(card.number);
  const flipped = card.focused === "cvc";
  const digits = onlyDigits(card.number);
  const displayNumber =
    formatDisplayNumber(digits) || "•••• •••• •••• ••••";
  const displayName = card.name.trim().toUpperCase() || "AD SOYAD";
  const displayExpiry = card.expiry || "AA/YY";
  const displayCvc = card.cvc ? card.cvc.replace(/\d/g, "•").padEnd(3, "•") : "•••";

  return (
    <div className="perspective-[1000px] mx-auto w-full max-w-[380px]">
      <div
        className={`relative h-[210px] w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Ön yüz */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#0d0d0d] p-6 text-white shadow-xl [backface-visibility:hidden]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-[var(--pf-pink)]/20" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-10 w-12 rounded-md bg-gradient-to-br from-[#e8d5a3] to-[#c9a227] opacity-90" />
              <span className="text-[13px] font-semibold tracking-[0.15em] opacity-90">
                {brandLabel(brand) || "KART"}
              </span>
            </div>

            <p
              className={`font-mono text-[20px] tracking-[0.12em] md:text-[22px] ${
                card.focused === "number" ? "text-[var(--pf-pink)]" : ""
              }`}
            >
              {displayNumber}
            </p>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/50">Kart Sahibi</p>
                <p
                  className={`mt-1 truncate text-[13px] font-medium tracking-wider ${
                    card.focused === "name" ? "text-[var(--pf-pink)]" : ""
                  }`}
                >
                  {displayName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/50">SKT</p>
                <p
                  className={`mt-1 font-mono text-[13px] ${
                    card.focused === "expiry" ? "text-[var(--pf-pink)]" : ""
                  }`}
                >
                  {displayExpiry}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Arka yüz */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#111] to-[#2a2a2a] text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-6 h-12 w-full bg-black/80" />
          <div className="mt-6 px-6">
            <p className="mb-1 text-right text-[9px] uppercase tracking-[0.14em] text-white/50">CVC</p>
            <div className="flex h-10 items-center justify-end rounded bg-white px-4">
              <span className="font-mono text-[16px] tracking-[0.3em] text-black">{displayCvc}</span>
            </div>
            <p className="mt-6 text-[10px] leading-relaxed text-white/40">
              Bu kart yalnızca ödeme doğrulaması içindir. Bilgileriniz iyzico altyapısı ile işlenecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDisplayNumber(digits: string): string {
  if (!digits) return "";
  const padded = digits.padEnd(16, "•").slice(0, 16);
  return padded.replace(/(.{4})/g, "$1 ").trim();
}
