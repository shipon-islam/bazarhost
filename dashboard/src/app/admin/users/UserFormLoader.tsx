"use client";

import { useCallback } from "react";
import { ErrorState } from "@/components/admin/EmptyState";
import { FormSkeleton } from "@/components/admin/LoadingSkeleton";
import { useResource } from "@/hooks/useResource";
import { getRoles, getUser } from "@/lib/api";
import { UserForm } from "./UserForm";

export function UserFormLoader({ userId }: { userId?: string }) {
  const loader = useCallback(async () => {
    const [roles, user] = await Promise.all([getRoles(), userId ? getUser(userId) : Promise.resolve(undefined)]);
    return { roles, user };
  }, [userId]);
  const { data, error, reload } = useResource(loader);

  if (error) return <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data) return <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6"><FormSkeleton fields={5} /></div>;
  return <UserForm user={data.user} roles={data.roles} />;
}
