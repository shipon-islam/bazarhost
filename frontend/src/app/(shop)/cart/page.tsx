"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { FREE_SHIPPING_OVER } from "@/lib/shipping";
import { formatBDT } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  if (!items.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-5xl" aria-hidden>🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add a product and it will show up here.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Start shopping</Link>
      </div>
    );
  const left = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {items.map((i) => (
            <li key={i.slug} className="flex gap-4 p-4">
              <Link href={`/product/${i.slug}`} className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface">
                {i.image ? <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" /> : <span className="text-4xl" aria-hidden>{i.emoji}</span>}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link href={`/product/${i.slug}`} className="font-semibold text-navy-900 hover:text-brand">{i.name}</Link>
                <p className="text-sm text-slate-500">{formatBDT(i.unitPrice)} each</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-lg ring-1 ring-slate-300">
                    <button aria-label={`Decrease ${i.name}`} className="p-2" onClick={() => setQty(i.slug, i.qty - 1)}><Minus size={14} /></button>
                    <span className="w-7 text-center text-sm font-semibold">{i.qty}</span>
                    <button aria-label={`Increase ${i.name}`} className="p-2" onClick={() => setQty(i.slug, i.qty + 1)}><Plus size={14} /></button>
                  </div>
                  <span className="font-bold text-navy-900">{formatBDT(i.unitPrice * i.qty)}</span>
                  <button aria-label={`Remove ${i.name}`} onClick={() => remove(i.slug)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl bg-surface p-6">
          <h2 className="font-bold text-navy-900">Order summary</h2>
          <p className="mt-4 flex justify-between text-sm"><span>Subtotal</span><b>{formatBDT(subtotal)}</b></p>
          <p className="mt-2 text-xs text-slate-500">{left > 0 ? `Add ${formatBDT(left)} more for free delivery.` : "You get free delivery."} Delivery fee is shown at checkout.</p>
          <Link href="/checkout" className="mt-6 block rounded-xl bg-brand py-3 text-center font-semibold text-white hover:bg-brand-dark">Checkout</Link>
          <Link href="/" className="mt-3 block text-center text-sm text-slate-500 hover:text-brand">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
