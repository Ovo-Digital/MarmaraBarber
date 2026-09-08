"use client";

import Link from "next/link";
import type { AccountSection } from "./account-utils";
import { ACCOUNT_SECTIONS } from "./account-utils";

interface AccountSidebarProps {
  active: AccountSection;
  onSelect: (section: AccountSection) => void;
}

export function AccountSidebar({ active, onSelect }: AccountSidebarProps) {
  /* Büyük puntolu liste: bölümler her ekranda görünür kalıyor, birinden
     diğerine geçmek için header'daki ikona dönmek gerekmiyor.
     Seçili satır marka kırmızısı. */
  return (
    <nav className="w-full shrink-0 lg:w-[320px]">
      <ul className="m-0 list-none p-0">
        {ACCOUNT_SECTIONS.map((item) => {
          const isActive = active === item.id;
          const cls = "lx-hesap-satir group block w-full text-left";
          const stil: React.CSSProperties = {
            color: isActive ? "var(--sg-red)" : "var(--lx-ink)",
          };

          if (item.href) {
            return (
              <li key={item.id}>
                <Link href={item.href} className={cls} style={stil}>
                  {item.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect(item.id)} className={cls} style={stil}>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
