"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Bell, Info, Settings2, Store, UserCircle } from "lucide-react";
import { useAuth, useCan } from "@/components/admin/AuthContext";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card, Field, Input, Select, Switch } from "@/components/ui/form";
import { TabPanel, Tabs, type TabDef } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { ApiError, updateSettings } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import { settingsSchema, type SettingsFormValues } from "@/validations/settings";
import type { StoreSettings } from "@/types/settings";

type TabId = "general" | "preferences" | "notifications" | "profile";

const TABS: TabDef<TabId>[] = [
  { id: "general", label: "General", icon: <Store className="h-4 w-4" aria-hidden /> },
  { id: "preferences", label: "Preferences", icon: <Settings2 className="h-4 w-4" aria-hidden /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" aria-hidden /> },
  { id: "profile", label: "Your profile", icon: <UserCircle className="h-4 w-4" aria-hidden /> },
];

const TIMEZONES = ["Asia/Dhaka", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Europe/London", "America/New_York", "UTC"];
const CURRENCIES = [
  { value: "BDT", label: "BDT (৳) Bangladeshi taka" },
  { value: "USD", label: "USD ($) US dollar" },
  { value: "EUR", label: "EUR (€) Euro" },
  { value: "GBP", label: "GBP (£) Pound sterling" },
];

const NOTIFICATIONS: Array<{ name: keyof StoreSettings["notifications"]; label: string; hint: string }> = [
  { name: "newOrderEmail", label: "New order: email", hint: "Email the store contact whenever an order is placed." },
  { name: "newOrderSms", label: "New order: SMS", hint: "Text the support phone number for each new order." },
  { name: "lowStockEmail", label: "Low stock: email", hint: "Email when a product drops to the low-stock threshold." },
  { name: "weeklySummaryEmail", label: "Weekly summary: email", hint: "A Monday digest of sales and orders." },
];

/**
 * MOCK: "saving" updates the in-memory settings. Per the project brief, only keep
 * settings the real backend actually uses: trim this form to match once it exists.
 */
export function SettingsForm({ initial, onSaved }: { initial: StoreSettings; onSaved: () => void }) {
  const toast = useToast();
  const me = useAuth();
  const can = useCan();
  const canEdit = can("settings", "edit");
  const [tab, setTab] = useState<TabId>("general");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), defaultValues: initial });

  const { dialog } = useUnsavedChanges(isDirty);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const saved = await updateSettings(values);
      reset(saved);
      toast.success("Settings saved", "Stored in memory only (mock).");
      onSaved();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        for (const [field, message] of Object.entries(e.fieldErrors)) setError(field as keyof SettingsFormValues, { type: "server", message });
      }
      setSubmitError(errorMessage(e));
    }
  });

  // Fields on hidden tabs stay mounted-state in RHF, but errors there must be discoverable.
  const tabsWithErrors = new Set<TabId>();
  if (errors.storeName || errors.contactEmail || errors.supportPhone || errors.websiteUrl || errors.timezone || errors.currency || errors.logo) tabsWithErrors.add("general");
  if (errors.lowStockThreshold || errors.defaultLanguage || errors.weightUnit || errors.defaultOrderStatus) tabsWithErrors.add("preferences");

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl">
      {submitError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}
      {tabsWithErrors.size > 0 && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Fix the highlighted fields in: {[...tabsWithErrors].map((t) => TABS.find((x) => x.id === t)?.label).join(", ")}.
        </div>
      )}

      <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix="settings" label="Settings sections" />

      <TabPanel idPrefix="settings" id="general" active={tab === "general"}>
        <Card title="Store details">
          <fieldset disabled={!canEdit} className="space-y-5">
            <Field label="Store name" htmlFor="storeName" required error={errors.storeName?.message}>
              <Input id="storeName" error={errors.storeName?.message} {...register("storeName")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Contact email" htmlFor="contactEmail" required error={errors.contactEmail?.message}>
                <Input id="contactEmail" type="email" error={errors.contactEmail?.message} {...register("contactEmail")} />
              </Field>
              <Field label="Support phone" htmlFor="supportPhone" error={errors.supportPhone?.message}>
                <Input id="supportPhone" type="tel" error={errors.supportPhone?.message} {...register("supportPhone")} />
              </Field>
            </div>
            <Field label="Website URL" htmlFor="websiteUrl" error={errors.websiteUrl?.message}>
              <Input id="websiteUrl" type="url" placeholder="https://bazarhost.com" error={errors.websiteUrl?.message} {...register("websiteUrl")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Timezone" htmlFor="timezone" required error={errors.timezone?.message}>
                <Select id="timezone" error={errors.timezone?.message} {...register("timezone")}>
                  {TIMEZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Currency" htmlFor="currency" required error={errors.currency?.message}>
                <Select id="currency" error={errors.currency?.message} {...register("currency")}>
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">Logo</p>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <ImageUploader
                    label="Store logo"
                    max={1}
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] ?? null)}
                    error={errors.logo?.message}
                  />
                )}
              />
            </div>
          </fieldset>
        </Card>
      </TabPanel>

      <TabPanel idPrefix="settings" id="preferences" active={tab === "preferences"}>
        <Card title="Preferences">
          <fieldset disabled={!canEdit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Default language" htmlFor="defaultLanguage" error={errors.defaultLanguage?.message}>
                <Select id="defaultLanguage" error={errors.defaultLanguage?.message} {...register("defaultLanguage")}>
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bangla)</option>
                </Select>
              </Field>
              <Field label="Weight unit" htmlFor="weightUnit" error={errors.weightUnit?.message}>
                <Select id="weightUnit" error={errors.weightUnit?.message} {...register("weightUnit")}>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                </Select>
              </Field>
            </div>
            <Field label="Default status for new orders" htmlFor="defaultOrderStatus" error={errors.defaultOrderStatus?.message}>
              <Select id="defaultOrderStatus" error={errors.defaultOrderStatus?.message} {...register("defaultOrderStatus")}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </Select>
            </Field>
            <Field
              label="Low-stock threshold"
              htmlFor="lowStockThreshold"
              error={errors.lowStockThreshold?.message}
              hint="Products at or below this quantity appear in low-stock alerts."
            >
              <Input
                id="lowStockThreshold"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                hasHint
                error={errors.lowStockThreshold?.message}
                {...register("lowStockThreshold", { valueAsNumber: true })}
              />
            </Field>
          </fieldset>
        </Card>
      </TabPanel>

      <TabPanel idPrefix="settings" id="notifications" active={tab === "notifications"}>
        <Card title="Notifications" description="Choose what the store contact is alerted about.">
          <ul className="divide-y divide-gray-100">
            {NOTIFICATIONS.map((n) => (
              <li key={n.name} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.label}</p>
                  <p className="text-sm text-gray-500">{n.hint}</p>
                </div>
                <Controller
                  control={control}
                  name={`notifications.${n.name}`}
                  render={({ field }) => <Switch label={n.label} checked={field.value} disabled={!canEdit} onChange={field.onChange} />}
                />
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            UI only: no emails or SMS are sent until a notification service is connected.
          </p>
        </Card>
      </TabPanel>

      <TabPanel idPrefix="settings" id="profile" active={tab === "profile"}>
        <Card title="Your profile" description="The account you're signed in with.">
          <dl className="divide-y divide-gray-100 text-sm">
            {[
              ["Name", me.name],
              ["Email", me.email],
              ["Role", me.roleName],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-gray-600">{k}</dt>
                <dd className="font-medium text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {me.isMock
              ? "This is a placeholder identity. Profile editing and password changes need real authentication."
              : "Profile editing and password changes are handled by your identity provider."}
          </p>
        </Card>
      </TabPanel>

      {canEdit && tab !== "profile" && (
        <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {isDirty && <p className="mr-auto text-sm text-amber-800">You have unsaved changes.</p>}
          <Button variant="secondary" disabled={!isDirty || isSubmitting} onClick={() => reset(initial)}>
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
            Save settings
          </Button>
        </div>
      )}
      {dialog}
    </form>
  );
}
