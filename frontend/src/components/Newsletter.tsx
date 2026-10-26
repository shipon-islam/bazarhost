"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  }

  return (
    <div className="relative z-10 -mt-20 rounded-xl border border-navy bg-white px-6 py-8 shadow-xl shadow-navy-800/20 sm:px-10 sm:py-10">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-md">
          <h2 className="font-display text-xl font-bold text-navy-800 sm:text-2xl">
            Get deals before everyone else
          </h2>
          <p className="mt-1.5 text-sm text-navy-800/80">
            One email a week — new arrivals, price drops, and Eid-season offers.
            No spam, unsubscribe anytime.
          </p>
        </div>

        {subscribed ? (
          <p className="flex items-center gap-2 rounded-full bg-brand-dark px-5 py-3 text-sm font-medium text-brand-dark">
            <span aria-hidden>✓</span> You&apos;re subscribed — welcome to
            BazarHost.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full flex-1 rounded-full border border-navy-800/15 px-4 py-3 text-sm text-navy-800 placeholder:text-slate-muted focus:border-orange focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
