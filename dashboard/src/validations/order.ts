import { z } from "zod";

export const orderNoteSchema = z.object({
  text: z.string().trim().min(1, "Write a note first").max(500, "Keep notes under 500 characters"),
});

export type OrderNoteValues = z.infer<typeof orderNoteSchema>;
