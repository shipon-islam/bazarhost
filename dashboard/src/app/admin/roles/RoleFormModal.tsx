"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ApiError, createRole, updateRole } from "@/lib/api";
import { emptyPermissions } from "@/lib/permissions";
import { errorMessage } from "@/lib/utils";
import { roleSchema, type RoleFormValues } from "@/validations/role";
import type { Role } from "@/types/role";

/** Create a role (no permissions yet) or edit a role's name / description. MOCK: in-memory only. */
export function RoleFormModal({
  open,
  role,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Omit to create. */
  role?: Role;
  onClose: () => void;
  onSaved: (role: Role) => void;
}) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: role?.name ?? "", description: role?.description ?? "" },
  });

  useEffect(() => {
    if (open) reset({ name: role?.name ?? "", description: role?.description ?? "" });
  }, [open, role, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      const saved = role
        ? await updateRole(role.id, { ...values, permissions: role.permissions })
        : await createRole({ ...values, permissions: emptyPermissions() });
      toast.success(role ? "Role updated" : "Role created", saved.name);
      onSaved(saved);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          setError(field as keyof RoleFormValues, { type: "server", message });
        }
      } else {
        toast.error("Couldn't save role", errorMessage(e));
      }
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!isSubmitting}
      title={role ? "Edit role" : "New role"}
      description={role ? undefined : "Create the role, then choose its permissions in the matrix."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" loading={isSubmitting}>
            {role ? "Save changes" : "Create role"}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Role name" htmlFor="role-name" required error={errors.name?.message}>
          <Input id="role-name" autoComplete="off" disabled={role?.isSystem} error={errors.name?.message} {...register("name")} />
        </Field>
        <Field label="Description" htmlFor="role-description" error={errors.description?.message}>
          <Textarea id="role-description" rows={3} error={errors.description?.message} {...register("description")} />
        </Field>
      </form>
    </Modal>
  );
}
