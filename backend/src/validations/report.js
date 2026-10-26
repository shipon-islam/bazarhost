import { z } from 'zod';
import { rangeQuery } from './common.js';

// rangeQuery is a ZodEffects, so extend by intersecting.
export const topProductsQuery = rangeQuery.and(
  z.object({ metric: z.enum(['units', 'revenue']).default('units'), limit: z.coerce.number().int().min(1).max(50).default(10) }),
);
export const exportParams = z.object({ type: z.enum(['revenue', 'products', 'customers']) });
export { rangeQuery };
