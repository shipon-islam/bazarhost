"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export interface CartItem { slug: string; name: string; emoji: string; image?: string; unitPrice: number; qty: number }
interface CartCtx {
  items: CartItem[]; count: number; subtotal: number;
  add: (p: Product, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}
const Ctx = createContext<CartCtx | null>(null);
const KEY = "bazarhost-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[]); } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const value = useMemo<CartCtx>(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.unitPrice, 0),
    add: (p, qty = 1) => setItems((cur) => {
      const found = cur.find((i) => i.slug === p.slug);
      if (found) return cur.map((i) => (i.slug === p.slug ? { ...i, qty: Math.min(i.qty + qty, 10) } : i));
      return [...cur, { slug: p.slug, name: p.name, emoji: p.emoji, image: p.image, unitPrice: p.salePrice ?? p.price, qty }];
    }),
    setQty: (slug, qty) => setItems((cur) => cur.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(qty, 10)) } : i))),
    remove: (slug) => setItems((cur) => cur.filter((i) => i.slug !== slug)),
    clear: () => setItems([]),
  }), [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
