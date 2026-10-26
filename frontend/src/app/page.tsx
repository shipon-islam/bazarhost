import Reviews from "@/components/home/Reviews";
import ProductCard from "@/components/shop/ProductCard";
import { categories } from "@/data/categories";
import { getProducts } from "@/lib/products";
import { BadgeCheck, Banknote, Headset, Truck } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

const trust = [
  {
    Icon: Truck,
    title: "Fast delivery",
    text: "Next-day in Dhaka, 2–4 days nationwide",
  },
  {
    Icon: Banknote,
    title: "Cash on delivery",
    text: "Pay when your order arrives",
  },
  {
    Icon: BadgeCheck,
    title: "Easy returns",
    text: "Return within 7 days if it's not right",
  },
  {
    Icon: Headset,
    title: "Real support",
    text: "Call or WhatsApp us, 10am–10pm",
  },
];

export default async function Home() {
  const all = await getProducts();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-diagonal-split">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="text-white">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-brand-light">
              আপনার প্রয়োজন, আমাদের বাজার
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl">
              Everything you need,
              <br />
              one Bangladeshi bazar.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
              Electronics, fashion, home essentials and more — sourced for
              Bangladeshi homes, delivered to your door. Pick a product and
              place your order in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/product"
                className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Start shopping
              </Link>
              <a
                href="/categories"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse categories
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((c) => (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 py-8 text-center text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <span className="text-3xl" aria-hidden>
                  {c.emoji}
                </span>
                <span className="text-sm font-medium">{c.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon
              className="mt-0.5 shrink-0 text-brand"
              size={24}
              aria-hidden
            />
            <div>
              <p className="font-semibold text-navy-900">{title}</p>
              <p className="text-sm text-slate-500">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <section
        id="highlights"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-6"
      >
        <h2 className="text-2xl font-bold text-navy-900">
          This week&apos;s highlights
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {all
            .filter((p) => p.featured)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>

      {categories.map((c) => (
        <section
          key={c.slug}
          id={c.slug}
          className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-14"
        >
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-navy-900">{c.name}</h2>
            <Link
              href={`/${c.slug}`}
              className="text-sm font-semibold text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {all
              .filter((p) => p.category === c.slug)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      ))}

      <Reviews />
    </>
  );
}
