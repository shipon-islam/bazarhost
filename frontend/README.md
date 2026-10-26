# BazarHost storefront (frontend only)

Next.js 15 (App Router), Tailwind CSS v4, TypeScript. No admin, no database, no auth in this project.

    npm install
    npm run dev        # http://localhost:3000

## Data source

- **Default (no setup):** built-in sample products (`src/lib/seed.ts`). Orders and tracking are saved in the visitor's browser only, so this mode is for demos and design work.
- **Real backend:** set `NEXT_PUBLIC_API_URL` in `.env.local`. The store then calls:
  - `GET  {API}/products` returns `Product[]` (shape in `src/types/product.ts`; only `status: "active"` is shown)
  - `POST {API}/orders` with `{ name, phone, email?, district, address, note?, items: [{ slug, qty }] }` returns `{ id }`, or `{ error }` with a 4xx status
  - `POST {API}/orders/track` with `{ id, phone }` returns the order (`src/types/order.ts`) or 404
  Your backend must re-price items and check stock itself; the store never sends prices. Enable CORS for the store's domain.

## Frontend logic included

Cart (localStorage, `src/lib/cart.tsx`), category filters and sorting, search, product pages with search-engine data, checkout validation (Bangladeshi mobile number, district, address), order confirmation, order tracking, sitemap and robots.

## To confirm before launch

Delivery fees (`src/lib/shipping.ts`) and the delivery & returns page text are placeholders. Payment is cash on delivery only.
