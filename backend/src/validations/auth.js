import { z } from 'zod';
import { email, password, phone, nullableString, imageUrl } from './common.js';

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(200),
  returnToken: z.boolean().optional(), // set true for non-browser clients that use Bearer tokens
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone,
  avatar: z.preprocess((v) => (v === '' ? null : v), imageUrl.nullable().optional()),
});

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1).max(200), newPassword: password })
  .refine((d) => d.currentPassword !== d.newPassword, { message: 'New password must be different', path: ['newPassword'] });

export const acceptInviteSchema = z.object({ token: z.string().min(10).max(200), password });
export { nullableString };
