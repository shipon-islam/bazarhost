import Link from "next/link";
import type { Product } from "@/data/products";

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-ink/10 bg-white transition-shadow hover:shadow-lg hover:shadow-ink/5">
      <div
        className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.accent}`}
      >
        <span className="text-6xl drop-shadow-sm" aria-hidden>
          {product.icon}
        </span>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-orange px-2.5 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-muted">
          {product.category}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        <p className="text-sm text-slate-muted">{product.short}</p>

        <div className="flex items-center gap-1 text-sm text-slate-muted">
          <span className="text-orange">★</span>
          <span className="font-medium text-ink">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-ink">
            {formatTaka(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-slate-muted line-through">
              {formatTaka(product.oldPrice)}
            </span>
          )}
        </div>

        <Link
          href={`/order/${product.id}`}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
        >
          Order now
        </Link>
      </div>
    </div>
  );
}
