"use client";

import { useT } from "@/lib/i18n/dil";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h2 className="text-xl font-bold">{t("Something went wrong")}</h2>
      <p className="mt-2 text-sm text-zinc-600">{error.message}</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-zinc-900 px-6 py-2 text-white">
        {t("Try again")}
      </button>
    </div>
  );
}
