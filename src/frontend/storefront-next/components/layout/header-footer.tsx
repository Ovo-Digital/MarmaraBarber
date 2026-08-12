import Link from "next/link";
import { MiniCart } from "@/components/cart/mini-cart";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Headless Store
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
            Ürünler
          </Link>
          <Link href="/collections" className="text-sm text-zinc-600 hover:text-zinc-900">
            Koleksiyonlar
          </Link>
          <Link href="/search" className="text-sm text-zinc-600 hover:text-zinc-900">
            Ara
          </Link>
          <Link href="/wishlist" className="text-sm text-zinc-600 hover:text-zinc-900">
            Favoriler
          </Link>
          <Link href="/account" className="text-sm text-zinc-600 hover:text-zinc-900">
            Hesabım
          </Link>
        </nav>
        <MiniCart />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10 text-center text-sm text-zinc-500">
        Headless Shopify Commerce Platform — Enterprise Starter
      </div>
    </footer>
  );
}
