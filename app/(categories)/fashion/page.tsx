import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Fashion() {
  const items = products.filter(
    (product) => product.category.toLowerCase() === "fashion",
  );
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <section className="scroll-mt-20 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Fashion
            </h2>
            <p className="mt-1 text-sm text-slate-muted">3 ready to ship</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
