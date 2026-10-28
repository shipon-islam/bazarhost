import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from "node:url";
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_DAYS: z.coerce.number().positive().default(1),
  CLIENT_URLS: z.string().default('http://localhost:3000'),
  COOKIE_NAME: z.string().default('bz_admin_token'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  PUBLIC_URL: z.string().url().default('http://localhost:5000'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  SEED_ADMIN_NAME: z.string().default('Super Admin'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@bazarhost.com'),
  SEED_ADMIN_PASSWORD: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

const e = parsed.data;

export const env = {
  ...e,
  isProd: e.NODE_ENV === 'production',
  clientUrls: e.CLIENT_URLS.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean),
  uploadPath: path.resolve(e.UPLOAD_DIR),
  PUBLIC_URL: e.PUBLIC_URL.replace(/\/$/, ''),
  ROOT_DIR:path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  )
};
