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
  const total = (cart.cost as { totalAmount: { amount: string; currencyCode: string } }).totalAmount;
  const lines = (cart.lines as { edges: { node: Record<string, unknown> }[] }).edges;
  return {
    id: cart.id as string,
    checkoutUrl: cart.checkoutUrl as string,
    totalAmount: parseFloat(total.amount),
    currencyCode: total.currencyCode,
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
  cost { totalAmount { amount currencyCode } }
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
  quantity: number
): Promise<Cart> {
  const data = await client.request<{ cartLinesAdd: Record<string, unknown> }>(
    `mutation($cartId:ID!,$lines:[CartLineInput!]!){
      cartLinesAdd(cartId:$cartId,lines:$lines){
        cart { ${CART_FIELDS} }
        userErrors { message field }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
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
