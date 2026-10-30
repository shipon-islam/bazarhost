import { apiFetch } from "@/lib/api";
import { LoginUserBody } from "@/types/user";

export const loginAuth = async (body: LoginUserBody) => {
  return await apiFetch("/auth/login", {
    method: "POST",
    body: body,
  });
};

export async function logoutAuth(): Promise<void> {
  await apiFetch("/auth/logout", {
    method: "POST",
  });
}
