import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import BuyBox from "@/components/shop/BuyBox";
import ProductCard from "@/components/shop/ProductCard";
import { getByCategory, getProduct } from "@/lib/products";
import { discountPct, formatBDT } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return p ? { title: p.seoTitle || p.name, description: p.seoDescription || p.shortDescription } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const off = discountPct(p.price, p.salePrice);
  const related = (await getByCategory(p.category)).filter((x) => x.id !== p.id).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.shortDescription,
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
    offers: { "@type": "Offer", priceCurrency: "BDT", price: p.salePrice ?? p.price, availability: p.stockQty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Home</Link> / <Link href={`/${p.category}`} className="hover:text-brand">{p.categoryName}</Link> / <span className="text-slate-800">{p.name}</span>
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl bg-surface">
          {p.image ? <Image src={p.image} alt={p.name} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /> : <span className="text-9xl" aria-hidden>{p.emoji}</span>}
          {/* TODO: thumbnail gallery once products have multiple images */}
        </div>
        <div>
          <p className="text-sm text-slate-500">{p.categoryName}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900">{p.name}</h1>
          {p.reviewCount > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-sm">
              <Star size={16} className="fill-amber-400 text-amber-400" aria-hidden /><b>{p.rating}</b>
              <span className="text-slate-500">({p.reviewCount.toLocaleString("en-US")} reviews)</span>
            </p>
          )}
          <p className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-navy-900">{formatBDT(p.salePrice ?? p.price)}</span>
            {off > 0 && <><span className="text-lg text-slate-400 line-through">{formatBDT(p.price)}</span><span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">Save {off}%</span></>}
          </p>
          <p className="mt-5 max-w-prose text-slate-600">{p.description || p.shortDescription}</p>
          <BuyBox product={p} />
          <ul className="mt-8 space-y-2 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <li>Cash on delivery available</li>
            <li>Free delivery on orders over ৳2,000</li>
            <li><Link href="/delivery-returns" className="text-brand hover:underline">Delivery &amp; returns details</Link></li>
          </ul>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-navy-900">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      )}
    </div>
  );
}
