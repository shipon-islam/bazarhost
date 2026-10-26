import type { Order } from "@/types/order";

export interface OrderInput {
  name: string; phone: string; email?: string; district: string; address: string; note?: string;
  items: { slug: string; qty: number }[];
}
const API = process.env.NEXT_PUBLIC_API_URL;
const post = (path: string, body: unknown) =>
  fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// --- Sample mode (no API): orders are kept in this browser only. ---
const KEY = "bazarhost-orders";
const readLocal = (): Order[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Order[]; } catch { return []; } };

export async function createOrder(input: OrderInput): Promise<{ id: string }> {
  if (API) {
    // Expected: POST {API}/orders -> { id } (201/200) or { error } with a 4xx status. Re-price and check stock on the server.
    const res = await post("/orders", input);
    const data = (await res.json()) as { id?: string; error?: string };
    if (!res.ok || !data.id) throw new Error(data.error ?? "Could not place the order. Please try again.");
    return { id: data.id };
  }
  const { seedProducts } = await import("@/lib/seed");
  const { shippingFee } = await import("@/lib/shipping");
  const items = input.items.flatMap((l) => {
    const p = seedProducts.find((x) => x.slug === l.slug);
    return p ? [{ slug: p.slug, name: p.name, emoji: p.emoji, image: p.image, unitPrice: p.salePrice ?? p.price, qty: l.qty }] : [];
  });
  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.qty, 0);
  const shipping = shippingFee(subtotal, input.district);
  const order: Order = { ...input, items, subtotal, shipping, total: subtotal + shipping, payment: "cod", status: "Pending", id: `BH-${Date.now().toString().slice(-7)}`, createdAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify([order, ...readLocal()]));
  return { id: order.id };
}

export async function trackOrder(id: string, phone: string): Promise<Order | null> {
  if (API) {
    // Expected: POST {API}/orders/track { id, phone } -> Order, or 404.
    const res = await post("/orders/track", { id, phone });
    return res.ok ? ((await res.json()) as Order) : null;
  }
  return readLocal().find((o) => o.id.toLowerCase() === id.trim().toLowerCase() && o.phone === phone.trim()) ?? null;
}
