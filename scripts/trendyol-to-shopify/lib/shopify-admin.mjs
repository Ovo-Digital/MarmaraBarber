import { getShopifyAdminConfig } from "./env.mjs";

export async function shopifyAdminGraphql(query, variables = {}) {
  const { endpoint, token } = getShopifyAdminConfig();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify Admin HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${payload.errors.map((e) => e.message).join("; ")}`,
    );
  }

  return payload.data;
}

const FIND_BY_SKU = `
  query FindProductBySku($query: String!) {
    productVariants(first: 1, query: $query) {
      nodes {
        id
        sku
        product { id handle title }
      }
    }
  }
`;

export async function findProductBySku(sku) {
  try {
    const data = await shopifyAdminGraphql(FIND_BY_SKU, {
      query: `sku:${sku}`,
    });
    return data.productVariants.nodes[0]?.product ?? null;
  } catch {
    return null;
  }
}

const PRODUCT_SET = `
  mutation ProductSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product {
        id
        handle
        title
        variants(first: 50) {
          nodes { id sku price }
        }
      }
      userErrors { field message code }
    }
  }
`;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildProductSetInput(product) {
  const optionNames = product.options?.map((o) => o.name) ?? [];
  const productOptions =
    optionNames.length > 0
      ? product.options.map((o) => ({
          name: o.name,
          values: o.values.map((value) => ({ name: value })),
        }))
      : [{ name: "Title", values: [{ name: "Default Title" }] }];

  const variants = product.variants.map((variant) => {
    const optionValues =
      optionNames.length > 0
        ? optionNames.map((name) => ({
            optionName: name,
            name: variant.options?.[name] ?? variant.options?.[name.toLowerCase()] ?? "Default",
          }))
        : [{ optionName: "Title", name: "Default Title" }];

    const out = {
      optionValues,
      price: String(variant.price),
      sku: variant.sku || undefined,
      barcode: variant.barcode || undefined,
    };

    if (variant.compareAtPrice) {
      out.compareAtPrice = String(variant.compareAtPrice);
    }

    if (typeof variant.stock === "number" && process.env.SHOPIFY_LOCATION_ID) {
      out.inventoryItem = { tracked: true };
      out.inventoryQuantities = [
        {
          locationId: process.env.SHOPIFY_LOCATION_ID,
          name: "available",
          quantity: variant.stock,
        },
      ];
    }

    return out;
  });

  const files = (product.images ?? []).map((url, index) => ({
    originalSource: url,
    contentType: "IMAGE",
    alt: product.imageAlts?.[index] ?? product.title,
  }));

  return {
    title: product.title,
    descriptionHtml: product.descriptionHtml ?? product.description ?? "",
    vendor: product.vendor ?? "Dominant",
    productType: product.productType ?? "",
    tags: product.tags ?? ["trendyol-import"],
    handle: product.handle ?? slugify(product.title),
    status: "ACTIVE",
    productOptions,
    variants,
    files,
    metafields: [
      {
        namespace: "trendyol",
        key: "source_id",
        type: "single_line_text_field",
        value: String(product.sourceId ?? ""),
      },
      {
        namespace: "trendyol",
        key: "source_url",
        type: "url",
        value: product.url ?? "",
      },
    ].filter((m) => m.value),
  };
}

export async function importProductToShopify(product, { locationId } = {}) {
  if (locationId) {
    process.env.SHOPIFY_LOCATION_ID = locationId;
  }

  const firstSku = product.variants?.[0]?.sku;
  if (firstSku) {
    const existing = await findProductBySku(firstSku);
    if (existing) {
      return { skipped: true, product: existing, reason: "sku_exists" };
    }
  }

  const input = buildProductSetInput(product);
  const data = await shopifyAdminGraphql(PRODUCT_SET, {
    input,
    synchronous: true,
  });

  const result = data.productSet;
  if (result.userErrors?.length) {
    throw new Error(
      `productSet hata: ${result.userErrors.map((e) => `${e.field}: ${e.message}`).join("; ")}`,
    );
  }

  return { skipped: false, product: result.product };
}

const LOCATIONS_QUERY = `
  query Locations {
    locations(first: 5) {
      nodes { id name isActive }
    }
  }
`;

export async function getPrimaryLocationId() {
  const data = await shopifyAdminGraphql(LOCATIONS_QUERY);
  const locations = data.locations.nodes.filter((l) => l.isActive);
  const primary = locations[0];
  if (!primary) {
    throw new Error("Aktif Shopify lokasyonu bulunamadı.");
  }
  return primary.id;
}
