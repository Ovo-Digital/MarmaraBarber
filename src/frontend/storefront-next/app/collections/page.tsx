import type { Metadata } from "next";
import Link from "next/link";
import { listMarmaraCollections } from "@/lib/marmara-catalog";

export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-static";

export default function CollectionsPage() {
  const collections = listMarmaraCollections().filter((c) => c.handle !== "frontpage");

  return (
    <div className="bg-[var(--sg-bg)] pb-16 pt-8">
      <div className="sg-container">
        <h1 className="sg-heading mb-8 text-[22px] md:text-[28px]">Collections</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {collections.map((c) => (
            <Link
              key={c.handle}
              href={`/collections/${c.handle}`}
              className="group overflow-hidden bg-white"
            >
              <div className="aspect-square bg-[#eee]">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--sg-ink)] p-4 text-center text-white">
                    <span className="font-[family-name:var(--font-heading)] text-[12px] tracking-[0.14em] uppercase">
                      {c.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-[family-name:var(--font-heading)] text-[11px] tracking-[0.14em] uppercase group-hover:underline">
                  {c.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
