"use client";

import Link from "next/link";
import type { PlpCategoryTab } from "@/lib/product-categories";
import { PlpFilters } from "@/components/parfois/plp-filters";
import type { ProductFacet } from "@/types/commerce";

type PlpHeaderProps = {
  title: string;
  activeHandle?: string;
  tabs?: PlpCategoryTab[];
  facets?: ProductFacet[];
  totalCount?: number;
};

export function PlpHeader({ title, activeHandle, tabs, facets = [], totalCount }: PlpHeaderProps) {
  return (
    <header className="w-full border-b border-[#e5e5e5] bg-white">
      {tabs && tabs.length > 0 ? (
        <nav
          className="flex gap-5 overflow-x-auto px-4 py-4 lg:gap-8 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Kategori sekmeleri"
        >
          {tabs.map((tab) => {
            const isActive = tab.handle === activeHandle;
            return (
              <Link
                key={tab.handle}
                href={tab.href}
                className={`shrink-0 pb-2 text-[12px] uppercase tracking-[0.06em] transition-colors md:text-[13px] ${
                  isActive
                    ? "border-b-2 border-black font-semibold text-black"
                    : "border-b-2 border-transparent font-normal text-[#666] hover:text-black"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : (
        <div className="px-4 py-4 lg:px-8">
          <h1 className="text-[13px] font-semibold uppercase tracking-[0.12em]">{title}</h1>
        </div>
      )}

      <PlpFilters facets={facets} totalCount={totalCount} />
    </header>
  );
}
