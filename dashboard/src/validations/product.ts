import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Numeric fields are real numbers (not strings): the form registers them with
 * `valueAsNumber` / `setValueAs`, so the schema's input and output types match.
 */
export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(SLUG_REGEX, "Use lowercase letters, numbers and single hyphens"),
    sku: z.string().trim().max(40, "SKU is too long"),
    shortDescription: z.string().trim().max(200, "Keep it under 200 characters"),
    description: z.string().trim().max(5000, "Description is too long"),
    categoryId: z.string().min(1, "Select a category"),
    price: z
      .number({ error: "Enter a valid price" })
      .min(0, "Price cannot be negative")
      .max(100_000_000, "Price is too large"),
    salePrice: z.number({ error: "Enter a valid sale price" }).min(0, "Sale price cannot be negative").nullable(),
    stock: z
      .number({ error: "Enter a valid quantity" })
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    stockStatus: z.enum(["in_stock", "out_of_stock"]),
    status: z.enum(["active", "draft", "archived"]),
    featured: z.boolean(),
    seoTitle: z.string().trim().max(70, "Keep the SEO title under 70 characters"),
    seoDescription: z.string().trim().max(160, "Keep the SEO description under 160 characters"),
    images: z.array(z.string()).max(8, "You can add up to 8 images"),
  })
  .refine((d) => d.salePrice === null || d.salePrice < d.price, {
    message: "Sale price must be lower than the regular price",
    path: ["salePrice"],
  });

export type ProductFormValues = z.infer<typeof productSchema>;
