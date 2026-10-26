export type ProductStatus = "active" | "draft" | "archived";
export type StockStatus = "in_stock" | "out_of_stock";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  /** Image URLs. In mock mode these are session-only object URLs. */
  images: string[];
  categoryId: string;
  price: number;
  salePrice: number | null;
  stock: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  /** MOCK-ONLY: emoji used as a thumbnail placeholder (not a backend field). */
  emoji?: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "emoji">;

/** List rows include the resolved category name. */
export type ProductRow = Product & { categoryName: string };

export const LOW_STOCK_THRESHOLD = 10;
