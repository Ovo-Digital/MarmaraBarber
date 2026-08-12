export interface CustomerAddress {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface CustomerOrder {
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: number;
  currencyCode: string;
  statusUrl: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: CustomerAddress;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  customer: Customer;
}
