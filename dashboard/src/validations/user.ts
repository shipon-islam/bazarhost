import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the full name")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .refine(
      (v) => v === "" || /^\+?[0-9\s-]{7,20}$/.test(v),
      "Enter a valid phone number",
    ),
  roleId: z.string().min(1, "Select a role"),
  status: z.enum(["active", "disabled", "suspended"]),
  address: z.string().trim().max(300, "Address is too long"),
  /** Create only: email the user a secure set-password link instead of choosing a password. */
  sendInvite: z.boolean(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string(),
});

export type UserFormValues = z.infer<typeof userSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
