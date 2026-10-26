import { z } from 'zod';
import { CATEGORY_STATUSES } from '../config/constants.js';
import { bulkIds, imageUrl, listQuery, nullableString, objectId, optionalId } from './common.js';
import { slugSchema } from './product.js';

const fields = {
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional(),
  image: z.preprocess((v) => (v === '' ? null : v), imageUrl.nullable().optional()),
  parent: optionalId,
  status: z.enum(CATEGORY_STATUSES).optional(),
  seoTitle: nullableString(120),
  seoDescription: nullableString(300),
};

export const createCategorySchema = z.object(fields);
export const updateCategorySchema = z.object(fields).partial();

export const listCategoriesQuery = listQuery.extend({
  status: z.enum(CATEGORY_STATUSES).optional(),
  parent: z.union([objectId, z.literal('root')]).optional(),
});

export const bulkCategoriesSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('delete'), ids: bulkIds }),
  z.object({ action: z.literal('status'), ids: bulkIds, status: z.enum(CATEGORY_STATUSES) }),
]);
