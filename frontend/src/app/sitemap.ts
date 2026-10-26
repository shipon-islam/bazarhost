import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { getProducts } from "@/lib/products";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const base = "https://bazarhost.com";
  return [
    { url: base }, { url: `${base}/delivery-returns` }, { url: `${base}/contact` },
    ...categories.map((c) => ({ url: `${base}/${c.slug}` })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}` })),
  ];
}
