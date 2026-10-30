import { apiFetch } from "@/lib/api";
import type { ListResponse, Paginated } from "@/types/common";
import { Role } from "@/types/role";

export async function getRoles(): Promise<Paginated<Role>> {
  const res = await apiFetch<ListResponse<Role>>("/roles");
  return { items: res.data, meta: res.meta };
}
