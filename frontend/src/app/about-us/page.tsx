import { categories } from "@/data/categories";
import {
  BadgeCheck,
  Banknote,
  HeartHandshake,
  PackageSearch,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About us",
  description:
    "BazarHost is a Bangladeshi online marketplace for electronics, fashion, home & living and more.",
};

// TODO: replace the story and values with BazarHost's real words before launch.
const values = [
  {
    Icon: BadgeCheck,
    title: "Honest listings",
    text: "Clear prices, clear photos and plain descriptions, so you know what arrives.",
  },
  {
    Icon: Banknote,
    title: "Pay on delivery",
    text: "Cash on delivery on every order, so you pay once the product is in your hands.",
  },
  {
    Icon: PackageSearch,
    title: "Follow your order",
    text: "Track any order with its number and your phone number, no account needed.",
  },
  {
    Icon: HeartHandshake,
    title: "Real people to talk to",
    text: "Call or WhatsApp us. We answer questions before and after you buy.",
  },
];
const steps = [
  {
    Icon: ShoppingBag,
    title: "Choose",
    text: "Browse the shop and add what you need to your cart.",
  },
  {
    Icon: Truck,
    title: "Order",
    text: "Enter your address and place the order. We call to confirm it.",
  },
  {
    Icon: Banknote,
    title: "Receive and pay",
    text: "Your order arrives at your door. Pay in cash when it does.",
  },
];

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden bg-diagonal-split text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-lg text-brand">আপনার প্রয়োজন, আমাদের বাজার</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              A bazar built for how Bangladesh shops.
            </h1>
            <p className="mt-5 max-w-lg text-white/70">
              BazarHost brings electronics, fashion and home essentials to one
              simple store, with cash on delivery and people you can call.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-brand px-6 py-3 font-semibold hover:bg-brand-dark"
              >
                Start shopping
              </Link>
              <Link
                href="/contact"
                className="rounded-xl px-6 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/10"
              >
                Contact us
              </Link>
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

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Our story
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900">
            Shopping online should feel easy and safe.
          </h2>
        </div>
        <div className="space-y-4 text-slate-600">
          <p>
            Many people in Bangladesh still hesitate to buy online. They worry
            about what will arrive, whether the price is fair, and who to call
            if something goes wrong.
          </p>
          <p>
            BazarHost is built to remove those worries. Every order can be paid
            for on delivery, every order can be tracked, and there is always a
            phone number and a WhatsApp chat behind the store.
          </p>
          <p>
            We started with the things people look for most, from electronics to
            fashion to home essentials, and we are growing the range with our
            customers.
          </p>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-navy-900">
            What we stand for
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="mt-4 font-bold text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-navy-900">
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ Icon, title, text }, i) => (
            <li
              key={title}
              className="relative rounded-2xl border border-slate-200 p-6"
            >
              <span className="absolute -top-4 left-6 grid size-8 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
                {i + 1}
              </span>
              <Icon size={26} className="text-brand" aria-hidden />
              <h3 className="mt-4 font-bold text-navy-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-3xl bg-navy-900 p-8 text-center text-white sm:p-14">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Have a question before you order?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Message us on WhatsApp or call. We are happy to help you choose.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/8801829258553"
              className="rounded-xl bg-[#25D366] px-6 py-3 font-semibold hover:brightness-95"
            >
              WhatsApp us
            </a>
            <Link
              href="/contact"
              className="rounded-xl px-6 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/10"
            >
              More ways to reach us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
