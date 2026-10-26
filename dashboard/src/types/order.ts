export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "bkash" | "nagad" | "card" | "cod";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus | "refunded";
  at: string;
}

export interface OrderNote {
  id: string;
  text: string;
  author: string;
  at: string;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  status: OrderStatus;
  billingAddress: Address;
  shippingAddress: Address;
  timeline: OrderTimelineEntry[];
  notes: OrderNote[];
}

/** Forward-only fulfilment flow used by the status stepper. */
export const ORDER_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
