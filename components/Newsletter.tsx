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
    <div className="relative z-10 -mt-20 rounded-card border border-ink/10 bg-white px-6 py-8 shadow-xl shadow-ink/10 sm:px-10 sm:py-10">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-md">
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Get deals before everyone else
          </h2>
          <p className="mt-1.5 text-sm text-slate-muted">
            One email a week — new arrivals, price drops, and Eid-season
            offers. No spam, unsubscribe anytime.
          </p>
        </div>

        {subscribed ? (
          <p className="flex items-center gap-2 rounded-full bg-orange/10 px-5 py-3 text-sm font-medium text-orange-dark">
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
              className="w-full flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
