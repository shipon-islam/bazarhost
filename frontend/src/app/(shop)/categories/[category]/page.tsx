import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/shop/ProductCard";
import { getCategory } from "@/lib/categories";
import { getByCategory } from "@/lib/products";

export const revalidate = 60;

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ sort?: string; stock?: string; max?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory(decodeURIComponent((await params).category));
  return c ? { title: c.name, description: `Shop ${c.name} at BazarHost. ${c.blurb}.` } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = decodeURIComponent((await params).category);
  const { sort = "popular", stock, max } = await searchParams;
  const cat = getCategory(slug);
  if (!cat) notFound();

  let list = await getByCategory(slug);
  if (stock === "1") list = list.filter((p) => p.stockQty > 0);
  if (max && Number(max) > 0) list = list.filter((p) => (p.salePrice ?? p.price) <= Number(max));
  const price = (p: (typeof list)[number]) => p.salePrice ?? p.price;
  list = [...list].sort((a, b) =>
    sort === "price-asc" ? price(a) - price(b) : sort === "price-desc" ? price(b) - price(a) : sort === "rating" ? b.rating - a.rating : b.reviewCount - a.reviewCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500"><Link href="/" className="hover:text-brand">Home</Link> / <span className="text-slate-800">{cat.name}</span></nav>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900">{cat.emoji} {cat.name}</h1>
      <p className="mt-1 text-slate-500">{list.length} products · {cat.blurb}</p>

      <form className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl bg-surface p-4 text-sm">
        <label className="flex flex-col gap-1">Sort by
          <select name="sort" defaultValue={sort} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-300">
            <option value="popular">Most popular</option><option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">Max price (৳)
          <input name="max" type="number" min={0} defaultValue={max} placeholder="Any" className="w-32 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-300" />
        </label>
        <label className="flex items-center gap-2 pb-2"><input type="checkbox" name="stock" value="1" defaultChecked={stock === "1"} /> In stock only</label>
        <button className="rounded-lg bg-navy-900 px-5 py-2 font-semibold text-white hover:bg-navy-800">Apply</button>
        <Link href={`/${cat.slug}`} className="pb-2 text-slate-500 hover:text-brand">Reset</Link>
      </form>

      {list.length ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <div className="mt-16 text-center text-slate-500">
          <p className="text-lg font-semibold text-navy-900">No products match these filters</p>
          <Link href={`/${cat.slug}`} className="mt-2 inline-block text-brand hover:underline">Clear filters</Link>
        </div>
      )}
    </div>
  );
}
