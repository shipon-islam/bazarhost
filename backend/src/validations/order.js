import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../config/constants.js';
import { address, bulkIds, boolQuery, dateOnly, email, listQuery, money, nullableString, objectId, phone } from './common.js';

export const listOrdersQuery = listQuery.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  customer: objectId.optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  archived: z.enum(['true', 'false', 'all']).default('false'),
});

export const exportOrdersQuery = listOrdersQuery.omit({ page: true, limit: true });

export const createOrderSchema = z
  .object({
    customerId: objectId.optional(),
    customer: z.object({ name: z.string().trim().min(1).max(120), email, phone }).optional(),
    items: z.array(z.object({ productId: objectId, quantity: z.coerce.number().int().min(1).max(1000) })).min(1).max(100),
    paymentMethod: z.enum(PAYMENT_METHODS),
    paymentStatus: z.enum(['pending', 'paid']).optional(),
    transactionId: nullableString(100),
    discount: money.optional(),
    shippingFee: money.optional(),
    tax: money.optional(),
    billingAddress: address.optional(),
    shippingAddress: address.optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.customerId || d.customer, { message: 'Provide customerId or customer details', path: ['customer'] });

export const updateStatusSchema = z.object({ status: z.enum(ORDER_STATUSES), note: z.string().trim().max(500).optional() });
export const updatePaymentSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed']),
  transactionId: nullableString(100),
});
export const refundSchema = z.object({ reason: z.string().trim().max(500).optional() });
export const addNoteSchema = z.object({ text: z.string().trim().min(1).max(1000) });
export const archiveSchema = z.object({ archived: z.boolean() });
export const bulkOrderStatusSchema = z.object({ ids: bulkIds, status: z.enum(ORDER_STATUSES), note: z.string().trim().max(500).optional() });
export { boolQuery };
