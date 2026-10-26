# BazarHost Admin API

Express 4 + MongoDB (Mongoose 8) backend for the BazarHost admin dashboard. Validation uses **Zod**, auth uses a **JWT in an httpOnly cookie** (Bearer tokens also work), and every route is protected by **server-side role/permission checks**.

## Quick start

```bash
npm install
cp .env.example .env        # set MONGODB_URI and a JWT_SECRET (>= 32 chars)
npm run seed                # roles + Super Admin + default settings
npm run seed:demo           # (optional, dev only) sample categories, products, customers, 90 orders
npm run dev                 # http://localhost:5000  (health: /health)
```
`npm run seed` prints the generated Super Admin password once (or uses `SEED_ADMIN_PASSWORD`).

## Conventions

* Base URL: `/api/v1`. All admin routes need a session and a staff role.
* Success: `{ "success": true, "data": ..., "meta"?: { page, limit, total, totalPages, hasNext, hasPrev } }`
* Error: `{ "success": false, "error": { "message", "code", "details"?: [{ "field", "message" }] } }` – `details` maps straight onto React Hook Form field errors.
* List endpoints accept `page`, `limit` (max 100), `search`, `sortBy`, `order=asc|desc` plus the filters below.
* Documents have `id` (not `_id`). Both `PUT` and `PATCH` are accepted for updates (partial bodies are fine).
* Empty strings from forms (`""`) are treated as "no value" for optional fields.

### Frontend wiring (`lib/api.ts`)
```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?page=1`, {
  credentials: 'include',          // send the auth cookie
  headers: { 'Content-Type': 'application/json' },
});
```
Add the API host to `images.remotePatterns` in `next.config` so `next/image` can load uploaded files. Put your frontend origin(s) in `CLIENT_URLS`. If the frontend and API are on different *sites* (not just sub-domains), set `COOKIE_SAMESITE=none` and use HTTPS.

## Endpoints

| Area | Endpoints | Permission |
|---|---|---|
| Auth | `POST /auth/login` · `POST /auth/logout` · `GET/PATCH /auth/me` · `POST /auth/change-password` · `POST /auth/accept-invite` | public / session |
| Dashboard | `GET /dashboard?range=today\|7d\|30d\|90d` – cards, charts, recent orders, low stock, new products (sections hidden if the user lacks access) | staff |
| Products | `GET /products` (filters: `category`, `status`, `stockStatus`, `featured`, `lowStock`, `minPrice`, `maxPrice`) · `POST` · `GET/PUT/PATCH/DELETE /:id` · `POST /bulk` (`delete` \| `status`) | `products:view/create/edit/delete` |
| Categories | `GET /categories` (adds `productCount`) · `GET /categories/options` · `POST` · `GET/PUT/PATCH/DELETE /:id` · `POST /bulk` | `categories:*` |
| Orders | `GET /orders` (filters: `status`, `paymentStatus`, `paymentMethod`, `from`, `to`, `customer`, `archived`) · `GET /orders/export` (CSV) · `POST` · `GET /:id` · `PATCH /:id/status` · `PATCH /:id/payment` · `POST /:id/refund` · `POST /:id/notes` · `PATCH /:id/archive` · `POST /bulk-status` | `orders:*` |
| Users | `GET /users` (filters: `role`, `roleType`, `status`) · `POST` (sends invite) · `GET/PUT/PATCH/DELETE /:id` · `PATCH /:id/status` · `POST /:id/invite` · `GET /:id/activity` · `POST /bulk` | `users:*` |
| Roles | `GET /roles` · `GET /roles/meta` (modules × actions for the matrix) · `POST` · `GET/PUT/PATCH/DELETE /:id` | `roles:*` |
| Reports | `GET /reports/revenue\|orders\|products\|customers?range=7d\|30d\|90d\|month\|quarter\|year\|custom&from&to` · `GET /reports/export/revenue\|products\|customers` (CSV) | `reports:view` |
| Settings | `GET /settings` · `PUT/PATCH /settings` | `settings:view/edit` |
| Uploads | `POST /uploads/images` (multipart, field `images`, up to 10, JPEG/PNG/WebP/GIF) → `[{ url, path }]` | create/edit on products, categories or settings |

Orders have **no delete route** (financial records) – use archive. Order statuses follow `pending → processing → shipped → delivered`, with `cancelled` allowed before delivery; cancelling restocks items.

## Permissions model
Roles hold a flat list like `products:view`, `orders:edit` (`config/constants.js`). `Super Admin` implicitly has everything. The login/`/auth/me` response includes `permissions[]` so the UI can hide menu items – but the **server is the source of truth**.

Built-in guards: system roles can't be deleted; the Super Admin role can't be edited; a role can't be deleted while in use; admins can't grant permissions they don't hold or manage users with higher privileges; you can't disable/delete yourself or the last active Super Admin; removing permissions from your own role returns `409 SELF_LOCKOUT_WARNING` until the client resends with `confirmSelfLockout: true`; disabling a user or changing their role/password revokes their existing sessions.

## Security notes
Passwords are bcrypt-hashed (cost 12) and never set by admins – new users get a one-time invite link (72 h, stored hashed). Login is rate limited and timing-safe. Cookie sessions reject unexpected `Origin`s on writes. Helmet, strict CORS, body size limit, Zod validation on every input (also blocks NoSQL operator injection), CSV formula-injection escaping, and image uploads restricted to raster types with random filenames.

## Things you still need to do
1. **Email delivery** – `services/mailer.js` only logs the invite link (dev). Plug in SES/Resend/Nodemailer. In dev the invite link is also returned in the API response.
2. **Image storage** – uploads go to local disk (`/uploads`). Use S3/Cloudinary on any host with ephemeral storage. Deleted products/categories don't delete their files.
3. **Payments** – "refund" and "mark paid" only update records; no payment gateway is integrated.
4. **Rich-text descriptions** are stored as sent; sanitise HTML when rendering on the storefront.
5. **No transactions** – stock reservation uses atomic conditional updates so it works on standalone MongoDB. If you run a replica set, wrapping order create/cancel in a transaction is a worthwhile upgrade.
6. Money is stored as rounded `Number`s; switch to integer minor units if you need strict accounting.
7. Not included: forgot-password (resend invite works as a reset for now), refresh tokens, notifications endpoint, tests.

Revenue in dashboard/reports = orders that are not cancelled and whose payment is not failed/refunded (see `services/analytics.js`). Charts use the store timezone from Settings (default `Asia/Dhaka`).
