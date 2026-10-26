/**
 * Central API client for the admin.
 *
 * Today every function is served by the in-memory MOCK service (src/mock/service.ts).
 * To connect the real backend, replace a function's body with a `request()` call.
 * The expected endpoints and payloads are listed in README.md ("API integration").
 *
 *   export const getProducts = (q: ListQuery) =>
 *     request<Paginated<ProductRow>>("/products", { query: q });
 *
 * UI code must only import from this file (never from src/mock/*), so swapping
 * the implementation requires no component changes.
 */
import { ApiError } from "./errors";
import type { ListQuery } from "@/types/common";

export { ApiError } from "./errors";
export {
  CURRENT_USER_ID,
  addOrderNote,
  allowedNextStatuses,
  bulkDeleteCategories,
  bulkDeleteProducts,
  bulkDeleteUsers,
  bulkUpdateCategoryStatus,
  bulkUpdateOrderStatus,
  bulkUpdateProductStatus,
  bulkUpdateUserStatus,
  categoryDescendantIds,
  createCategory,
  createProduct,
  createRole,
  createUser,
  deleteCategory,
  deleteProduct,
  deleteRole,
  deleteUser,
  exportOrders,
  getAllCategories,
  getCategories,
  getCategory,
  getDashboard,
  getOrder,
  getOrders,
  getProduct,
  getProducts,
  getReports,
  getRoles,
  getSettings,
  getUser,
  getUserOrders,
  getUsers,
  logout,
  refundOrder,
  updateCategory,
  updateOrderStatus,
  updateProduct,
  updateRole,
  updateRolePermissions,
  updateSettings,
  updateUser,
} from "@/mock/service";
export type { BulkResult } from "@/mock/service";

// ---------------------------------------------------------------------------
// Real-backend helper (not used by the mock service yet)
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: ListQuery | Record<string, string | number | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

function toSearchParams(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  const add = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== "" && v !== "all") params.set(k, String(v));
  };
  for (const [key, value] of Object.entries(query)) {
    if (key === "filters" && value && typeof value === "object") {
      for (const [fk, fv] of Object.entries(value as Record<string, string>)) add(fk, fv);
    } else if (typeof value === "string" || typeof value === "number") {
      add(key, value);
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

/**
 * Typed fetch wrapper. Sends cookies (`credentials: "include"`) so an httpOnly
 * session cookie issued by the backend is used: do NOT store tokens in
 * localStorage. Maps non-2xx responses to `ApiError` (expects `{ message, errors? }`).
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}${toSearchParams(options.query)}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fieldErrors: Record<string, string> | undefined;
    try {
      const data = (await res.json()) as { message?: string; errors?: Record<string, string> };
      if (data.message) message = data.message;
      fieldErrors = data.errors;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status, fieldErrors);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
