"use client";

import { useCallback } from "react";
import { ErrorState } from "@/components/admin/EmptyState";
import { FormSkeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { useResource } from "@/hooks/useResource";
import { getSettings } from "@/lib/api";
import { SettingsForm } from "./SettingsForm";

export function SettingsView() {
  const loader = useCallback(() => getSettings(), []);
  const { data, error, reload } = useResource(loader);

  return (
    <>
      <PageHeader title="Settings" description="Store details, preferences and notifications." />
      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>
      ) : !data ? (
        <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6"><FormSkeleton fields={6} /></div>
      ) : (
        <SettingsForm initial={data} onSaved={reload} />
      )}
    </>
  );
}
