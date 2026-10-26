"use client";
import { useState } from "react";
import { trackOrder } from "@/lib/api";
import type { Order } from "@/types/order";
import { formatBDT } from "@/lib/utils";

const steps: Order["status"][] = ["Pending", "Processing", "Shipped", "Delivered"];
const field = "w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-300 focus:ring-brand outline-none";

export default function TrackPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [msg, setMsg] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const o = await trackOrder(String(f.get("id")), String(f.get("phone")));
    setOrder(o);
    setMsg(o ? "" : "We could not find that order. Check the order number and the phone number you used.");
  }
  const at = order ? steps.indexOf(order.status) : -1;
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">Track your order</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium">Order number<input name="id" required placeholder="BH-1234567" className={`${field} mt-1`} /></label>
        <label className="block text-sm font-medium">Phone number<input name="phone" required inputMode="tel" placeholder="01712345678" className={`${field} mt-1`} /></label>
        <button className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Track</button>
      </form>
      {msg && <p role="alert" className="mt-4 text-sm text-red-600">{msg}</p>}
      {order && (
        <section className="mt-8 rounded-2xl bg-surface p-6">
          <p className="font-bold text-navy-900">{order.id} · {formatBDT(order.total)}</p>
          {order.status === "Cancelled" ? <p className="mt-3 text-red-600">This order was cancelled.</p> : (
            <ol className="mt-4 flex justify-between text-center text-xs">
              {steps.map((s, i) => (
                <li key={s} className="flex-1"><span className={`mx-auto mb-2 block size-4 rounded-full ${i <= at ? "bg-brand" : "bg-slate-300"}`} />{s}</li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
