import type { Metadata } from "next";
import { Finder } from "@/components/slick/finder";
import { storefrontGetProducts } from "@/services/shopify/storefront-direct";
import type { Product } from "@/types/commerce";

export const metadata: Metadata = { title: "Find your formula" };
export const revalidate = 300;

export default async function FinderPage() {
  let products: Product[] = [];
  try {
    products = await storefrontGetProducts(250);
  } catch {
    products = [];
  }

  return <Finder products={products} />;
}
