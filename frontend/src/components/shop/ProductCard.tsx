import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/types/product";
import { discountPct, formatBDT } from "@/lib/utils";

export default function ProductCard({ product: p }: { product: Product }) {
  const off = discountPct(p.price, p.salePrice);
  const href = `/product/${p.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
      <Link href={href} className="relative grid aspect-square place-items-center bg-surface" aria-label={p.name}>
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
        ) : (
          <span className="text-6xl" aria-hidden>{p.emoji}</span>
        )}
        {p.badge && <span className="absolute left-3 top-3 rounded-full bg-navy-900 px-2.5 py-1 text-xs font-semibold text-white">{p.badge}</span>}
        {off > 0 && <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">-{off}%</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs text-slate-500">{p.categoryName}</p>
        <h3 className="line-clamp-2 text-sm font-semibold text-navy-900">
          <Link href={href}>{p.name}</Link>
        </h3>
        <p className="line-clamp-2 text-xs text-slate-500">{p.shortDescription}</p>
        {p.reviewCount > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
            <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold">{p.rating}</span>
            <span className="text-slate-400">({p.reviewCount.toLocaleString("en-US")})</span>
          </p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-navy-900">{formatBDT(p.salePrice ?? p.price)}</span>
          {off > 0 && <span className="text-sm text-slate-400 line-through">{formatBDT(p.price)}</span>}
        </div>
        <Link href={href} className="mt-2 rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-dark">
          View product
        </Link>
      </div>
    </article>
  );
}
