import { Suspense } from "react";
import { AccountPageClient } from "@/components/parfois/account-page";

function AccountFallback() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 animate-pulse">
      <div className="flex gap-12">
        <div className="hidden lg:block h-64 w-[220px] bg-[#e5e5e5]" />
        <div className="flex-1 h-96 bg-[#e5e5e5]" />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountPageClient />
    </Suspense>
  );
}
