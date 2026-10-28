import { z } from 'zod';
import { PRODUCT_STATUSES, STOCK_STATUSES } from '../config/constants.js';
import { boolQuery, bulkIds, imageUrl, listQuery, money, nullableMoney, nullableString, objectId } from './common.js';

export const slugSchema = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.string().trim().toLowerCase().max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens').optional(),
);

const fields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  slug: slugSchema,
  sku: nullableString(64),
  shortDescription: z.string().trim().max(500).optional(),
  description: z.string().max(20000).optional(),
  images: z.array(z.object({ url: imageUrl, alt: z.string().trim().max(200).optional() })).max(10).optional(),
  deletedImages: z.array(z.object({ url: imageUrl, alt: z.string().trim().max(200).optional() })).max(10).optional(),
  category: objectId,
  price: money,
  salePrice: nullableMoney,
  stockQuantity: z.coerce.number().int().min(0).max(10_000_000),
  stockStatus: z.enum(STOCK_STATUSES).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  featured: z.boolean().optional(),
  seoTitle: nullableString(120),
  seoDescription: nullableString(300),
};

const saleBelowPrice = [(d) => d.salePrice == null || d.price == null || d.salePrice < d.price, { message: 'Sale price must be lower than the regular price', path: ['salePrice'] }];

export const createProductSchema = z.object(fields).refine(...saleBelowPrice);
export const updateProductSchema = z.object(fields).partial().refine(...saleBelowPrice);

export const listProductsQuery = listQuery.extend({
  category: objectId.optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  stockStatus: z.enum(STOCK_STATUSES).optional(),
  featured: boolQuery.optional(),
  lowStock: boolQuery.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export const bulkProductsSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('delete'), ids: bulkIds }),
  z.object({ action: z.literal('status'), ids: bulkIds, status: z.enum(PRODUCT_STATUSES) }),
]);
