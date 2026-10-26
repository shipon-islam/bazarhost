import FilterShell from "@/components/shop/FilterShell";
import ProductCard from "@/components/shop/ProductCard";
import SortSelect from "@/components/shop/SortSelect";
import { categories } from "@/data/categories";
import { getProducts } from "@/lib/products";
import { discountPct, formatBDT } from "@/lib/utils";
import { X } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;
export const metadata = {
  title: "Shop all products",
  description:
    "Browse every BazarHost product: electronics, fashion, home & living and more.",
};

type SP = {
  cat?: string;
  sort?: string;
  min?: string;
  max?: string;
  stock?: string;
  sale?: string;
  rating?: string;
  tag?: string;
  page?: string;
};
const PAGE_SIZE = 9;
const field =
  "w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand";
const presets = [
  ["Under ৳1,000", "", "1000"],
  ["৳1,000 – ৳3,000", "1000", "3000"],
  ["Over ৳3,000", "3000", ""],
] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const { cat = "", sort = "popular", stock, sale, tag = "" } = sp;
  const min = Number(sp.min) || 0,
    max = Number(sp.max) || 0,
    rating = Number(sp.rating) || 0;
  const price = (p: { price: number; salePrice?: number }) =>
    p.salePrice ?? p.price;

  const all = await getProducts();
  let list = all;
  if (cat) list = list.filter((p) => p.category === cat);
  if (stock === "1") list = list.filter((p) => p.stockQty > 0);
  if (sale === "1")
    list = list.filter((p) => discountPct(p.price, p.salePrice) > 0);
  if (rating) list = list.filter((p) => p.rating >= rating);
  if (tag) list = list.filter((p) => p.badge === tag);
  if (min) list = list.filter((p) => price(p) >= min);
  if (max) list = list.filter((p) => price(p) <= max);
  type P = (typeof list)[number];
  const sorters: Record<string, (a: P, b: P) => number> = {
    "price-asc": (a, b) => price(a) - price(b),
    "price-desc": (a, b) => price(b) - price(a),
    rating: (a, b) => b.rating - a.rating,
    new: (a, b) => b.createdAt.localeCompare(a.createdAt),
    popular: (a, b) => b.reviewCount - a.reviewCount,
  };
  list = [...list].sort(sorters[sort] ?? sorters.popular);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), pages);
  const view = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const url = (over: Partial<Record<keyof SP, string>>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, page: "", ...over }))
      if (v) u.set(k, v);
    const s = u.toString();
    return s ? `/shop?${s}` : "/shop";
  };
  const chips: { label: string; clear: Partial<Record<keyof SP, string>> }[] =
    [];
  if (cat)
    chips.push({
      label: categories.find((c) => c.slug === cat)?.name ?? cat,
      clear: { cat: "" },
    });
  if (min || max)
    chips.push({
      label: `${min ? formatBDT(min) : "৳0"} – ${max ? formatBDT(max) : "any"}`,
      clear: { min: "", max: "" },
    });
  if (rating) chips.push({ label: `${rating}★ & up`, clear: { rating: "" } });
  if (sale === "1") chips.push({ label: "On sale", clear: { sale: "" } });
  if (stock === "1") chips.push({ label: "In stock", clear: { stock: "" } });
  if (tag) chips.push({ label: tag, clear: { tag: "" } });

  const h = "mb-2 text-sm font-semibold text-navy-900";
  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav aria-label="Breadcrumb" className="text-sm text-navy-900/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="text-navy-900">Shop</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Shop all products
          </h1>
          <p className="mt-2 text-navy-900/70">
            Electronics, fashion, home essentials and more, delivered across
            Bangladesh.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[272px_1fr]">
        <aside>
          <FilterShell activeCount={chips.length}>
            <form
              className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm lg:sticky lg:top-32"
              aria-label="Filter products"
            >
              <input type="hidden" name="sort" value={sort} />
              <fieldset>
                <legend className={h}>Category</legend>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cat"
                        value=""
                        defaultChecked={!cat}
                        className="accent-brand"
                      />{" "}
                      All categories
                    </span>
                    <span className="text-xs text-slate-400">{all.length}</span>
                  </label>
                  {categories.map((c) => (
                    <label
                      key={c.slug}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="cat"
                          value={c.slug}
                          defaultChecked={cat === c.slug}
                          className="accent-brand"
                        />{" "}
                        {c.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {all.filter((p) => p.category === c.slug).length}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={h}>Price (৳)</legend>
                <div className="flex items-center gap-2">
                  <input
                    name="min"
                    type="number"
                    min={0}
                    defaultValue={sp.min}
                    placeholder="Min"
                    aria-label="Minimum price"
                    className={field}
                  />
                  <span aria-hidden>–</span>
                  <input
                    name="max"
                    type="number"
                    min={0}
                    defaultValue={sp.max}
                    placeholder="Max"
                    aria-label="Maximum price"
                    className={field}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map(([label, lo, hi]) => (
                    <Link
                      key={label}
                      href={url({ min: lo, max: hi })}
                      className="rounded-full bg-surface px-3 py-1 text-xs hover:bg-slate-200"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={h}>Customer rating</legend>
                <div className="space-y-2">
                  {[
                    ["", "Any rating"],
                    ["4", "4★ & up"],
                    ["4.5", "4.5★ & up"],
                  ].map(([v, l]) => (
                    <label key={l} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="rating"
                        value={v}
                        defaultChecked={String(rating || "") === v}
                        className="accent-brand"
                      />{" "}
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={h}>Product type</legend>
                <div className="space-y-2">
                  {[
                    ["", "All"],
                    ["Bestseller", "Bestsellers"],
                    ["New", "New arrivals"],
                  ].map(([v, l]) => (
                    <label key={l} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tag"
                        value={v}
                        defaultChecked={tag === v}
                        className="accent-brand"
                      />{" "}
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <legend className={h}>Availability</legend>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sale"
                    value="1"
                    defaultChecked={sale === "1"}
                    className="accent-brand"
                  />{" "}
                  On sale
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="stock"
                    value="1"
                    defaultChecked={stock === "1"}
                    className="accent-brand"
                  />{" "}
                  In stock only
                </label>
              </fieldset>
              <div className="flex items-center gap-3">
                <button className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-dark">
                  Apply filters
                </button>
                <Link href="/shop" className="text-slate-500 hover:text-brand">
                  Reset
                </Link>
              </div>
            </form>
          </FilterShell>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              <b className="text-navy-900">{list.length}</b>{" "}
              {list.length === 1 ? "product" : "products"}
            </p>
            <SortSelect value={sort} />
          </div>
          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {chips.map((c) => (
                <li key={c.label}>
                  <Link
                    href={url(c.clear)}
                    aria-label={`Remove filter ${c.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 font-medium text-brand-dark ring-1 ring-orange-200 hover:bg-orange-100"
                  >
                    {c.label}
                    <X size={14} aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="px-2 text-slate-500 hover:text-brand"
                >
                  Clear all
                </Link>
              </li>
            </ul>
          )}
          {view.length ? (
            <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-3">
              {view.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-surface py-20 text-center">
              <p className="text-4xl" aria-hidden>
                🔍
              </p>
              <p className="mt-3 text-lg font-semibold text-navy-900">
                No products match these filters
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try removing a filter or widening the price range.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Clear all filters
              </Link>
            </div>
          )}
          {pages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm"
            >
              {page > 1 && (
                <Link
                  href={url({ page: String(page - 1) })}
                  className="rounded-lg px-4 py-2 ring-1 ring-slate-300 hover:bg-surface"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={url({ page: String(n) })}
                  aria-current={n === page ? "page" : undefined}
                  className={`rounded-lg px-4 py-2 ring-1 ${n === page ? "bg-navy-900 text-white ring-navy-900" : "ring-slate-300 hover:bg-surface"}`}
                >
                  {n}
                </Link>
              ))}
              {page < pages && (
                <Link
                  href={url({ page: String(page + 1) })}
                  className="rounded-lg px-4 py-2 ring-1 ring-slate-300 hover:bg-surface"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
