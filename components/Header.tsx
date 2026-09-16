"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const categories = ["Electronics", "Fashion", "Home & Living", "And More"];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.jpg"
            alt="BazarHost"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Bazar<span className="text-orange">Host</span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center md:flex">
          <div className="flex w-full items-center rounded-full border border-ink/15 bg-white px-4 py-2 shadow-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-2 shrink-0 text-slate-muted"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21l-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for electronics, fashion, home essentials..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-slate-muted focus:outline-none"
            />
          </div>
        </div>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {categories.map((c) => (
            <Link
              key={c}
              href={`${c.replace(/\s/g, "-").toLowerCase()}`}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-orange"
            >
              {c}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu: search + category links, hidden at lg and above */}
      <div
        id="mobile-menu"
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="space-y-4 border-t border-ink/10 px-5 py-4">
          <div className="flex items-center rounded-full border border-ink/15 bg-white px-4 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-2 shrink-0 text-slate-muted"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21l-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search BazarHost..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-slate-muted focus:outline-none"
            />
          </div>

          <nav className="flex flex-col">
            {categories.map((c) => (
              <Link
                key={c}
                href={`${c.replace(/\s/g, "-").toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-ink/5 hover:text-orange"
              >
                {c}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
