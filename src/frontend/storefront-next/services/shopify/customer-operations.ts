import type { GraphQLClient } from "graphql-request";
import { extractUserErrors } from "@/lib/shopify-errors";
import type { Customer, CustomerAddress, CustomerOrder } from "@/types/customer";

function mapAddress(node: Record<string, unknown>): CustomerAddress {
  return {
    id: node.id as string,
    firstName: (node.firstName as string) ?? "",
    lastName: (node.lastName as string) ?? "",
    company: node.company as string | undefined,
    address1: (node.address1 as string) ?? "",
    address2: node.address2 as string | undefined,
    city: (node.city as string) ?? "",
    province: node.province as string | undefined,
    zip: (node.zip as string) ?? "",
    country: (node.country as string) ?? "Turkey",
    phone: node.phone as string | undefined,
  };
}

function mapCustomer(node: Record<string, unknown>): Customer {
  const addresses = (node.addresses as { edges: { node: Record<string, unknown> }[] } | undefined)?.edges ?? [];
  const defaultAddress = node.defaultAddress as Record<string, unknown> | null;
  const orders = (node.orders as { edges: { node: Record<string, unknown> }[] } | undefined)?.edges ?? [];

  return {
    id: node.id as string,
    email: node.email as string,
    firstName: node.firstName as string | undefined,
    lastName: node.lastName as string | undefined,
    phone: node.phone as string | undefined,
    defaultAddress: defaultAddress ? mapAddress(defaultAddress) : undefined,
    addresses: addresses.map((e) => mapAddress(e.node)),
    orders: orders.map((e) => {
      const o = e.node;
      const total = o.totalPrice as { amount: string; currencyCode: string };
      return {
        orderNumber: o.orderNumber as number,
        processedAt: o.processedAt as string,
        financialStatus: o.financialStatus as string,
        fulfillmentStatus: o.fulfillmentStatus as string,
        totalPrice: parseFloat(total.amount),
        currencyCode: total.currencyCode,
        statusUrl: o.statusUrl as string,
      } satisfies CustomerOrder;
    }),
  };
}

export async function customerLogin(
  client: GraphQLClient,
  email: string,
  password: string
): Promise<{ accessToken: string; expiresAt: string }> {
  const data = await client.request<{ customerAccessTokenCreate: Record<string, unknown> }>(
    `mutation($input: CustomerAccessTokenCreateInput!){
      customerAccessTokenCreate(input:$input){
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message code }
      }
    }`,
    { input: { email, password } }
  );
  extractUserErrors(data.customerAccessTokenCreate);
  const token = data.customerAccessTokenCreate.customerAccessToken as { accessToken: string; expiresAt: string };
  return token;
}

export async function customerRegister(
  client: GraphQLClient,
  input: { email: string; password: string; firstName: string; lastName: string; acceptsMarketing?: boolean }
): Promise<Customer> {
  const data = await client.request<{ customerCreate: Record<string, unknown> }>(
    `mutation($input: CustomerCreateInput!){
      customerCreate(input:$input){
        customer { id email firstName lastName phone }
        customerUserErrors { field message code }
      }
    }`,
    { input }
  );
  extractUserErrors(data.customerCreate);
  return data.customerCreate.customer as Customer;
}

export async function customerRecover(client: GraphQLClient, email: string): Promise<void> {
  const data = await client.request<{ customerRecover: Record<string, unknown> }>(
    `mutation($email:String!){ customerRecover(email:$email){ customerUserErrors { message } } }`,
    { email }
  );
  extractUserErrors(data.customerRecover);
}

export async function customerGet(client: GraphQLClient, accessToken: string): Promise<Customer | null> {
  const data = await client.request<{ customer: Record<string, unknown> | null }>(
    `query($token:String!){
      customer(customerAccessToken:$token){
        id email firstName lastName phone
        defaultAddress { id firstName lastName company address1 address2 city province zip country phone }
        addresses(first:20){ edges { node { id firstName lastName company address1 address2 city province zip country phone } } }
        orders(first:10,sortKey:PROCESSED_AT,reverse:true){
          edges { node { orderNumber processedAt financialStatus fulfillmentStatus statusUrl totalPrice { amount currencyCode } } }
        }
      }
    }`,
    { token: accessToken }
  );
  return data.customer ? mapCustomer(data.customer) : null;
}

export async function customerAddressCreate(
  client: GraphQLClient,
  accessToken: string,
  address: Omit<CustomerAddress, "id">
): Promise<CustomerAddress> {
  const data = await client.request<{ customerAddressCreate: Record<string, unknown> }>(
    `mutation($token:String!,$address:MailingAddressInput!){
      customerAddressCreate(customerAccessToken:$token,address:$address){
        customerAddress { id firstName lastName company address1 address2 city province zip country phone }
        customerUserErrors { message field }
      }
    }`,
    { token: accessToken, address }
  );
  extractUserErrors(data.customerAddressCreate);
  return mapAddress(data.customerAddressCreate.customerAddress as Record<string, unknown>);
}

export async function customerAddressUpdate(
  client: GraphQLClient,
  accessToken: string,
  id: string,
  address: Omit<CustomerAddress, "id">
): Promise<CustomerAddress> {
  const data = await client.request<{ customerAddressUpdate: Record<string, unknown> }>(
    `mutation($token:String!,$id:ID!,$address:MailingAddressInput!){
      customerAddressUpdate(customerAccessToken:$token,id:$id,address:$address){
        customerAddress { id firstName lastName company address1 address2 city province zip country phone }
        customerUserErrors { message field }
      }
    }`,
    { token: accessToken, id, address }
  );
  extractUserErrors(data.customerAddressUpdate);
  return mapAddress(data.customerAddressUpdate.customerAddress as Record<string, unknown>);
}

export async function customerAddressDelete(
  client: GraphQLClient,
  accessToken: string,
  id: string
): Promise<void> {
  const data = await client.request<{ customerAddressDelete: Record<string, unknown> }>(
    `mutation($token:String!,$id:ID!){
      customerAddressDelete(customerAccessToken:$token,id:$id){
        deletedCustomerAddressId
        customerUserErrors { message field }
      }
    }`,
    { token: accessToken, id }
  );
  extractUserErrors(data.customerAddressDelete);
}

export async function customerUpdate(
  client: GraphQLClient,
  accessToken: string,
  input: { firstName?: string; lastName?: string; phone?: string }
): Promise<Customer> {
  const data = await client.request<{ customerUpdate: Record<string, unknown> }>(
    `mutation($token:String!,$customer:CustomerUpdateInput!){
      customerUpdate(customerAccessToken:$token,customer:$customer){
        customer { id email firstName lastName phone }
        customerUserErrors { message field }
      }
    }`,
    { token: accessToken, customer: input }
  );
  extractUserErrors(data.customerUpdate);
  return data.customerUpdate.customer as Customer;
}
