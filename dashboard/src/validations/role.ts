import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name must be at least 2 characters").max(40, "Role name is too long"),
  description: z.string().trim().max(200, "Keep it under 200 characters"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
