import { z } from 'zod';
import { USER_STATUSES } from '../config/constants.js';
import { address, bulkIds, email, imageUrl, listQuery, objectId, phone } from './common.js';

const fields = {
  name: z.string().trim().min(2).max(120),
  email,
  phone,
  role: objectId,
  status: z.enum(USER_STATUSES).optional(),
  address: address.partial().optional(),
  avatar: z.preprocess((v) => (v === '' ? null : v), imageUrl.nullable().optional()),
};

// Admins never set passwords: new accounts receive an invite link to choose their own.
export const createUserSchema = z.object({ ...fields, sendInvite: z.boolean().optional() });
export const updateUserSchema = z.object(fields).partial();
export const userStatusSchema = z.object({ status: z.enum(USER_STATUSES) });

export const listUsersQuery = listQuery.extend({
  role: objectId.optional(),
  roleType: z.enum(['staff', 'customer']).optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export const bulkUsersSchema = z.object({
  action: z.enum(['status', 'delete']),
  ids: bulkIds,
  status:z.enum(USER_STATUSES).optional()
});
