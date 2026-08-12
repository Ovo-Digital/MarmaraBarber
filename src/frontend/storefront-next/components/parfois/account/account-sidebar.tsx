"use client";

import Link from "next/link";
import type { AccountSection } from "./account-utils";
import { ACCOUNT_SECTIONS } from "./account-utils";

function NavIcon({ section }: { section: AccountSection }) {
  const cls = "h-[18px] w-[18px] shrink-0";
  switch (section) {
    case "profile":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      );
    case "addresses":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "orders":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6 5 3H2" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="18" cy="19" r="1.5" />
        </svg>
      );
    case "returns":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M3 12a9 9 0 0 1 15-6.7" />
          <path d="M3 4v8h8" />
          <path d="M21 12a9 9 0 0 1-15 6.7" />
          <path d="M21 20v-8h-8" />
        </svg>
      );
    case "password":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="5" y="11" width="14" height="10" rx="1" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

interface AccountSidebarProps {
  active: AccountSection;
  onSelect: (section: AccountSection) => void;
}

export function AccountSidebar({ active, onSelect }: AccountSidebarProps) {
  return (
    <nav className="w-full lg:w-[220px] shrink-0">
      <h1 className="text-[15px] font-semibold text-black mb-5">Hesabım</h1>
      <ul className="space-y-1">
        {ACCOUNT_SECTIONS.map((item) => {
          const isActive = active === item.id;
          const baseClass =
            "flex w-full items-center gap-3 px-3 py-2.5 text-[12px] transition-colors border";
          const stateClass = isActive
            ? "border-black text-black font-medium bg-white"
            : "border-transparent text-[#999] hover:text-black";

          if (item.href) {
            return (
              <li key={item.id}>
                <Link href={item.href} className={`${baseClass} ${stateClass}`}>
                  <NavIcon section={item.id} />
                  {item.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`${baseClass} ${stateClass}`}
              >
                <NavIcon section={item.id} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
