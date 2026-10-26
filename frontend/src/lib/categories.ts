import { categories } from "@/data/categories";

export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);
