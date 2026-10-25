import type { GraphQLClient } from "graphql-request";
import { extractUserErrors } from "@/lib/shopify-errors";
import type { Cart } from "@/types/commerce";

export const CART_LINE_FRAGMENT = `
  id quantity
  merchandise {
    ... on ProductVariant {
      id title
      image { url }
      price { amount currencyCode }
      product { title handle featuredImage { url } }
    }
  }
`;

export function mapCart(cart: Record<string, unknown>): Cart {
  const cost = cart.cost as {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount?: { amount: string };
  };
  const total = cost.totalAmount;
  const lines = (cart.lines as { edges: { node: Record<string, unknown> }[] }).edges;
  return {
    id: cart.id as string,
    checkoutUrl: cart.checkoutUrl as string,
    totalAmount: parseFloat(total.amount),
    subtotalAmount: cost.subtotalAmount ? parseFloat(cost.subtotalAmount.amount) : undefined,
    currencyCode: total.currencyCode,
    discountCodes: (cart.discountCodes as { code: string; applicable: boolean }[] | undefined) ?? [],
    lines: lines.map(({ node }) => {
      const merch = node.merchandise as Record<string, unknown>;
      const price = merch.price as { amount: string };
      const product = merch.product as { title: string; handle: string; featuredImage?: { url?: string } };
      const variantImage = (merch.image as { url?: string } | null)?.url;
      return {
        id: node.id as string,
        merchandiseId: merch.id as string,
        quantity: node.quantity as number,
        title: product.title,
        variantTitle: merch.title as string,
        productHandle: product.handle,
        imageUrl: variantImage ?? product.featuredImage?.url,
        price: parseFloat(price.amount),
      };
    }),
  };
}

const CART_FIELDS = `
  id checkoutUrl
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  discountCodes { code applicable }
  lines(first: 50) { edges { node { ${CART_LINE_FRAGMENT} } } }
`;

export async function cartCreate(client: GraphQLClient): Promise<Cart> {
  const data = await client.request<{ cartCreate: Record<string, unknown> }>(
    `mutation { cartCreate { cart { ${CART_FIELDS} } userErrors { message field } } }`
  );
  extractUserErrors(data.cartCreate);
  return mapCart(data.cartCreate.cart as Record<string, unknown>);
}

export async function cartGet(client: GraphQLClient, cartId: string): Promise<Cart | null> {
  const data = await client.request<{ cart: Record<string, unknown> | null }>(
    `query($cartId:ID!){ cart(id:$cartId){ ${CART_FIELDS} } }`,
    { cartId }
  );
  return data.cart ? mapCart(data.cart) : null;
}

export async function cartAddLine(
  client: GraphQLClient,
  cartId: string,
  variantId: string,
  quantity: number,
  /* Abonelik seçildiyse planın kimliği. Tekrarlayan tahsilatı Shopify'ın
     kasası yürütüyor; biz yalnızca hangi planla alındığını bildiriyoruz. */
  sellingPlanId?: string
): Promise<Cart> {
  const data = await client.request<{ cartLinesAdd: Record<string, unknown> }>(
    `mutation($cartId:ID!,$lines:[CartLineInput!]!){
      cartLinesAdd(cartId:$cartId,lines:$lines){
        cart { ${CART_FIELDS} }
        userErrors { message field }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity, ...(sellingPlanId ? { sellingPlanId } : {}) }] }
  );
  extractUserErrors(data.cartLinesAdd);
  return mapCart(data.cartLinesAdd.cart as Record<string, unknown>);
}

export async function cartUpdateLine(
  client: GraphQLClient,
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const data = await client.request<{ cartLinesUpdate: Record<string, unknown> }>(
    `mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){
      cartLinesUpdate(cartId:$cartId,lines:$lines){
        cart { ${CART_FIELDS} }
        userErrors { message field }
      }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] }
  );
  extractUserErrors(data.cartLinesUpdate);
  return mapCart(data.cartLinesUpdate.cart as Record<string, unknown>);
}

export async function cartRemoveLines(
  client: GraphQLClient,
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await client.request<{ cartLinesRemove: Record<string, unknown> }>(
    `mutation($cartId:ID!,$lineIds:[ID!]!){
      cartLinesRemove(cartId:$cartId,lineIds:$lineIds){
        cart { ${CART_FIELDS} }
        userErrors { message field }
      }
    }`,
    { cartId, lineIds }
  );
  extractUserErrors(data.cartLinesRemove);
  return mapCart(data.cartLinesRemove.cart as Record<string, unknown>);
}

export async function cartAttachCustomer(
  client: GraphQLClient,
  cartId: string,
  customerAccessToken: string
): Promise<Cart> {
  const data = await client.request<{ cartBuyerIdentityUpdate: Record<string, unknown> }>(
    `mutation($cartId:ID!,$identity:CartBuyerIdentityInput!){
      cartBuyerIdentityUpdate(cartId:$cartId,buyerIdentity:$identity){
        cart { ${CART_FIELDS} }
        userErrors { message field }
      }
    }`,
    { cartId, identity: { customerAccessToken } }
  );
  extractUserErrors(data.cartBuyerIdentityUpdate);
  return mapCart(data.cartBuyerIdentityUpdate.cart as Record<string, unknown>);
}

/**
 * Sepetteki müşterinin berber kademesini okur ve o kademenin indirim kodunu
 * sepete uygular.
 *
 * Etiket SUNUCUDA okunuyor: tarayıcıdan gelen "ben altın üyeyim" bilgisine
 * güvenmiyoruz. Zaten kod Shopify'da müşteri segmentine kısıtlı olduğu için
 * yanlış kod gönderilse de uygulanmaz; `applicable` alanı sonucu söylüyor.
 *
 * Berber değilse ve sepette kademe kodu kalmışsa (çıkış yapılmış olabilir)
 * kod temizleniyor — yoksa indirim hesapta asılı kalırdı.
 */
export async function cartKademeIndirimi(
  client: GraphQLClient,
  cartId: string,
  customerAccessToken?: string,
): Promise<Cart | null> {
  const { KADEMELER, kademeBul } = await import("@/lib/berber");

  let etiketler: string[] = [];
  if (customerAccessToken) {
    const d = await client.request<{ customer: { tags?: string[] } | null }>(
      `query($t:String!){ customer(customerAccessToken:$t){ tags } }`,
      { t: customerAccessToken },
    );
    etiketler = d.customer?.tags ?? [];
  }

  const kademe = kademeBul({ tags: etiketler });
  const tumKodlar = KADEMELER.map((k) => k.indirimKodu);

  /* Sepette duran kodlara bak: değişiklik yoksa boşuna istek atma. */
  const mevcut = await cartGet(client, cartId);
  const duran = (mevcut?.discountCodes ?? []).map((d) => d.code);
  const korunan = duran.filter((c) => !tumKodlar.includes(c));
  const istenen = kademe ? [...korunan, kademe.indirimKodu] : korunan;

  const ayni =
    istenen.length === duran.length && istenen.every((c) => duran.includes(c));
  if (ayni) return mevcut;

  const data = await client.request<{ cartDiscountCodesUpdate: Record<string, unknown> }>(
    `mutation($cartId:ID!,$codes:[String!]!){
      cartDiscountCodesUpdate(cartId:$cartId,discountCodes:$codes){
        cart { ${CART_FIELDS} }
        userErrors { message field }
      }
    }`,
    { cartId, codes: istenen },
  );
  extractUserErrors(data.cartDiscountCodesUpdate);
  return mapCart(data.cartDiscountCodesUpdate.cart as Record<string, unknown>);
}
