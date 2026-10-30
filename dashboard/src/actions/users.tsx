import { apiFetch, BulkResult } from "@/lib/api";
import { toParams } from "@/lib/query";
import type { ListQuery, ListResponse, Paginated } from "@/types/common";
import { User, UserInput, UserStatus, UserWithRole } from "@/types/user";

export async function getUsers(q: ListQuery): Promise<Paginated<UserWithRole>> {
  const res = await apiFetch<ListResponse<UserWithRole>>("/users", {
    query: toParams(q),
  });
  return { items: res.data, meta: res.meta };
}

export async function updateUser(id: string, input: UserInput) {
  const res = await apiFetch<ListResponse<User>>("/users/" + id, {
    method: "PUT",
    body: input,
  });
  console.log(res);
  return res;
}
export async function updateUserStatus(id: string, status: UserStatus) {
  const res = await apiFetch<ListResponse<User>>("/users/" + id + "/status", {
    method: "PATCH",
    body: { status },
  });
  console.log(res);
  return res;
}

export async function bulkUpdateUserStatus(
  ids: string[],
  status: UserStatus,
): Promise<BulkResult> {
  const res = await apiFetch<ListResponse<User>>("/users/bulk", {
    method: "POST",
    body: { action: "status", ids, status },
  });
  console.log(res);
  return res;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await apiFetch<ListResponse<User>>("/users/" + id, {
    method: "DELETE",
  });
  console.log(res);
}

export async function bulkDeleteUsers(ids: string[]): Promise<BulkResult> {
  const res = await apiFetch<ListResponse<User>>("/users/bulk", {
    method: "POST",
    body: { action: "delete", ids },
  });
  console.log(res);
  return res;
}
