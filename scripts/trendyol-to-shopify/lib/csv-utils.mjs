const INVALID_OPTION_VALUES = new Set([
  "kazan",
  "kuponun ürünleri",
  "kuponun urunleri",
  "sepete ekle",
  "tümünü gör",
  "tumunu gor",
  "beden tablosu",
  "renk",
  "beden",
]);

const SIZE_PATTERN =
  /^(xxs|xs|s|m|l|xl|xxl|2xl|3xl|4xl|5xl|\d{2}|\d{2}\/\d{2}|\d{2}-\d{2}|standart|tek ebat)$/i;

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidOptionValue(value) {
  if (!value || typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (INVALID_OPTION_VALUES.has(normalized)) return false;
  if (normalized.length > 30) return false;
  if (/kupon|kampanya|indirim|sepet|favori|kargo/i.test(normalized)) return false;
  return true;
}

export function looksLikeSize(value) {
  return SIZE_PATTERN.test(value.trim());
}

export function normalizeImages(urls) {
  const byBase = new Map();

  for (const url of urls ?? []) {
    if (!url || typeof url !== "string") continue;
    if (!url.includes("dsmcdn.com")) continue;
    if (url.endsWith(".svg") || url.includes(".gif") || url.includes("sticker")) continue;

    const base = url.replace(/mnresize\/\d+\/-?\/?/g, "").replace(/mnresize\/\d+\/\d+\//g, "");
    const sizeMatch = url.match(/mnresize\/(\d+)\/(\d+|\-)\//);
    const pixels = sizeMatch ? Number(sizeMatch[1]) : 9999;

    const existing = byBase.get(base);
    if (!existing || pixels > existing.pixels) {
      byBase.set(base, { url, pixels });
    }
  }

  return [...byBase.values()]
    .sort((a, b) => b.pixels - a.pixels)
    .map((item) => item.url)
    .slice(0, 10);
}

export function sanitizeVariants(product) {
  let variants = [...(product.variants ?? [])];

  const optionNames = (product.options ?? []).map((o) => o.name).slice(0, 3);

  variants = variants.filter((variant) => {
    const values = Object.values(variant.options ?? {});
    if (values.length === 0) return true;
    return values.every((value) => {
      if (!isValidOptionValue(value)) return false;
      const name = Object.keys(variant.options).find((k) => variant.options[k] === value);
      if (name?.toLowerCase().includes("beden") && !looksLikeSize(value) && value.length > 4) {
        return false;
      }
      return true;
    });
  });

  if (variants.length === 0) {
    variants = [
      {
        sku: product.sourceId || slugify(product.title),
        price: product.variants?.[0]?.price ?? "0.00",
        compareAtPrice: product.variants?.[0]?.compareAtPrice,
        options: {},
      },
    ];
  }

  const usedOptions = optionNames.length
    ? optionNames
    : Object.keys(variants[0]?.options ?? {}).slice(0, 3);

  return { variants, optionNames: usedOptions };
}

export function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current);
  return cells;
}

export function escapeCsvCell(value) {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowToCsv(row, headers) {
  return headers.map((header) => escapeCsvCell(row[header] ?? "")).join(",");
}
