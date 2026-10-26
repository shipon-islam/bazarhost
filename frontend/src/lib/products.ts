import { seedProducts } from "@/lib/seed";
import type { Product } from "@/types/product";

const API = process.env.NEXT_PUBLIC_API_URL;

// With NEXT_PUBLIC_API_URL set, products come from GET {API}/products. Otherwise the built-in sample data is used.
async function load(): Promise<Product[]> {
  if (!API) return seedProducts;
  try {
    const res = await fetch(`${API}/products`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as Product[];
  } catch {
    return seedProducts; // keep the store usable if the API is down
  }
}

export const getProducts = async () => (await load()).filter((p) => p.status === "active");
export const getByCategory = async (slug: string) => (await getProducts()).filter((p) => p.category === slug);
export const getFeatured = async () => (await getProducts()).filter((p) => p.featured);
export const getProduct = async (slug: string) => (await getProducts()).find((p) => p.slug === slug);
