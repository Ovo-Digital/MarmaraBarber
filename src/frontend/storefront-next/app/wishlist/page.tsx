"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/parfois/breadcrumb";
import { useWishlistStore } from "@/store/cart-store";
import { useT } from "@/lib/i18n/dil";

export default function WishlistPage() {
  const t = useT();
  const { items, remove } = useWishlistStore();

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 lg:px-8 lg:py-12">
      <Breadcrumb items={[{ label: t("Home"), href: "/" }, { label: t("Saved products") }]} />
      <h1 className="text-[20px] font-light uppercase tracking-[0.15em] mb-8">{t("Saved products")}</h1>
      {items.length === 0 ? (
        <p className="text-[12px] text-[#666] text-center py-12">{t("You have no saved products yet.")}</p>
      ) : (
        <ul className="divide-y divide-[#e5e5e5]">
          {items.map((id) => (
            <li key={id} className="flex items-center justify-between py-5 text-[12px]">
              <Link href={`/products/${id}`} className="uppercase tracking-wide hover:underline">
                {id}
              </Link>
              <button type="button" onClick={() => remove(id)} className="text-[11px] uppercase tracking-wider text-[#666] hover:text-black">
                {t("Remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
