"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { ApiError, CURRENT_USER_ID, createUser, updateUser } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import { userSchema, type UserFormValues } from "@/validations/user";
import type { RoleWithCount } from "@/types/role";
import type { User } from "@/types/user";

/**
 * Create / edit a user. No password field by design: new users get an invite
 * email with a set-password link (MOCK: no email is actually sent).
 */
export function UserForm({ user, roles }: { user?: User; roles: RoleWithCount[] }) {
  const router = useRouter();
  const toast = useToast();
  const editing = Boolean(user);
  const self = user?.id === CURRENT_USER_ID;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? { name: user.name, email: user.email, phone: user.phone, roleId: user.roleId, status: user.status, address: user.address, sendInvite: false }
      : { name: "", email: "", phone: "", roleId: "", status: "active", address: "", sendInvite: true },
  });

  const { navigate, allowNextNavigation, dialog } = useUnsavedChanges(isDirty && !isSubmitSuccessful);
  const status = watch("status");

  const onSubmit = handleSubmit(async ({ sendInvite, ...input }) => {
    setSubmitError(null);
    try {
      if (editing && user) {
        // Role and status inputs are disabled for your own account, so keep the stored values explicitly.
        await updateUser(user.id, self ? { ...input, roleId: user.roleId, status: user.status } : input);
        toast.success("User updated", input.name);
      } else {
        await createUser({ ...input, sendInvite });
        toast.success("User created", sendInvite ? `An invite would be emailed to ${input.email} (mock: nothing was sent).` : input.name);
      }
      allowNextNavigation();
      router.push("/admin/users");
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          setError(field as keyof UserFormValues, { type: "server", message });
        }
      }
      setSubmitError(errorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {submitError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Profile">
            <div className="space-y-5">
              <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
                <Input id="name" autoComplete="off" error={errors.name?.message} {...register("name")} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                  <Input id="email" type="email" autoComplete="off" error={errors.email?.message} {...register("email")} />
                </Field>
                <Field label="Phone" htmlFor="phone" error={errors.phone?.message} hint="Optional">
                  <Input id="phone" type="tel" autoComplete="off" hasHint error={errors.phone?.message} {...register("phone")} />
                </Field>
              </div>
              <Field label="Address" htmlFor="address" error={errors.address?.message} hint="Optional">
                <Textarea id="address" rows={3} hasHint error={errors.address?.message} {...register("address")} />
              </Field>
            </div>
          </Card>

          {!editing && (
            <Card title="Access">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Send an invite email</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    The user receives a secure link to set their own password. Passwords are never entered or shown here.
                  </p>
                </div>
                <Controller
                  control={control}
                  name="sendInvite"
                  render={({ field }) => <Switch label="Send an invite email" checked={field.value} onChange={field.onChange} />}
                />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Role & status">
            <div className="space-y-5">
              <Field label="Role" htmlFor="roleId" required error={errors.roleId?.message} hint="Controls what this user can do in the admin.">
                <Select id="roleId" hasHint disabled={self} error={errors.roleId?.message} {...register("roleId")}>
                  <option value="">Select a role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Account status" htmlFor="status" error={errors.status?.message} hint="Controls whether they can log in.">
                <Select id="status" hasHint disabled={self} error={errors.status?.message} {...register("status")}>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </Field>
              {status !== "active" && (
                <p role="status" className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {status === "disabled" ? "Disabled" : "Suspended"} users cannot log in.
                </p>
              )}
              {self && <p className="text-xs text-gray-500">You can&apos;t change your own role or status.</p>}
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {isDirty && <p className="mr-auto text-sm text-amber-800">You have unsaved changes.</p>}
        <Button variant="secondary" onClick={() => navigate("/admin/users")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? "Save changes" : "Create user"}
        </Button>
      </div>
      {dialog}
    </form>
  );
}
