"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

const DELIVERY_FEE = 80;

export default function OrderForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState<"cod" | "bkash" | "nagad">("cod");
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const subtotal = product.price * quantity;
  const total = subtotal + DELIVERY_FEE;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = `BH-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(id);
    setConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange/10 text-3xl">
          ✅
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">
          Order placed
        </h1>
        <p className="mt-2 text-slate-muted">
          Your order <span className="font-semibold text-ink">{orderNumber}</span> for{" "}
          {product.name} is confirmed. We&apos;ll call you to verify delivery
          details shortly.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-muted transition-colors hover:text-orange"
      >
        ← Back to shop
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
        Order details
      </h1>
      <p className="mt-1 text-sm text-slate-muted">
        Confirm the item and tell us where to deliver it.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        {/* Delivery form */}
        <div className="space-y-6">
          <div className="rounded-card border border-ink/10 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Delivery information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Full name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Shipon Islam"
                  className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Phone number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="01XXX-XXXXXX"
                  className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  City
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dhaka"
                  className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Full address
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="House, road, area, thana"
                  className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Note to rider (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before arriving"
                  className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-card border border-ink/10 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Payment method
            </h2>
            <div className="mt-4 space-y-2.5">
              {[
                { id: "cod", label: "Cash on delivery" },
                { id: "bkash", label: "bKash" },
                { id: "nagad", label: "Nagad" },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    payment === option.id
                      ? "border-orange bg-orange/5 text-ink"
                      : "border-ink/15 text-ink/80 hover:border-ink/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={payment === option.id}
                    onChange={() => setPayment(option.id as typeof payment)}
                    className="accent-orange"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-orange px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark lg:hidden"
          >
            Place order — {formatTaka(total)}
          </button>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-card border border-ink/10 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Order summary
          </h2>

          <div className="mt-4 flex gap-3">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${product.accent} text-2xl`}
            >
              {product.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {product.name}
              </p>
              <p className="text-xs text-slate-muted">{product.category}</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {formatTaka(product.price)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Quantity</span>
            <div className="flex items-center gap-3 rounded-full border border-ink/15 px-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-4 text-center text-sm font-semibold text-ink">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-slate-muted">
              <span>Subtotal</span>
              <span className="text-ink">{formatTaka(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-muted">
              <span>Delivery fee</span>
              <span className="text-ink">{formatTaka(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatTaka(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 hidden w-full rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark lg:block"
          >
            Place order
          </button>
        </aside>
      </form>
    </div>
  );
}
