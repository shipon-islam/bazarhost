import { z } from 'zod';
import { email, imageUrl, nullableString, phone } from './common.js';

const validTimezone = (tz) => {
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; }
};
const emptyToNull = (v) => (v === '' ? null : v);

export const updateSettingsSchema = z
  .object({
    storeName: z.string().trim().min(1).max(120),
    logo: z.preprocess(emptyToNull, imageUrl.nullable()),
    contactEmail: z.preprocess(emptyToNull, email.nullable()),
    contactPhone: phone,
    timezone: z.string().refine(validTimezone, 'Invalid IANA timezone (e.g. Asia/Dhaka)'),
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO currency code'),
    language: z.string().trim().min(2).max(10),
    weightUnit: z.enum(['kg', 'g', 'lb', 'oz']),
    defaultOrderStatus: z.enum(['pending', 'processing']),
    lowStockThreshold: z.coerce.number().int().min(0).max(100000),
    notifications: z
      .object({
        newOrderEmail: z.boolean(),
        newOrderSms: z.boolean(),
        lowStockEmail: z.boolean(),
        notificationEmail: z.preprocess(emptyToNull, email.nullable()),
      })
      .partial(),
  })
  .partial();
export { nullableString };
