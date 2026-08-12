import type { ReactNode } from "react";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/parfois/breadcrumb";
import { PlpHeader } from "@/components/parfois/plp-header";
import type { ProductFacet } from "@/types/commerce";
import type { PlpCategoryTab } from "@/lib/product-categories";

type PlpPageShellProps = {
  breadcrumb: { label: string; href?: string }[];
  title: string;
  activeHandle?: string;
  tabs?: PlpCategoryTab[];
  facets?: ProductFacet[];
  totalCount?: number;
  children: ReactNode;
};

export function PlpPageShell({
  breadcrumb,
  title,
  activeHandle,
  tabs,
  facets,
  totalCount,
  children,
}: PlpPageShellProps) {
  return (
    <div className="w-full">
      <div className="hidden px-4 pt-4 sm:block lg:px-8">
        <Breadcrumb items={breadcrumb} />
      </div>
      <Suspense
        fallback={
          <header className="w-full border-b border-[#e5e5e5] bg-white">
            <div className="h-12 border-t border-[#efefef]" />
          </header>
        }
      >
        <PlpHeader
          title={title}
          activeHandle={activeHandle}
          tabs={tabs}
          facets={facets}
          totalCount={totalCount}
        />
      </Suspense>
      <div className="w-full">{children}</div>
    </div>
  );
}
