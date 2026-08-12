function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i");
}

const SHOPIFY_CATEGORY = {
  underwear: "Apparel & Accessories > Clothing > Underwear & Socks > Underwear",
  bras: "Apparel & Accessories > Clothing > Underwear & Socks > Bras",
  lingerie: "Apparel & Accessories > Clothing > Underwear & Socks > Lingerie",
  kids: "Apparel & Accessories > Clothing > Underwear & Socks > Underwear",
};

/**
 * @returns {{ productCategory: string, type: string, tags: string[] }}
 */
export function categorizeProduct(title, vendor = "Dominant") {
  const t = normalize(title);
  const tags = new Set(["trendyol-import"]);

  const isKids = /domi\s*kids|domikids/.test(t);
  const isRockhard = /rockhard/.test(t);
  const isGirl = /kiz cocuk|kız çocuk/.test(t) || (isKids && /kiz|kız/.test(t));
  const isBoy = /erkek cocuk|erkek çocuk/.test(t) || (isKids && /erkek/.test(t));
  const isWomen = /kadin|kadın/.test(t) || (!isKids && !isRockhard && !/iphone/.test(t));

  if (/iphone|samsung|telefon/.test(t)) {
    return {
      productCategory: "Electronics > Communications > Telephony > Mobile Phones",
      type: "Telefon",
      tags: [...tags, "kontrol-et", "dış-ürün"],
    };
  }

  if (isRockhard || (isBoy && /boxer/.test(t))) {
    tags.add("Erkek");
    tags.add("Boxer");
    if (isKids || /domi/.test(t)) tags.add("Çocuk");
    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: isKids ? "Erkek Çocuk Boxer" : "Erkek Boxer",
      tags: [...tags, "rockhard"],
    };
  }

  if (/boxer/.test(t) && isBoy) {
    tags.add("Erkek");
    tags.add("Çocuk");
    tags.add("Boxer");
    return {
      productCategory: SHOPIFY_CATEGORY.kids,
      type: "Erkek Çocuk Boxer",
      tags: [...tags, "domi-kids"],
    };
  }

  if (/atlet/.test(t)) {
    tags.add(isKids ? "Çocuk" : "Kadın");
    tags.add("Atlet");
    if (isBoy) tags.add("Erkek");
    if (isGirl) tags.add("Kız");
    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: isKids ? `${isGirl ? "Kız" : "Erkek"} Çocuk Atlet` : "Kadın Atlet",
      tags: [...tags, isKids ? "domi-kids" : "dominant"],
    };
  }

  if (/bustiyer|büstiyer/.test(t)) {
    tags.add(isKids ? "Çocuk" : "Kadın");
    tags.add("Büstiyer");
    if (isGirl) tags.add("Kız");
    return {
      productCategory: isKids ? SHOPIFY_CATEGORY.kids : SHOPIFY_CATEGORY.bras,
      type: isKids ? "Kız Çocuk Büstiyer" : "Kadın Büstiyer",
      tags: [...tags, isKids ? "domi-kids" : "dominant"],
    };
  }

  if (/body/.test(t)) {
    tags.add("Kadın");
    tags.add("Body");
    tags.add("İç Giyim");
    return {
      productCategory: SHOPIFY_CATEGORY.lingerie,
      type: "Kadın Body",
      tags: [...tags, "dominant"],
    };
  }

  if (/tanga/.test(t) && isWomen) {
    tags.add("Kadın");
    tags.add("Külot");
    tags.add("Tanga");
    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: "Kadın Tanga",
      tags: [...tags, "dominant"],
    };
  }

  if (/brazil/.test(t) && isWomen) {
    tags.add("Kadın");
    tags.add("Külot");
    tags.add("Brazilian");
    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: "Kadın Brazilian Külot",
      tags: [...tags, "dominant"],
    };
  }

  if (/bikini|firfirli|firfirli/.test(t) && isWomen) {
    tags.add("Kadın");
    tags.add("Külot");
    tags.add("Bikini");
    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: "Kadın Bikini Külot",
      tags: [...tags, "dominant"],
    };
  }

  if (/kulot|kulot/.test(t)) {
    if (isGirl || (isKids && !isBoy)) {
      tags.add("Kız");
      tags.add("Çocuk");
      tags.add("Külot");
      return {
        productCategory: SHOPIFY_CATEGORY.kids,
        type: "Kız Çocuk Külot",
        tags: [...tags, "domi-kids"],
      };
    }

    tags.add("Kadın");
    tags.add("Külot");

    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: "Kadın Külot",
      tags: [...tags, "dominant"],
    };
  }

  if (isWomen) {
    tags.add("Kadın");
    tags.add("İç Giyim");
    return {
      productCategory: SHOPIFY_CATEGORY.underwear,
      type: "Kadın İç Giyim",
      tags: [...tags, "dominant"],
    };
  }

  const brand = normalize(vendor).includes("domi") ? "domi-kids" : "dominant";
  tags.add(brand);

  return {
    productCategory: SHOPIFY_CATEGORY.underwear,
    type: "İç Giyim",
    tags: [...tags],
  };
}
