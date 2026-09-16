# BazarHost

A modern storefront for BazarHost — Bangladesh's marketplace for electronics,
fashion, home & living, and more. Built with Next.js 14 (App Router),
TypeScript, and Tailwind CSS.

## What's included

- **Homepage (`/`)** — hero section, category quick-nav, and product grids
  grouped by category (Electronics, Fashion, Home & Living, And More). Each
  product card has an **Order now** button.
- **Order details page (`/order/[id]`)** — clicking "Order now" on any
  product navigates here. It shows a delivery-info form, a payment method
  choice (Cash on delivery / bKash / Nagad), a quantity stepper, and a live
  order summary with subtotal, delivery fee and total. Submitting shows an
  order-confirmation screen.
- **12 sample products** across all four categories in `data/products.ts` —
  replace with your real catalog (or wire up a database/API) whenever you're
  ready.
- Your logo (`public/logo.jpg`) is already wired into the header.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Design notes

- **Colors** are pulled from your logo: navy (`#1B2F6B` / `#0F1B3D`) for
  structure and trust, orange (`#F5811E`) for every call-to-action button.
  See `tailwind.config.ts` for the full token list (`ink`, `navy`, `orange`,
  `canvas`, `slate`).
- **Type**: Sora for headings (`font-display`), Inter for body/UI text
  (`font-sans`) — loaded via `next/font/google` in `app/layout.tsx`.
- Product photos are placeholder icon tiles with brand-colored gradients so
  the site looks finished immediately — swap `icon`/`accent` in
  `data/products.ts` for real product photography whenever you have it
  (add the image domain to `next.config.js` first).

## Where to plug in real data / a backend

- `data/products.ts` — replace the static array with a fetch from your
  database or a CMS.
- `components/OrderForm.tsx` — the `handleSubmit` function currently just
  generates a fake order number client-side. Replace it with a call to your
  own `/api/orders` route (or a server action) to actually save the order.
- Add payment gateway integration (bKash/Nagad/SSLCommerz) where the
  "Payment method" section currently just tracks a local UI state.

## Project structure

```
app/
  layout.tsx          Root layout, fonts, header/footer
  page.tsx            Homepage
  order/[id]/page.tsx Order details route
components/
  Header.tsx
  Footer.tsx
  ProductCard.tsx
  OrderForm.tsx
data/
  products.ts         Product catalog (sample data)
public/
  logo.jpg            Your BazarHost logo
```
