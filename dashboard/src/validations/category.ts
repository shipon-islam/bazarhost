import { z } from "zod";
import { SLUG_REGEX } from "./product";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(SLUG_REGEX, "Use lowercase letters, numbers and single hyphens"),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  image: z.string().nullable(),
  /** "" in the form means "no parent"; the service maps it to null. */
  parentId: z.string(),
  status: z.enum(["active", "hidden"]),
  seoTitle: z.string().trim().max(70, "Keep the SEO title under 70 characters"),
  seoDescription: z.string().trim().max(160, "Keep the SEO description under 160 characters"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
