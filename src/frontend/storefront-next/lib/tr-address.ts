/** Türkiye adres dropdown — Shopify alan eşlemesi */
export type TrProvince = { id: string; name: string; slug: string };

export type TrDistrict = { name: string; zip: string };

export type TrTown = { name: string; districts: TrDistrict[] };

export type TurkeyAddressSelection = {
  province: string;
  town: string;
  district: string;
  streetLine: string;
  zip: string;
};

export const EMPTY_TURKEY_ADDRESS: TurkeyAddressSelection = {
  province: "",
  town: "",
  district: "",
  streetLine: "",
  zip: "",
};

/** Shopify MailingAddress — province=il, city=ilçe */
export function turkeyAddressToShopifyFields(selection: TurkeyAddressSelection): {
  province: string;
  city: string;
  address1: string;
  zip: string;
} {
  const parts = [selection.district, selection.streetLine].map((s) => s.trim()).filter(Boolean);
  return {
    province: selection.province,
    city: selection.town,
    address1: parts.join(", "),
    zip: selection.zip,
  };
}

export function shopifyFieldsToTurkeyAddress(fields: {
  province?: string;
  city?: string;
  address1?: string;
  zip?: string;
}): TurkeyAddressSelection {
  const address1 = fields.address1 ?? "";
  const comma = address1.indexOf(",");
  if (comma > 0) {
    return {
      province: fields.province ?? "",
      town: fields.city ?? "",
      district: address1.slice(0, comma).trim(),
      streetLine: address1.slice(comma + 1).trim(),
      zip: fields.zip ?? "",
    };
  }
  return {
    province: fields.province ?? "",
    town: fields.city ?? "",
    district: "",
    streetLine: address1,
    zip: fields.zip ?? "",
  };
}

export function isTurkeyAddressComplete(selection: TurkeyAddressSelection): boolean {
  return Boolean(
    selection.province.trim() &&
      selection.town.trim() &&
      selection.district.trim() &&
      selection.streetLine.trim() &&
      selection.zip.trim(),
  );
}

export function provinceSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
