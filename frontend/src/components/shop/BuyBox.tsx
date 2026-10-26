"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/lib/cart";

export default function BuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.stockQty <= 0;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center rounded-xl ring-1 ring-slate-300" role="group" aria-label="Quantity">
          <button aria-label="Decrease quantity" className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button aria-label="Increase quantity" className="p-3" onClick={() => setQty((q) => Math.min(10, q + 1))}><Plus size={16} /></button>
        </div>
        <p className={`text-sm font-medium ${out ? "text-red-600" : product.stockQty < 5 ? "text-amber-600" : "text-green-700"}`}>
          {out ? "Out of stock" : product.stockQty < 5 ? `Only ${product.stockQty} left` : "In stock"}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button disabled={out} onClick={() => { add(product, qty); setAdded(true); setTimeout(() => setAdded(false), 1800); }}
          className="flex-1 rounded-xl bg-navy-900 py-3.5 font-semibold text-white hover:bg-navy-800 disabled:opacity-40">
          {added ? "Added to cart" : "Add to cart"}
        </button>
        <button disabled={out} onClick={() => { add(product, qty); router.push("/checkout"); }}
          className="flex-1 rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-40">
          Buy now
        </button>
      </div>
    </div>
  );
}
