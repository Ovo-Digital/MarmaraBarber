"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SEARCH_POPULAR } from "@/lib/parfois-theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <div className="mx-auto max-w-[900px] px-4 py-8 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Arama</p>
          <button type="button" onClick={onClose} className="p-2 text-[11px] uppercase tracking-[0.12em]" aria-label="Kapat">
            Kapat
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mağazada aramak istediğiniz şeyi söyleyin"
            className="w-full border-b border-black bg-transparent py-4 text-[18px] font-light outline-none placeholder:text-[#999] md:text-[22px]"
            autoFocus
          />
        </form>

        <div className="mt-12">
          <p className="mb-5 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Popüler Kategoriler</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {SEARCH_POPULAR.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                onClick={onClose}
                className="text-[12px] uppercase tracking-[0.1em] text-[#666] underline-offset-4 hover:text-black hover:underline"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
