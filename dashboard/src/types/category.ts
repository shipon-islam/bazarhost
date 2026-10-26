export type CategoryStatus = "active" | "hidden";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parentId: string | null;
  status: CategoryStatus;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  /** MOCK-ONLY: emoji used as a thumbnail placeholder (not a backend field). */
  emoji?: string;
}

export interface CategoryWithCount extends Category {
  productCount: number;
  parentName: string | null;
}

export type CategoryInput = Omit<Category, "id" | "createdAt" | "emoji">;
