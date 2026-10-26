import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const idParam = z.object({ id: objectId });

const emptyToNull = (v) => (v === '' ? null : v);
export const optionalId = z.preprocess(emptyToNull, objectId.nullable().optional());
export const nullableString = (max) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

export const boolQuery = z.preprocess((v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : v), z.boolean());
export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'Invalid date');

export const money = z.coerce.number().min(0).max(1_000_000_000).transform((n) => Math.round(n * 100) / 100);
export const nullableMoney = z.preprocess(emptyToNull, money.nullable().optional());

export const email = z.string().trim().toLowerCase().email('Invalid email address').max(254);
export const phone = z.preprocess(
  emptyToNull,
  z.string().trim().regex(/^[+()\-\s\d]{6,30}$/, 'Invalid phone number').nullable().optional(),
);

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .regex(/^(https?:\/\/|\/uploads\/)/, 'Must be an http(s) URL or an /uploads path');

export const address = z.object({
  fullName: nullableString(120),
  phone,
  line1: z.string().trim().min(1).max(200),
  line2: nullableString(200),
  city: z.string().trim().min(1).max(100),
  state: nullableString(100),
  postalCode: nullableString(20),
  country: nullableString(100),
});

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  sortBy: z.string().trim().max(30).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const bulkIds = z.array(objectId).min(1).max(200);

export const rangeQuery = z
  .object({
    range: z.enum(['today', '7d', '30d', '90d', 'month', 'quarter', 'year', 'custom']).default('30d'),
    from: dateOnly.optional(),
    to: dateOnly.optional(),
  })
  .superRefine((d, ctx) => {
    if (d.range !== 'custom') return;
    if (!d.from || !d.to) return ctx.addIssue({ code: 'custom', message: '"from" and "to" are required for a custom range', path: ['from'] });
    const days = (Date.parse(d.to) - Date.parse(d.from)) / 86400000;
    if (days < 0) ctx.addIssue({ code: 'custom', message: '"from" must be before "to"', path: ['from'] });
    if (days > 366) ctx.addIssue({ code: 'custom', message: 'Custom range cannot exceed 366 days', path: ['to'] });
  });
