export type NavItem = {
  label: string;
  href: string;
  badge?: string;
  accent?: boolean;
  children?: { label: string; href: string; badge?: string }[];
};

/** Shopify CSV import ile eşleşen kategori tanımları */
export type CatalogCategory = {
  handle: string;
  label: string;
  title: string;
  shopifyQuery: string;
  imageUrl?: string;
  group: "kadin" | "erkek" | "cocuk" | "all";
};

const IMG = {
  kadinKulot: "/images/categories/kadin-kategori.png",
  kadinBikini: "/images/categories/bikini-kulot.png",
  erkekBoxer: "/images/categories/erkek-kategori.png",
  cocuk: "/images/categories/cocuk-kategori.png",
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    handle: "kadin",
    label: "Kadın",
    title: "Kadın İç Giyim",
    shopifyQuery: "tag:Kadın tag:dominant",
    imageUrl: IMG.kadinKulot,
    group: "kadin",
  },
  {
    handle: "kadin-kulot",
    label: "Külot",
    title: "Kadın Külot",
    shopifyQuery: 'product_type:"Kadın Külot"',
    imageUrl: IMG.kadinKulot,
    group: "kadin",
  },
  {
    handle: "kadin-bikini-kulot",
    label: "Bikini Külot",
    title: "Kadın Bikini Külot",
    shopifyQuery: 'product_type:"Kadın Bikini Külot"',
    imageUrl: IMG.kadinBikini,
    group: "kadin",
  },
  {
    handle: "kadin-brazilian-kulot",
    label: "Brazilian Külot",
    title: "Kadın Brazilian Külot",
    shopifyQuery: 'product_type:"Kadın Brazilian Külot"',
    group: "kadin",
  },
  {
    handle: "kadin-tanga",
    label: "Tanga",
    title: "Kadın Tanga",
    shopifyQuery: 'product_type:"Kadın Tanga"',
    group: "kadin",
  },
  {
    handle: "kadin-bustiyer",
    label: "Büstiyer",
    title: "Kadın Büstiyer",
    shopifyQuery: 'product_type:"Kadın Büstiyer"',
    group: "kadin",
  },
  {
    handle: "kadin-body",
    label: "Body",
    title: "Kadın Body",
    shopifyQuery: 'product_type:"Kadın Body"',
    group: "kadin",
  },
  {
    handle: "erkek",
    label: "Erkek",
    title: "Erkek İç Giyim",
    shopifyQuery: "tag:rockhard",
    imageUrl: IMG.erkekBoxer,
    group: "erkek",
  },
  {
    handle: "erkek-boxer",
    label: "Boxer",
    title: "Erkek Boxer",
    shopifyQuery: 'product_type:"Erkek Boxer"',
    imageUrl: IMG.erkekBoxer,
    group: "erkek",
  },
  {
    handle: "cocuk",
    label: "Çocuk",
    title: "Domi Kids Çocuk Koleksiyonu",
    shopifyQuery: "tag:domi-kids",
    imageUrl: IMG.cocuk,
    group: "cocuk",
  },
  {
    handle: "kiz-cocuk-kulot",
    label: "Kız Çocuk Külot",
    title: "Kız Çocuk Külot",
    shopifyQuery: 'product_type:"Kız Çocuk Külot"',
    group: "cocuk",
  },
  {
    handle: "kiz-cocuk-atlet",
    label: "Kız Çocuk Atlet",
    title: "Kız Çocuk Atlet",
    shopifyQuery: 'product_type:"Kız Çocuk Atlet"',
    group: "cocuk",
  },
  {
    handle: "kiz-cocuk-bustiyer",
    label: "Kız Çocuk Büstiyer",
    title: "Kız Çocuk Büstiyer",
    shopifyQuery: 'product_type:"Kız Çocuk Büstiyer"',
    group: "cocuk",
  },
  {
    handle: "erkek-cocuk-boxer",
    label: "Erkek Çocuk Boxer",
    title: "Erkek Çocuk Boxer",
    shopifyQuery: 'product_type:"Erkek Çocuk Boxer"',
    group: "cocuk",
  },
  {
    handle: "erkek-cocuk-atlet",
    label: "Erkek Çocuk Atlet",
    title: "Erkek Çocuk Atlet",
    shopifyQuery: 'product_type:"Erkek Çocuk Atlet"',
    group: "cocuk",
  },
];

const byHandle = new Map(CATALOG_CATEGORIES.map((c) => [c.handle, c]));

export function getCategoryByHandle(handle: string): CatalogCategory | undefined {
  return byHandle.get(handle);
}

export function getCategoriesByGroup(group: CatalogCategory["group"]): CatalogCategory[] {
  return CATALOG_CATEGORIES.filter((c) => c.group === group);
}

export function getLeafCategories(): CatalogCategory[] {
  const parentHandles = new Set(["kadin", "erkek", "cocuk"]);
  return CATALOG_CATEGORIES.filter((c) => !parentHandles.has(c.handle));
}

export type PlpCategoryTab = {
  label: string;
  href: string;
  handle: string;
};

/** Kategori PLP üst sekmeleri (Parfois: Tümünü Gör + alt kategoriler) */
export function getPlpCategoryTabs(activeHandle: string): {
  title: string;
  tabs: PlpCategoryTab[];
} | null {
  const current = getCategoryByHandle(activeHandle);
  if (!current) return null;

  const parentByGroup: Record<Exclude<CatalogCategory["group"], "all">, string> = {
    kadin: "kadin",
    erkek: "erkek",
    cocuk: "cocuk",
  };

  if (current.group === "all") return null;

  const parentHandle = parentByGroup[current.group];
  const parent = getCategoryByHandle(parentHandle);
  if (!parent) return null;

  const tabs: PlpCategoryTab[] = [
    { label: "Tümünü Gör", href: `/collections/${parentHandle}`, handle: parentHandle },
    ...childrenForGroup(current.group, parentHandle).map((c) => ({
      label: c.label,
      href: `/collections/${c.handle}`,
      handle: c.handle,
    })),
  ];

  return { title: current.title, tabs };
}

function childrenForGroup(group: CatalogCategory["group"], parentHandle: string): CatalogCategory[] {
  return CATALOG_CATEGORIES.filter((c) => c.group === group && c.handle !== parentHandle);
}

export const CATEGORY_NAV: NavItem[] = [
  {
    label: "Kadın",
    href: "/collections/kadin",
    children: [
      { label: "Tümünü Gör", href: "/collections/kadin" },
      ...childrenForGroup("kadin", "kadin").map((c) => ({
        label: c.label,
        href: `/collections/${c.handle}`,
      })),
    ],
  },
  {
    label: "Erkek",
    href: "/collections/erkek",
    children: [
      { label: "Tümünü Gör", href: "/collections/erkek" },
      ...childrenForGroup("erkek", "erkek").map((c) => ({
        label: c.label,
        href: `/collections/${c.handle}`,
      })),
    ],
  },
  {
    label: "Domi Kids",
    href: "/collections/cocuk",
    badge: "Çocuk",
    children: [
      { label: "Tümünü Gör", href: "/collections/cocuk" },
      ...childrenForGroup("cocuk", "cocuk").map((c) => ({
        label: c.label,
        href: `/collections/${c.handle}`,
      })),
    ],
  },
  { label: "Yeni Gelenler", href: "/products?sort=new" },
  { label: "Tüm Ürünler", href: "/products" },
];

export const HOME_CATEGORY_TILES = [
  {
    title: "Kadın",
    href: "/collections/kadin",
    image: IMG.kadinKulot,
  },
  {
    title: "Erkek",
    href: "/collections/erkek",
    image: IMG.erkekBoxer,
  },
  {
    title: "Domi Kids",
    href: "/collections/cocuk",
    image: IMG.cocuk,
  },
  {
    title: "Bikini Külot",
    href: "/collections/kadin-bikini-kulot",
    image: IMG.kadinBikini,
  },
];

export const SEARCH_POPULAR_CATEGORIES = [
  { label: "Kadın Külot", href: "/collections/kadin-kulot" },
  { label: "Bikini Külot", href: "/collections/kadin-bikini-kulot" },
  { label: "Erkek Boxer", href: "/collections/erkek-boxer" },
  { label: "Domi Kids", href: "/collections/cocuk" },
  { label: "Yeni Gelenler", href: "/products?sort=new" },
];
