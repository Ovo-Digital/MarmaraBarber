import type { Cart } from "@/types/commerce";
import type { Customer, CustomerAddress } from "@/types/customer";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function parseApi<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? `İstek başarısız (${res.status})`);
  }
  return json.data;
}

export async function apiCreateCart(): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "create" }),
    credentials: "include",
  });
  return parseApi<Cart>(res);
}

export async function apiGetCart(cartId: string): Promise<Cart> {
  const res = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`, {
    credentials: "include",
  });
  return parseApi<Cart>(res);
}

export async function apiAddToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "add", cartId, variantId, quantity }),
    credentials: "include",
  });
  return parseApi<Cart>(res);
}

export async function apiUpdateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "update", cartId, lineId, quantity }),
    credentials: "include",
  });
  return parseApi<Cart>(res);
}

export async function apiRemoveFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "remove", cartId, lineIds }),
    credentials: "include",
  });
  return parseApi<Cart>(res);
}

export async function apiAttachCustomerToCart(cartId: string): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "attachCustomer", cartId }),
    credentials: "include",
  });
  return parseApi<Cart>(res);
}

export async function apiLogin(email: string, password: string, cartId?: string | null) {
  const res = await fetch("/api/customer/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, cartId }),
    credentials: "include",
  });
  return parseApi<{ customer: Customer }>(res);
}

export async function apiRegister(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing?: boolean;
  cartId?: string | null;
}) {
  const res = await fetch("/api/customer/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  return parseApi<{ customer: Customer }>(res);
}

export async function apiLogout() {
  const res = await fetch("/api/customer/logout", { method: "POST", credentials: "include" });
  return parseApi<{ ok: true }>(res);
}

export async function apiGetCustomer(): Promise<Customer | null> {
  const res = await fetch("/api/customer/me", { credentials: "include" });
  if (res.status === 401) return null;
  return parseApi<Customer>(res);
}

export async function apiUpdateCustomer(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<Customer> {
  const res = await fetch("/api/customer/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  return parseApi<Customer>(res);
}

export async function apiCreateAddress(address: Omit<CustomerAddress, "id">) {
  const res = await fetch("/api/customer/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
    credentials: "include",
  });
  return parseApi<CustomerAddress>(res);
}

export async function apiUpdateAddress(id: string, address: Omit<CustomerAddress, "id">) {
  const res = await fetch(`/api/customer/addresses/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
    credentials: "include",
  });
  return parseApi<CustomerAddress>(res);
}

export async function apiDeleteAddress(id: string) {
  const res = await fetch(`/api/customer/addresses/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseApi<{ ok: true }>(res);
}
