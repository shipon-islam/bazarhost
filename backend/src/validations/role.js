import { z } from 'zod';
import { ALL_PERMISSIONS } from '../config/constants.js';

const fields = {
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).max(ALL_PERMISSIONS.length).optional(),
  // Required acknowledgement when the acting admin removes permissions from their own role
  confirmSelfLockout: z.boolean().optional(),
};

export const createRoleSchema = z.object({ ...fields, type: z.enum(['staff', 'customer']).optional() });
export const updateRoleSchema = z.object(fields).partial();
