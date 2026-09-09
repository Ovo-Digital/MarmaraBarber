"use client";

import Link from "next/link";
import type { AccountSection } from "./account-utils";
import { ACCOUNT_SECTIONS } from "./account-utils";

interface AccountSidebarProps {
  active: AccountSection;
  onSelect: (section: AccountSection) => void;
}

export function AccountSidebar({ active, onSelect }: AccountSidebarProps) {
  /* Sitenin geri kalanındaki liste diliyle aynı: ince çizgiler, büyük harf,
     harf aralıklı, seçili satır kırmızı. Önceki dev puntolu hâli sayfanın
     dengesini bozuyordu. */
  return (
    <nav className="w-full shrink-0 lg:w-[230px]">
      <p className="lx-eyebrow mb-4">Account</p>
      <ul className="m-0 list-none p-0">
        {ACCOUNT_SECTIONS.map((item) => {
          const isActive = active === item.id;
          const cls =
            "flex w-full items-center justify-between py-3.5 text-left text-[12px] uppercase tracking-[0.14em] transition-colors";
          const stil: React.CSSProperties = {
            fontFamily: "var(--font-owners)",
            color: isActive ? "var(--sg-red)" : "rgba(20,17,15,0.62)",
          };
          const ok = (
            <span aria-hidden="true" style={{ opacity: isActive ? 1 : 0, transition: "opacity 200ms" }}>
              →
            </span>
          );

          if (item.href) {
            return (
              <li key={item.id} style={{ borderTop: "1px solid rgba(20,17,15,0.12)" }}>
                <Link href={item.href} className={cls} style={stil}>
                  {item.label}
                  {ok}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id} style={{ borderTop: "1px solid rgba(20,17,15,0.12)" }}>
              <button type="button" onClick={() => onSelect(item.id)} className={cls} style={stil}>
                {item.label}
                {ok}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
