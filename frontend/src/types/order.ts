export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem { slug: string; name: string; emoji: string; image?: string; unitPrice: number; qty: number }
export interface Order {
  id: string; name: string; phone: string; email?: string; district: string; address: string; note?: string;
  payment: "cod"; items: OrderItem[]; subtotal: number; shipping: number; total: number;
  status: OrderStatus; createdAt: string;
}
