"use client";

export function PlpToolbar({ count, title }: { count: number; title: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-[#e5e5e5]">
      <div>
        <h1 className="text-[20px] font-light uppercase tracking-[0.15em]">{title}</h1>
        <p className="mt-2 text-[11px] text-[#666] uppercase tracking-wider">{count} ürün</p>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em]">
          Sırala
          <select className="border border-[#e5e5e5] bg-white px-3 py-2 text-[11px] outline-none focus:border-black">
            <option>Önerilen</option>
            <option>Fiyat: Düşükten Yükseğe</option>
            <option>Fiyat: Yüksekten Düşüğe</option>
            <option>En Yeniler</option>
          </select>
        </label>
      </div>
    </div>
  );
}
