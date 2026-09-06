export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  imageUrl?: string;
  /** Hover image swap (2. görsel) */
  secondaryImageUrl?: string;
  price: number;
  compareAtPrice?: number | null;
  currencyCode: string;
  availableForSale: boolean;
  productType?: string;
  options?: ProductOption[];
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  availableForSale: boolean;
  sku?: string;
  imageUrl?: string;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  imageUrl?: string;
}

export interface CartLine {
  id: string;
  merchandiseId: string;
  quantity: number;
  title: string;
  price: number;
  imageUrl?: string;
  productHandle?: string;
  variantTitle?: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  totalAmount: number;
  currencyCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
}

export type ProductFacetType = "LIST" | "PRICE_RANGE" | "BOOLEAN" | string;

export interface ProductFacetValue {
  id: string;
  label: string;
  count: number;
  /** Shopify JSON — doğrudan productFilters dizisine parse edilir */
  input: string;
}

export interface ProductFacet {
  id: string;
  label: string;
  type: ProductFacetType;
  values: ProductFacetValue[];
}

export interface ProductListingResult {
  products: Product[];
  filters: ProductFacet[];
  totalCount: number;
}
