import { categories } from "@/data/categories";
import { getProducts } from "@/lib/products";
import { formatBDT } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;
export const metadata = {
  title: "All categories",
  description:
    "Browse BazarHost by category: electronics, fashion, home & living and more.",
};

export default async function CategoriesPage() {
  const all = await getProducts();
  const data = categories.map((c) => {
    const items = all.filter((p) => p.category === c.slug);
    const lowest = items.length
      ? Math.min(...items.map((p) => p.salePrice ?? p.price))
      : 0;
    const onSale = items.filter(
      (p) => p.salePrice && p.salePrice < p.price,
    ).length;
    return { ...c, items, lowest, onSale };
  });

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="text-white">Categories</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Shop by category
          </h1>
          <p className="mt-3 max-w-xl text-white/70">
            {all.length} products across {categories.length} categories. Pick
            one to see everything in it.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <ul className="grid gap-6 md:grid-cols-2">
          {data.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categories/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
              >
                <div className="grid grid-cols-3 gap-px bg-slate-200">
                  {[0, 1, 2].map((i) => {
                    const p = c.items[i];
                    return (
                      <span
                        key={i}
                        className="relative grid aspect-square place-items-center bg-surface"
                      >
                        {p?.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(min-width:768px) 17vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <span
                            className="text-5xl transition group-hover:scale-110"
                            aria-hidden
                          >
                            {p?.emoji ?? c.emoji}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-navy-900">
                        {c.emoji} {c.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{c.blurb}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-brand-dark">
                      {c.items.length}{" "}
                      {c.items.length === 1 ? "product" : "products"}
                    </span>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                    {c.items.length > 0 && (
                      <li className="rounded-full bg-surface px-3 py-1 text-slate-600">
                        From {formatBDT(c.lowest)}
                      </li>
                    )}
                    {c.onSale > 0 && (
                      <li className="rounded-full bg-surface px-3 py-1 text-slate-600">
                        {c.onSale} on sale
                      </li>
                    )}
                  </ul>
                  <p className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand">
                    Browse {c.name}{" "}
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                      aria-hidden
                    />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl bg-surface p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-navy-900">
              Not sure where to look?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              See every product in one place and filter by price, rating and
              more.
            </p>
          </div>
          <Link
            href="/shop"
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Shop all products
          </Link>
        </div>
      </div>
    </>
  );
}
