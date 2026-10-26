/**
 * MOCK SERVICE: an in-memory stand-in for the BazarHost backend.
 *
 *  - State lives in this module (i.e. in the browser tab). It is NOT persisted:
 *    a page refresh resets everything to the seed data.
 *  - Every function simulates network latency and returns cloned data.
 *  - Business rules that the real backend must enforce (unique slugs, status
 *    transitions, delete protection…) are implemented here so the UI can be
 *    exercised end-to-end. The real server must re-implement them.
 *
 * TODO: replace each exported function with a call to the real API
 * (see `request()` in src/lib/api.ts and the endpoint list in README.md).
 */
import { ApiError } from "@/lib/errors";
import { toDateKey } from "@/lib/utils";
import type { Category, CategoryInput, CategoryWithCount } from "@/types/category";
import type { ListQuery, Paginated, RangeKey, SortDir } from "@/types/common";
import type { Order, OrderStatus } from "@/types/order";
import type { Product, ProductInput, ProductStatus } from "@/types/product";
import type {
  DashboardData,
  ReportData,
  StatusSeriesPoint,
  StatusSlice,
  SummaryStat,
  TimePoint,
  TopProduct,
} from "@/types/report";
import type { PermissionMap, Role, RoleInput, RoleWithCount } from "@/types/role";
import type { StoreSettings } from "@/types/settings";
import type { User, UserInput, UserStatus, UserWithRole } from "@/types/user";
import { createSeed, DAY_MS, MOCK_NOW, ROLE_IDS, type MockDb } from "./seed";

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------

export const CURRENT_USER_ID = "u-1";
const CURRENT_USER_NAME = "Tanvir Rahman";

const DELAY_MS = Number(process.env.NEXT_PUBLIC_MOCK_DELAY_MS ?? 350);

let db: MockDb | null = null;
function getDb(): MockDb {
  if (!db) db = createSeed();
  return db;
}

function wait(ms = DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

let idCounter = 1000;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

interface QueryOptions<T> {
  searchText: (row: T) => string;
  filters?: Record<string, (row: T, value: string) => boolean>;
  sorters?: Record<string, (row: T) => string | number>;
  defaultSort?: { by: string; dir: SortDir };
}

function runQuery<T>(rows: T[], q: ListQuery, o: QueryOptions<T>): Paginated<T> {
  let out = rows;
  const s = q.search?.trim().toLowerCase();
  if (s) out = out.filter((r) => o.searchText(r).toLowerCase().includes(s));

  for (const [key, value] of Object.entries(q.filters ?? {})) {
    if (!value || value === "all") continue;
    const fn = o.filters?.[key];
    if (fn) out = out.filter((r) => fn(r, value));
  }

  const by = q.sortBy ?? o.defaultSort?.by;
  const dir = q.sortDir ?? o.defaultSort?.dir ?? "asc";
  const getter = by ? o.sorters?.[by] : undefined;
  if (getter) {
    out = [...out].sort((a, b) => {
      const x = getter(a);
      const y = getter(b);
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return dir === "asc" ? c : -c;
    });
  }

  const pageSize = q.pageSize ?? 10;
  const total = out.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, q.page ?? 1), pages);
  return { items: out.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
}

const ts = (iso: string) => new Date(iso).getTime();

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function withCounts(c: Category, d: MockDb): CategoryWithCount {
  return {
    ...c,
    productCount: d.products.filter((p) => p.categoryId === c.id).length,
    parentName: c.parentId ? (d.categories.find((x) => x.id === c.parentId)?.name ?? null) : null,
  };
}

/** IDs of every category below `id` in the tree (used to prevent cycles). */
export function categoryDescendantIds(categories: Pick<Category, "id" | "parentId">[], id: string): string[] {
  const result: string[] = [];
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const c of categories) {
      if (c.parentId === current && !result.includes(c.id)) {
        result.push(c.id);
        stack.push(c.id);
      }
    }
  }
  return result;
}

function assertCategoryInput(d: MockDb, input: CategoryInput, selfId?: string): void {
  const errors: Record<string, string> = {};
  if (d.categories.some((c) => c.slug === input.slug && c.id !== selfId)) errors.slug = "This slug is already in use";
  if (input.parentId) {
    if (!d.categories.some((c) => c.id === input.parentId)) errors.parentId = "Parent category no longer exists";
    else if (selfId) {
      if (input.parentId === selfId) errors.parentId = "A category cannot be its own parent";
      else if (categoryDescendantIds(d.categories, selfId).includes(input.parentId))
        errors.parentId = "That would create a loop: pick a category that isn't a child of this one";
    }
  }
  if (Object.keys(errors).length > 0) throw new ApiError("Please fix the highlighted fields.", 422, errors);
}

export async function getCategories(q: ListQuery): Promise<Paginated<CategoryWithCount>> {
  await wait();
  const d = getDb();
  const rows = d.categories.map((c) => withCounts(c, d));
  return clone(
    runQuery(rows, q, {
      searchText: (c) => `${c.name} ${c.slug}`,
      filters: { status: (c, v) => c.status === v },
      sorters: {
        name: (c) => c.name,
        slug: (c) => c.slug,
        productCount: (c) => c.productCount,
        status: (c) => c.status,
        createdAt: (c) => ts(c.createdAt),
      },
      defaultSort: { by: "name", dir: "asc" },
    }),
  );
}

export async function getAllCategories(): Promise<CategoryWithCount[]> {
  await wait(120);
  const d = getDb();
  return clone(d.categories.map((c) => withCounts(c, d)).sort((a, b) => a.name.localeCompare(b.name)));
}

export async function getCategory(id: string): Promise<CategoryWithCount> {
  await wait();
  const d = getDb();
  const c = d.categories.find((x) => x.id === id);
  if (!c) throw new ApiError("Category not found", 404);
  return clone(withCounts(c, d));
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  await wait();
  const d = getDb();
  assertCategoryInput(d, input);
  const category: Category = { ...input, id: nextId("c"), createdAt: new Date(MOCK_NOW).toISOString() };
  d.categories.push(category);
  return clone(category);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  await wait();
  const d = getDb();
  const idx = d.categories.findIndex((c) => c.id === id);
  if (idx < 0) throw new ApiError("Category not found", 404);
  assertCategoryInput(d, input, id);
  const updated: Category = { ...(d.categories[idx] as Category), ...input };
  d.categories[idx] = updated;
  return clone(updated);
}

function assertCategoryDeletable(d: MockDb, id: string): void {
  const products = d.products.filter((p) => p.categoryId === id).length;
  const children = d.categories.filter((c) => c.parentId === id).length;
  if (products > 0)
    throw new ApiError(`This category still has ${products} product${products === 1 ? "" : "s"}. Move them to another category first.`, 409);
  if (children > 0)
    throw new ApiError(`This category has ${children} sub-categor${children === 1 ? "y" : "ies"}. Move or delete them first.`, 409);
}

export async function deleteCategory(id: string): Promise<void> {
  await wait();
  const d = getDb();
  if (!d.categories.some((c) => c.id === id)) throw new ApiError("Category not found", 404);
  assertCategoryDeletable(d, id);
  d.categories = d.categories.filter((c) => c.id !== id);
}

export interface BulkResult {
  done: number;
  skipped: number;
  /** Optional explanation shown in the toast when some items were skipped. */
  reason?: string;
}

export async function bulkDeleteCategories(ids: string[]): Promise<BulkResult> {
  await wait();
  const d = getDb();
  let done = 0;
  let skipped = 0;
  for (const id of ids) {
    try {
      assertCategoryDeletable(d, id);
      d.categories = d.categories.filter((c) => c.id !== id);
      done += 1;
    } catch {
      skipped += 1;
    }
  }
  return { done, skipped, reason: skipped > 0 ? "Categories with products or sub-categories can't be deleted." : undefined };
}

export async function bulkUpdateCategoryStatus(ids: string[], status: Category["status"]): Promise<BulkResult> {
  await wait();
  const d = getDb();
  let done = 0;
  d.categories = d.categories.map((c) => {
    if (!ids.includes(c.id)) return c;
    done += 1;
    return { ...c, status };
  });
  return { done, skipped: ids.length - done };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const effectivePrice = (p: Product) => p.salePrice ?? p.price;

function assertProductInput(d: MockDb, input: ProductInput, selfId?: string): void {
  const errors: Record<string, string> = {};
  if (d.products.some((p) => p.slug === input.slug && p.id !== selfId)) errors.slug = "This slug is already in use";
  if (input.sku && d.products.some((p) => p.sku.toLowerCase() === input.sku.toLowerCase() && p.id !== selfId))
    errors.sku = "This SKU belongs to another product";
  if (!d.categories.some((c) => c.id === input.categoryId)) errors.categoryId = "Category no longer exists";
  if (Object.keys(errors).length > 0) throw new ApiError("Please fix the highlighted fields.", 422, errors);
}

export async function getProducts(q: ListQuery): Promise<Paginated<Product & { categoryName: string }>> {
  await wait();
  const d = getDb();
  const catName = new Map(d.categories.map((c) => [c.id, c.name]));
  const rows = d.products.map((p) => ({ ...p, categoryName: catName.get(p.categoryId) ?? "Uncategorised" }));
  const threshold = d.settings.lowStockThreshold;
  return clone(
    runQuery(rows, q, {
      searchText: (p) => `${p.name} ${p.sku}`,
      filters: {
        categoryId: (p, v) => p.categoryId === v,
        status: (p, v) => p.status === v,
        stock: (p, v) =>
          v === "in_stock" ? p.stock > 0 && p.stockStatus === "in_stock" : v === "out_of_stock" ? p.stock === 0 || p.stockStatus === "out_of_stock" : v === "low" ? p.stock > 0 && p.stock <= threshold : true,
      },
      sorters: {
        name: (p) => p.name,
        sku: (p) => p.sku,
        category: (p) => p.categoryName,
        price: effectivePrice,
        stock: (p) => p.stock,
        status: (p) => p.status,
        createdAt: (p) => ts(p.createdAt),
      },
      defaultSort: { by: "createdAt", dir: "desc" },
    }),
  );
}

export async function getProduct(id: string): Promise<Product> {
  await wait();
  const p = getDb().products.find((x) => x.id === id);
  if (!p) throw new ApiError("Product not found", 404);
  return clone(p);
}

function normaliseStock(input: ProductInput): ProductInput {
  return input.stock === 0 ? { ...input, stockStatus: "out_of_stock" } : input;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await wait();
  const d = getDb();
  assertProductInput(d, input);
  const product: Product = { ...normaliseStock(input), id: nextId("p"), createdAt: new Date(MOCK_NOW).toISOString() };
  d.products.unshift(product);
  return clone(product);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  await wait();
  const d = getDb();
  const idx = d.products.findIndex((p) => p.id === id);
  if (idx < 0) throw new ApiError("Product not found", 404);
  assertProductInput(d, input, id);
  const updated: Product = { ...(d.products[idx] as Product), ...normaliseStock(input) };
  d.products[idx] = updated;
  return clone(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  await wait();
  const d = getDb();
  if (!d.products.some((p) => p.id === id)) throw new ApiError("Product not found", 404);
  d.products = d.products.filter((p) => p.id !== id);
}

export async function bulkDeleteProducts(ids: string[]): Promise<BulkResult> {
  await wait();
  const d = getDb();
  const before = d.products.length;
  d.products = d.products.filter((p) => !ids.includes(p.id));
  const done = before - d.products.length;
  return { done, skipped: ids.length - done };
}

export async function bulkUpdateProductStatus(ids: string[], status: ProductStatus): Promise<BulkResult> {
  await wait();
  const d = getDb();
  let done = 0;
  d.products = d.products.map((p) => {
    if (!ids.includes(p.id)) return p;
    done += 1;
    return { ...p, status };
  });
  return { done, skipped: ids.length - done };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function allowedNextStatuses(status: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

const orderQueryOptions: QueryOptions<Order> = {
  searchText: (o) => `${o.number} ${o.customerName} ${o.customerEmail}`,
  filters: {
    status: (o, v) => o.status === v,
    payment: (o, v) => o.paymentStatus === v,
    from: (o, v) => toDateKey(o.createdAt) >= v,
    to: (o, v) => toDateKey(o.createdAt) <= v,
  },
  sorters: {
    number: (o) => ts(o.createdAt),
    createdAt: (o) => ts(o.createdAt),
    customer: (o) => o.customerName,
    items: (o) => o.itemCount,
    total: (o) => o.total,
    payment: (o) => o.paymentStatus,
    status: (o) => o.status,
  },
  defaultSort: { by: "createdAt", dir: "desc" },
};

export async function getOrders(q: ListQuery): Promise<Paginated<Order>> {
  await wait();
  return clone(runQuery(getDb().orders, q, orderQueryOptions));
}

/** All orders matching the query, un-paginated (for CSV export). */
export async function exportOrders(q: ListQuery): Promise<Order[]> {
  await wait();
  return clone(runQuery(getDb().orders, { ...q, page: 1, pageSize: 100_000 }, orderQueryOptions).items);
}

export async function getOrder(id: string): Promise<Order> {
  await wait();
  const o = getDb().orders.find((x) => x.id === id);
  if (!o) throw new ApiError("Order not found", 404);
  return clone(o);
}

function applyStatus(o: Order, status: OrderStatus): void {
  if (!ALLOWED_TRANSITIONS[o.status].includes(status))
    throw new ApiError(`An order that is ${o.status} can't be moved to ${status}.`, 409);
  o.status = status;
  o.timeline.push({ status, at: new Date(MOCK_NOW).toISOString() });
  if (status === "delivered" && o.paymentStatus === "pending" && o.paymentMethod === "cod") o.paymentStatus = "paid";
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  await wait();
  const o = getDb().orders.find((x) => x.id === id);
  if (!o) throw new ApiError("Order not found", 404);
  applyStatus(o, status);
  return clone(o);
}

export async function bulkUpdateOrderStatus(ids: string[], status: OrderStatus): Promise<BulkResult> {
  await wait();
  let done = 0;
  let skipped = 0;
  for (const o of getDb().orders.filter((x) => ids.includes(x.id))) {
    try {
      applyStatus(o, status);
      done += 1;
    } catch {
      skipped += 1;
    }
  }
  return { done, skipped, reason: skipped > 0 ? `Some orders can't move to "${status}" from their current status.` : undefined };
}

export async function refundOrder(id: string): Promise<Order> {
  await wait();
  const o = getDb().orders.find((x) => x.id === id);
  if (!o) throw new ApiError("Order not found", 404);
  if (o.paymentStatus !== "paid") throw new ApiError("Only paid orders can be refunded.", 409);
  o.paymentStatus = "refunded";
  o.timeline.push({ status: "refunded", at: new Date(MOCK_NOW).toISOString() });
  return clone(o);
}

export async function addOrderNote(id: string, text: string): Promise<Order> {
  await wait(200);
  const o = getDb().orders.find((x) => x.id === id);
  if (!o) throw new ApiError("Order not found", 404);
  o.notes.push({ id: nextId("n"), text, author: CURRENT_USER_NAME, at: new Date(MOCK_NOW).toISOString() });
  return clone(o);
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

function roleWithCount(r: Role, d: MockDb): RoleWithCount {
  return { ...r, userCount: d.users.filter((u) => u.roleId === r.id).length };
}

export async function getRoles(): Promise<RoleWithCount[]> {
  await wait();
  const d = getDb();
  return clone(d.roles.map((r) => roleWithCount(r, d)));
}

function assertRoleName(d: MockDb, name: string, selfId?: string): void {
  if (d.roles.some((r) => r.name.toLowerCase() === name.toLowerCase() && r.id !== selfId))
    throw new ApiError("Please fix the highlighted fields.", 422, { name: "A role with this name already exists" });
}

export async function createRole(input: RoleInput): Promise<Role> {
  await wait();
  const d = getDb();
  assertRoleName(d, input.name);
  const role: Role = { ...input, id: nextId("r"), isSystem: false };
  d.roles.push(role);
  return clone(role);
}

export async function updateRole(id: string, input: RoleInput): Promise<Role> {
  await wait();
  const d = getDb();
  const idx = d.roles.findIndex((r) => r.id === id);
  if (idx < 0) throw new ApiError("Role not found", 404);
  const existing = d.roles[idx] as Role;
  if (existing.id === ROLE_IDS.superAdmin) throw new ApiError("The Super Admin role can't be modified.", 403);
  if (existing.isSystem && input.name !== existing.name) throw new ApiError("System roles can't be renamed.", 403);
  assertRoleName(d, input.name, id);
  const updated: Role = { ...existing, ...input };
  d.roles[idx] = updated;
  return clone(updated);
}

export async function updateRolePermissions(id: string, permissions: PermissionMap): Promise<Role> {
  const d = getDb();
  const role = d.roles.find((r) => r.id === id);
  if (!role) {
    await wait();
    throw new ApiError("Role not found", 404);
  }
  return updateRole(id, { name: role.name, description: role.description, permissions });
}

export async function deleteRole(id: string): Promise<void> {
  await wait();
  const d = getDb();
  const role = d.roles.find((r) => r.id === id);
  if (!role) throw new ApiError("Role not found", 404);
  if (role.isSystem) throw new ApiError("System roles can't be deleted.", 403);
  const users = d.users.filter((u) => u.roleId === id).length;
  if (users > 0) throw new ApiError(`${users} user${users === 1 ? " is" : "s are"} still assigned to this role. Reassign them first.`, 409);
  d.roles = d.roles.filter((r) => r.id !== id);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

function withRole(u: User, d: MockDb): UserWithRole {
  return { ...u, roleName: d.roles.find((r) => r.id === u.roleId)?.name ?? "Unknown" };
}

function assertUserInput(d: MockDb, input: UserInput, selfId?: string): void {
  const errors: Record<string, string> = {};
  if (d.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase() && u.id !== selfId))
    errors.email = "A user with this email already exists";
  if (!d.roles.some((r) => r.id === input.roleId)) errors.roleId = "Role no longer exists";
  if (Object.keys(errors).length > 0) throw new ApiError("Please fix the highlighted fields.", 422, errors);
}

export async function getUsers(q: ListQuery): Promise<Paginated<UserWithRole>> {
  await wait();
  const d = getDb();
  const rows = d.users.map((u) => withRole(u, d));
  return clone(
    runQuery(rows, q, {
      searchText: (u) => `${u.name} ${u.email} ${u.phone}`,
      filters: { role: (u, v) => u.roleId === v, status: (u, v) => u.status === v },
      sorters: {
        name: (u) => u.name,
        email: (u) => u.email,
        role: (u) => u.roleName,
        status: (u) => u.status,
        createdAt: (u) => ts(u.createdAt),
        lastLoginAt: (u) => (u.lastLoginAt ? ts(u.lastLoginAt) : 0),
      },
      defaultSort: { by: "createdAt", dir: "desc" },
    }),
  );
}

export async function getUser(id: string): Promise<UserWithRole> {
  await wait();
  const d = getDb();
  const u = d.users.find((x) => x.id === id);
  if (!u) throw new ApiError("User not found", 404);
  return clone(withRole(u, d));
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  await wait();
  return clone(
    getDb()
      .orders.filter((o) => o.customerId === userId)
      .sort((a, b) => ts(b.createdAt) - ts(a.createdAt)),
  );
}

/** `sendInvite`: the real backend should email a one-time set-password link. No password is ever handled here. */
export async function createUser(input: UserInput & { sendInvite: boolean }): Promise<User> {
  await wait();
  const d = getDb();
  const { sendInvite, ...rest } = input;
  void sendInvite; // TODO(api): POST /users { ...rest, sendInvite } → backend sends the invite email.
  assertUserInput(d, rest);
  const user: User = {
    ...rest,
    id: nextId("u"),
    avatarUrl: null,
    createdAt: new Date(MOCK_NOW).toISOString(),
    lastLoginAt: null,
  };
  d.users.unshift(user);
  return clone(user);
}

function assertNotSelfLockout(id: string, next: { status?: UserStatus; roleId?: string }, current: User): void {
  if (id !== CURRENT_USER_ID) return;
  if (next.status && next.status !== "active") throw new ApiError("You can't disable or suspend your own account.", 409);
  if (next.roleId && next.roleId !== current.roleId && current.roleId === ROLE_IDS.superAdmin)
    throw new ApiError("You can't remove your own Super Admin role.", 409);
}

export async function updateUser(id: string, input: UserInput): Promise<User> {
  await wait();
  const d = getDb();
  const idx = d.users.findIndex((u) => u.id === id);
  if (idx < 0) throw new ApiError("User not found", 404);
  const current = d.users[idx] as User;
  assertUserInput(d, input, id);
  assertNotSelfLockout(id, { status: input.status, roleId: input.roleId }, current);
  const updated: User = { ...current, ...input };
  d.users[idx] = updated;
  return clone(updated);
}

export async function bulkUpdateUserStatus(ids: string[], status: UserStatus): Promise<BulkResult> {
  await wait();
  const d = getDb();
  let done = 0;
  let skipped = 0;
  d.users = d.users.map((u) => {
    if (!ids.includes(u.id)) return u;
    if (u.id === CURRENT_USER_ID && status !== "active") {
      skipped += 1;
      return u;
    }
    done += 1;
    return { ...u, status };
  });
  return { done, skipped, reason: skipped > 0 ? "Your own account was skipped." : undefined };
}

function assertUserDeletable(d: MockDb, id: string): void {
  if (id === CURRENT_USER_ID) throw new ApiError("You can't delete your own account.", 409);
  if (d.orders.some((o) => o.customerId === id))
    throw new ApiError("This user has order history, which must be kept for financial records. Disable the account instead.", 409);
}

export async function deleteUser(id: string): Promise<void> {
  await wait();
  const d = getDb();
  if (!d.users.some((u) => u.id === id)) throw new ApiError("User not found", 404);
  assertUserDeletable(d, id);
  d.users = d.users.filter((u) => u.id !== id);
}

export async function bulkDeleteUsers(ids: string[]): Promise<BulkResult> {
  await wait();
  const d = getDb();
  let done = 0;
  let skipped = 0;
  for (const id of ids) {
    try {
      assertUserDeletable(d, id);
      d.users = d.users.filter((u) => u.id !== id);
      done += 1;
    } catch {
      skipped += 1;
    }
  }
  return { done, skipped, reason: skipped > 0 ? "Users with orders (and your own account) can't be deleted: disable them instead." : undefined };
}

// ---------------------------------------------------------------------------
// Dashboard & reports (computed from the mock orders)
// ---------------------------------------------------------------------------

interface RangeConfig {
  windowMs: number;
  bucketMs: number;
  buckets: number;
  fmt: Intl.DateTimeFormatOptions;
}

const TZ = "Asia/Dhaka";

const RANGES: Record<RangeKey, RangeConfig> = {
  today: { windowMs: DAY_MS, bucketMs: 3_600_000, buckets: 24, fmt: { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ } },
  "7d": { windowMs: 7 * DAY_MS, bucketMs: DAY_MS, buckets: 7, fmt: { day: "numeric", month: "short", timeZone: TZ } },
  "30d": { windowMs: 30 * DAY_MS, bucketMs: DAY_MS, buckets: 30, fmt: { day: "numeric", month: "short", timeZone: TZ } },
  "90d": { windowMs: 91 * DAY_MS, bucketMs: 7 * DAY_MS, buckets: 13, fmt: { day: "numeric", month: "short", timeZone: TZ } },
  "365d": { windowMs: 365 * DAY_MS, bucketMs: (365 * DAY_MS) / 12, buckets: 12, fmt: { month: "short", year: "2-digit", timeZone: TZ } },
};

/** Revenue = orders that are not cancelled, failed or refunded. */
const countsAsRevenue = (o: Order) => o.status !== "cancelled" && o.paymentStatus !== "refunded" && o.paymentStatus !== "failed";

function changePct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function stat(value: number, change: number | null = null): SummaryStat {
  return { value, change };
}

function inWindow(iso: string, start: number, end: number): boolean {
  const t = ts(iso);
  return t >= start && t < end;
}

function buildSeries(d: MockDb, range: RangeKey): TimePoint[] {
  const cfg = RANGES[range];
  const start = MOCK_NOW - cfg.buckets * cfg.bucketMs;
  const points: TimePoint[] = Array.from({ length: cfg.buckets }, (_, i) => ({
    label: new Date(start + i * cfg.bucketMs).toLocaleString("en-GB", cfg.fmt),
    revenue: 0,
    orders: 0,
    customers: 0,
  }));
  const idx = (iso: string) => Math.floor((ts(iso) - start) / cfg.bucketMs);
  for (const o of d.orders) {
    const i = idx(o.createdAt);
    const p = points[i];
    if (i < 0 || i >= cfg.buckets || !p) continue;
    p.orders += 1;
    if (countsAsRevenue(o)) p.revenue += o.total;
  }
  for (const u of d.users) {
    if (u.roleId !== ROLE_IDS.customer) continue;
    const i = idx(u.createdAt);
    const p = points[i];
    if (i >= 0 && i < cfg.buckets && p) p.customers += 1;
  }
  return points;
}

function buildStatusSeries(d: MockDb, range: RangeKey): StatusSeriesPoint[] {
  const cfg = RANGES[range];
  const start = MOCK_NOW - cfg.buckets * cfg.bucketMs;
  const points: StatusSeriesPoint[] = Array.from({ length: cfg.buckets }, (_, i) => ({
    label: new Date(start + i * cfg.bucketMs).toLocaleString("en-GB", cfg.fmt),
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }));
  for (const o of d.orders) {
    const i = Math.floor((ts(o.createdAt) - start) / cfg.bucketMs);
    const p = points[i];
    if (i >= 0 && i < cfg.buckets && p) p[o.status] += 1;
  }
  return points;
}

function statusBreakdown(orders: Order[]): StatusSlice[] {
  const order: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
  return order.map((status) => ({ status, count: orders.filter((o) => o.status === status).length }));
}

function topProducts(orders: Order[], limit: number): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const it of o.items) {
      const cur = map.get(it.productId) ?? { productId: it.productId, name: it.name, units: 0, revenue: 0 };
      cur.units += it.quantity;
      cur.revenue += it.quantity * it.unitPrice;
      map.set(it.productId, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.units - a.units).slice(0, limit);
}

export async function getDashboard(range: RangeKey): Promise<DashboardData> {
  await wait();
  const d = getDb();
  const cfg = RANGES[range];
  const curStart = MOCK_NOW - cfg.windowMs;
  const prevStart = curStart - cfg.windowMs;
  const cur = d.orders.filter((o) => inWindow(o.createdAt, curStart, MOCK_NOW + 1));
  const prev = d.orders.filter((o) => inWindow(o.createdAt, prevStart, curStart));
  const rev = (list: Order[]) => list.filter(countsAsRevenue).reduce((s, o) => s + o.total, 0);

  const customers = d.users.filter((u) => u.roleId === ROLE_IDS.customer);
  const newCustomers = customers.filter((u) => inWindow(u.createdAt, curStart, MOCK_NOW + 1)).length;
  const newProducts = d.products.filter((p) => inWindow(p.createdAt, curStart, MOCK_NOW + 1)).length;
  const threshold = d.settings.lowStockThreshold;
  const lowStock = d.products.filter((p) => p.status === "active" && p.stock <= threshold);

  return clone({
    range,
    stats: {
      revenue: stat(rev(cur), changePct(rev(cur), rev(prev))),
      orders: stat(cur.length, changePct(cur.length, prev.length)),
      products: stat(d.products.length, changePct(d.products.length, d.products.length - newProducts)),
      customers: stat(customers.length, changePct(customers.length, customers.length - newCustomers)),
      pendingOrders: stat(d.orders.filter((o) => o.status === "pending").length),
      lowStock: stat(lowStock.length),
    },
    series: buildSeries(d, range),
    statusBreakdown: statusBreakdown(cur),
    topProducts: topProducts(cur, 6),
    recentOrders: [...d.orders].sort((a, b) => ts(b.createdAt) - ts(a.createdAt)).slice(0, 8),
    lowStockProducts: [...lowStock].sort((a, b) => a.stock - b.stock).slice(0, 6),
    newProducts: [...d.products].sort((a, b) => ts(b.createdAt) - ts(a.createdAt)).slice(0, 5),
  });
}

export async function getReports(range: RangeKey): Promise<ReportData> {
  await wait();
  const d = getDb();
  const cfg = RANGES[range];
  const start = MOCK_NOW - cfg.windowMs;
  const cur = d.orders.filter((o) => inWindow(o.createdAt, start, MOCK_NOW + 1));
  const revenue = cur.filter(countsAsRevenue).reduce((s, o) => s + o.total, 0);
  const paying = cur.filter(countsAsRevenue).length;
  return clone({
    range,
    series: buildSeries(d, range),
    statusSeries: buildStatusSeries(d, range),
    statusBreakdown: statusBreakdown(cur),
    topProducts: topProducts(cur, 10),
    totals: {
      revenue,
      orders: cur.length,
      customers: d.users.filter((u) => u.roleId === ROLE_IDS.customer && inWindow(u.createdAt, start, MOCK_NOW + 1)).length,
      avgOrderValue: paying > 0 ? revenue / paying : 0,
    },
  });
}

// ---------------------------------------------------------------------------
// Settings & session
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<StoreSettings> {
  await wait();
  return clone(getDb().settings);
}

export async function updateSettings(input: StoreSettings): Promise<StoreSettings> {
  await wait();
  getDb().settings = clone(input);
  return clone(getDb().settings);
}

export async function logout(): Promise<void> {
  await wait(150);
  // TODO(auth): call the real sign-out endpoint / NextAuth signOut().
}
