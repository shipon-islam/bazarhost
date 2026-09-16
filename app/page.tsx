import ProductCard from "@/components/ProductCard";
import FeaturedSlider from "@/components/FeaturedSlider";
import Reviews from "@/components/Reviews";
import { products } from "@/data/products";

const categoryIcons: Record<string, string> = {
  Electronics: "📱",
  Fashion: "👜",
  "Home & Living": "🏠",
  "And More": "✨",
};

const categories = ["Electronics", "Fashion", "Home & Living", "And More"] as const;

const featuredProducts = products.filter((p) => p.badge);

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-diagonal-split">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="text-white">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-orange-light">
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
              <a
                href="#electronics"
                className="rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
              >
                Start shopping
              </a>
              <a
                href="#home-&-living"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse categories
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((c) => (
              <a
                key={c}
                href={`#${c.replace(/\s/g, "-").toLowerCase()}`}
                className="flex flex-col items-center justify-center gap-2 rounded-card bg-white/10 py-8 text-center text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <span className="text-3xl" aria-hidden>
                  {categoryIcons[c]}
                </span>
                <span className="text-sm font-medium">{c}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FeaturedSlider products={featuredProducts} />

      {/* Product sections by category */}
      <div className="mx-auto max-w-6xl px-5 py-14">
        {categories.map((category) => {
          const items = products.filter((p) => p.category === category);
          if (items.length === 0) return null;
          return (
            <section
              key={category}
              id={category.replace(/\s/g, "-").toLowerCase()}
              className="scroll-mt-20 py-8"
            >
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">
                    {category}
                  </h2>
                  <p className="mt-1 text-sm text-slate-muted">
                    {items.length} product{items.length > 1 ? "s" : ""} ready
                    to ship
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Reviews />
    </div>
  );
}
