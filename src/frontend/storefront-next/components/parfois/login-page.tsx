"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/parfois/breadcrumb";
import { apiLogin } from "@/services/api/storefront-api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export function LoginPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const cartId = useCartStore((s) => s.cartId);

  const mutation = useMutation({
    mutationFn: () => apiLogin(email, password, cartId),
    onSuccess: ({ customer }) => {
      setCustomer(customer);
      router.push("/account");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Giriş başarısız"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16 lg:py-24">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Üye Girişi" }]} />
      <h1 className="text-[20px] font-light uppercase tracking-[0.15em] mb-2 text-center">Üye Girişi</h1>
      <p className="text-[12px] text-[#666] text-center mb-10">Hesabınıza giriş yapın veya yeni üye olun.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
          className="w-full border border-[#e5e5e5] px-4 py-3 text-[12px] outline-none focus:border-black"
        />
        <input
          type="password"
          required
          minLength={5}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          className="w-full border border-[#e5e5e5] px-4 py-3 text-[12px] outline-none focus:border-black"
        />
        {error && <p className="text-[11px] text-red-600">{error}</p>}
        <button type="submit" disabled={mutation.isPending} className="pf-btn-primary">
          {mutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] text-[#666]">
        Hesabınız yok mu?{" "}
        <Link href="/uye-ol" className="underline text-black">
          Üye Ol
        </Link>
      </p>
    </div>
  );
}
