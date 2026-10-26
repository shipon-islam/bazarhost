# BazarHost Admin

A responsive e-commerce admin dashboard for managing products, categories, orders, customers, roles & permissions, reports and settings.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Lucide icons · Recharts 3 · React Hook Form + Zod 4.

> **Status:** the UI is complete and runs entirely on an in-memory **mock service**. There is no real backend or authentication yet. See [Limitations](#limitations) and [API integration](#api-integration).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: the defaults work for local development
npm run dev                  # http://localhost:3000  →  /admin
```

Other scripts:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run build       # production build
npm start           # serve the production build
```

In development a clearly-labelled **mock admin user** (Super Admin) is signed in automatically. In production the admin is **locked** ("Access denied") unless real auth is wired up, or `ALLOW_MOCK_AUTH=true` is set for a private demo.

## What's included

| Route | Features |
| --- | --- |
| `/admin` | 6 KPI cards with period-over-period change, revenue / orders / status-donut / top-products charts, Today / 7 / 30 / 90-day selector, recent orders, low-stock alerts, new products, quick actions |
| `/admin/products` | Search (name/SKU), filters (category, stock, status), sorting, pagination, row selection, bulk delete / status change, delete confirmation, loading / empty / error states |
| `/admin/products/create`, `[id]/edit` | Zod-validated form, auto-slug (editable, with Regenerate), multi-image upload with preview, reorder & remove, SEO fields, unsaved-changes warning, server-side field errors |
| `/admin/products/[id]` | Read-only product view |
| `/admin/categories` (+ create / edit) | Same list tooling; parent category with **cycle prevention**; deletion is blocked (with an explanation) when a category has products or sub-categories |
| `/admin/orders` | Search, status & payment filters, date-range filter, sorting, pagination, bulk status update, **CSV export** of everything matching the current filters |
| `/admin/orders/[id]` | Items & totals, customer + addresses, payment info, progress timeline, forward-only status changes, cancel & refund (both confirmed), internal notes. Orders cannot be deleted (financial records) |
| `/admin/users` (+ create / `[id]` / edit) | Search, role & status filters, bulk activate / disable / delete, disable / reactivate with warnings, order history on the detail page. Create sends an **invite** (no password is ever entered or shown). You can't disable, demote or delete your own account; users with orders can't be deleted |
| `/admin/roles` | Role list, create / edit / delete (system roles and roles with users are protected), **permission matrix** (modules × view/create/edit/delete), plain-language summary, "you may lose access" warning, Super Admin locked |
| `/admin/reports` | Revenue, orders (stacked by status), products and customer-growth tabs, 7 days / 30 days / 90 days / 12 months, CSV export per tab |
| `/admin/settings` | General, preferences, notifications and profile tabs with validation and unsaved-changes protection |

Shell: collapsible navy sidebar (tooltips when collapsed, mobile drawer), top bar with breadcrumbs, search, notifications and user menu.

## Project structure

```
src/
  app/
    admin/                # layout.tsx (auth gate) + one folder per section
      <section>/page.tsx  # thin Server Component: permission gate + metadata
      <section>/*View.tsx # Client Components: interactive UI
  components/
    admin/                # Sidebar, TopBar, DataTable, FilterToolbar, Pagination, StatusBadge, ...
    ui/                   # Button, form controls, Modal (native <dialog>), Tabs, Toast, Dropdown
    charts/               # Recharts wrappers, lazy-loaded so only chart pages ship Recharts
  hooks/                  # useListQuery, useResource, useSelection, useUnsavedChanges, ...
  lib/
    api.ts                # ← the ONLY module UI code imports data functions from
    auth.ts               # server-side auth placeholder
    permissions.ts, utils.ts, nav.ts, bulk.ts
  mock/                   # in-memory data + service (seed.ts, service.ts)
  types/  validations/    # domain types and Zod schemas
```

Branding lives in one place: the `@theme` tokens at the top of `src/app/globals.css` (`brand-*` for primary blue, `navy-*` for the sidebar). Replace those hex values with the official BazarHost palette; nothing else needs to change.

## API integration

Every data function is exported from `src/lib/api.ts`. Today each one is served by `src/mock/service.ts`. To connect a real backend, replace a function's body with a call to the provided `request()` helper (typed `fetch` wrapper that sends cookies and maps errors to `ApiError`); no component changes are needed.

```ts
export const getProducts = (q: ListQuery) => request<Paginated<ProductRow>>("/products", { query: q });
```

### Endpoints the UI expects

List endpoints accept `search`, `page`, `pageSize`, `sortBy`, `sortDir` plus the filters listed, and return `{ items, total, page, pageSize }`.

| Resource | Endpoints | Filters / notes |
| --- | --- | --- |
| Products | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, bulk delete + bulk status | filters `categoryId`, `status`, `stock` (`in_stock`/`low`/`out_of_stock`); list rows include `categoryName`; slug and SKU uniqueness errors as `422 { message, errors: { slug: "…" } }` |
| Categories | `GET /categories`, `GET /categories/all`, `GET /categories/:id`, `POST`, `PUT`, `DELETE`, bulk delete + bulk status | filter `status`; rows include `productCount`, `parentName`; reject cycles and deleting non-empty categories (`409`) |
| Orders | `GET /orders`, `GET /orders/export`, `GET /orders/:id`, `PATCH /orders/:id/status`, bulk status, `POST /orders/:id/refund`, `POST /orders/:id/notes` | filters `status`, `payment`, `from`, `to` (`YYYY-MM-DD`); enforce the status flow server-side (`pending → processing → shipped → delivered`, cancel only before shipping) |
| Users | `GET /users`, `GET /users/:id`, `GET /users/:id/orders`, `POST /users` (with `sendInvite`), `PUT`, bulk status, `DELETE`, bulk delete | filters `role`, `status`; creating a user must **email a set-password link**: never accept a plaintext password from the admin UI |
| Roles | `GET /roles`, `POST`, `PUT /roles/:id`, `PUT /roles/:id/permissions`, `DELETE` | `{ id, name, description, isSystem, permissions: Record<module, action[]>, userCount }` |
| Reports | `GET /dashboard?range=`, `GET /reports?range=` | `range`: `today`, `7d`, `30d`, `90d`, `365d`; shapes in `src/types/report.ts` |
| Settings | `GET /settings`, `PUT /settings` | shape in `src/types/settings.ts` |
| Session | `POST /auth/logout` | |

Still needed beyond CRUD: image upload (`ImageUploader` currently makes session-only `blob:` URLs; see its `TODO(api)`), an audit-log endpoint (user "Account activity"), notification delivery, and a notifications feed for the bell icon.

## Authentication & authorization

`src/lib/auth.ts#getCurrentUser()` is a **placeholder**, not real auth. I deliberately did not invent a login form or a forgeable cookie. To go live, replace its body with a real session lookup (NextAuth `auth()`, or a verified JWT in an httpOnly cookie) that returns the user and the permissions issued by your backend.

UI permission checks (`useCan`, `RequirePermission`, hidden buttons) only decide what is *shown*. **Every API endpoint must enforce the same permissions server-side.**

## Limitations

- **Mock data only.** Changes are held in memory and reset on reload. Nothing is persisted. The dashboard/report figures are generated mock data.
- **No real auth** (see above) and **no real emails, SMS, refunds or image uploads**.
- Roles & permissions are a UI placeholder; nothing is enforced.
- The browser Back button can't be intercepted, so the unsaved-changes warning covers link clicks, Cancel and tab close, but not Back.
- Settings include only plausible fields; trim them to what the backend actually uses.
- **Not yet verified by an automated build.** The environment this was written in could not reach the npm registry, so `npm install`, `npm run lint`, `npm run typecheck` and `npm run build` have **not been run**. Only a syntax-level parse and an import/export consistency check were done. Run those four commands first and fix anything they report. Pages and flows also have not been exercised in a browser.
# bazarhost-dashboard
