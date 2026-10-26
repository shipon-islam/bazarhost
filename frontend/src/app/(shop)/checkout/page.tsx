"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { districts, shippingFee } from "@/lib/shipping";
import { formatBDT } from "@/lib/utils";

const field = "w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-300 focus:ring-brand outline-none";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [district, setDistrict] = useState("Dhaka");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const shipping = shippingFee(subtotal, district);

  if (!items.length)
    return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="text-xl font-bold text-navy-900">Your cart is empty</p><Link href="/" className="mt-4 inline-block text-brand hover:underline">Start shopping</Link></div>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (v("name").length < 2) errs.name = "Enter your full name.";
    if (!/^01[3-9]\d{8}$/.test(v("phone"))) errs.phone = "Enter an 11-digit mobile number, like 01712345678.";
    if (v("email") && !/^\S+@\S+\.\S+$/.test(v("email"))) errs.email = "Enter a valid email address.";
    if (v("address").length < 10) errs.address = "Enter your full delivery address (house, road, area).";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const order = await createOrder({ name: v("name"), phone: v("phone"), email: v("email") || undefined, district, address: v("address"), note: v("note") || undefined, items: items.map((i) => ({ slug: i.slug, qty: i.qty })) });
      clear();
      router.push(`/checkout/success?id=${order.id}`);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not place the order." });
      setBusy(false);
    }
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-red-600">{errors[k]}</p> : null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">Checkout</h1>
      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div><label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label><input id="name" name="name" autoComplete="name" className={field} /><Err k="name" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="phone" className="mb-1 block text-sm font-medium">Mobile number</label><input id="phone" name="phone" inputMode="tel" autoComplete="tel" className={field} /><Err k="phone" /></div>
            <div><label htmlFor="email" className="mb-1 block text-sm font-medium">Email (optional)</label><input id="email" name="email" type="email" autoComplete="email" className={field} /><Err k="email" /></div>
          </div>
          <div><label htmlFor="district" className="mb-1 block text-sm font-medium">District</label>
            <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} className={field}>{districts.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label htmlFor="address" className="mb-1 block text-sm font-medium">Delivery address</label><textarea id="address" name="address" rows={3} autoComplete="street-address" className={field} /><Err k="address" /></div>
          <div><label htmlFor="note" className="mb-1 block text-sm font-medium">Order note (optional)</label><input id="note" name="note" className={field} /></div>
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">Payment</legend>
            <label className="flex items-center gap-3 rounded-xl p-4 ring-2 ring-brand"><input type="radio" checked readOnly /> Cash on delivery</label>
            <p className="px-1 text-xs text-slate-500">bKash, Nagad and card payments are coming soon.</p>
          </fieldset>
        </div>
        <aside className="h-fit rounded-2xl bg-surface p-6">
          <h2 className="font-bold text-navy-900">Your order</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => <li key={i.slug} className="flex justify-between gap-3"><span>{i.name} × {i.qty}</span><span>{formatBDT(i.unitPrice * i.qty)}</span></li>)}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBDT(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{shipping ? formatBDT(shipping) : "Free"}</dd></div>
            <div className="flex justify-between text-base font-bold text-navy-900"><dt>Total</dt><dd>{formatBDT(subtotal + shipping)}</dd></div>
          </dl>
          <Err k="form" />
          <button disabled={busy} className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{busy ? "Placing order…" : "Place order"}</button>
        </aside>
      </form>
    </div>
  );
}
