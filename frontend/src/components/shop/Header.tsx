"use client";
import { categories } from "@/data/categories";
import { headerLinks } from "@/data/common/header";
import { useCart } from "@/lib/cart";
import { Mail, Menu, Phone, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
export default function Header() {
  const [open, setOpen] = useState(false);
  const { count: cartCount } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-navy-900 py-1.5 text-center text-xs text-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-5 py-2 text-xs sm:text-sm">
          <p className="truncate">
            Free delivery on orders over
            <span className="font-semibold text-orange-light">৳2,000</span>
          </p>
          <div className="hidden items-center gap-5 md:flex">
            <a
              href="tel:+8801829258553"
              className="transition-colors hover:text-white"
            >
              <Phone size={16} className="mr-1 inline-block" />
              +880 1829258553
            </a>
            <span className="h-3 w-px bg-white/20" aria-hidden />
            <a
              href="mailto:bazarhostbd@gmail.com"
              className="transition-colors hover:text-white"
            >
              <Mail size={16} className="mr-1 inline-block" />
              bazarhostbd@gmail.com
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo/logo.jpg"
            alt="BazarHost"
            width={50}
            height={50}
            className="rounded-full"
            priority
          />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Bazar<span className="text-brand">Host</span>
          </span>
        </Link>
        <nav
          className="ml-20 hidden gap-5 text-sm font-medium lg:flex"
          aria-label="Categories"
        >
          {headerLinks.map((link) => (
            <Link
              key={link.slug}
              href={`/${link.slug}`}
              className="text-slate-600 hover:text-brand font-semibold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <form
          action="/search"
          className="ml-auto hidden max-w-sm flex-1 items-center rounded-full bg-surface px-4 md:flex border border-slate-200"
        >
          <Search size={16} className="text-slate-400" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            className="w-full bg-transparent px-3 py-2 text-sm outline-none focus-visible:outline-none! "
          />
        </form>
        <Link
          href="/track"
          className="hidden text-sm text-slate-600 hover:text-brand sm:block"
        >
          Track order
        </Link>
        <Link
          href="/cart"
          aria-label={`Cart, ${cartCount} items`}
          className="relative ml-auto rounded-full p-2 hover:bg-surface md:ml-0"
        >
          <ShoppingCart size={22} />
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
            {cartCount}
          </span>
        </Link>
        <button
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav
          className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
          aria-label="Mobile categories"
        >
          <form
            action="/search"
            className="mb-3 flex items-center rounded-full bg-surface px-4"
          >
            <Search size={16} className="text-slate-400" aria-hidden />
            <input
              name="q"
              type="search"
              placeholder="Search products"
              aria-label="Search products"
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
          </form>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
