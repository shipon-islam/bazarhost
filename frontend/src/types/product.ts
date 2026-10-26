export type CategorySlug = "electronics" | "fashion" | "home-&-living" | "and-more";
export type ProductStatus = "active" | "draft";

export interface Product {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  shortDescription: string;
  description?: string;
  category: CategorySlug;
  categoryName: string;
  price: number; // regular price (BDT)
  salePrice?: number;
  rating: number;
  reviewCount: number;
  stockQty: number;
  featured: boolean;
  badge?: "Bestseller" | "New";
  emoji: string; // placeholder when there is no photo
  image?: string;
  status: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}
