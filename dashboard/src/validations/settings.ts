import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required").max(80, "Store name is too long"),
  contactEmail: z.string().trim().min(1, "Contact email is required").email("Enter a valid email address"),
  supportPhone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9\s-]{7,20}$/.test(v), "Enter a valid phone number"),
  websiteUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]{2,}$/.test(v), "Enter a full URL, e.g. https://bazarhost.com"),
  timezone: z.string().min(1, "Select a timezone"),
  currency: z.string().min(1, "Select a currency"),
  logo: z.string().nullable(),
  defaultLanguage: z.enum(["en", "bn"]),
  weightUnit: z.enum(["kg", "g"]),
  defaultOrderStatus: z.enum(["pending", "processing"]),
  lowStockThreshold: z
    .number({ error: "Enter a whole number" })
    .int("Enter a whole number")
    .min(0, "Cannot be negative")
    .max(10_000, "Too large"),
  notifications: z.object({
    newOrderEmail: z.boolean(),
    newOrderSms: z.boolean(),
    lowStockEmail: z.boolean(),
    weeklySummaryEmail: z.boolean(),
  }),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
