"use client";

import { useCallback, useState } from "react";
import { Info, Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth, useCan } from "@/components/admin/AuthContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/admin/EmptyState";
import { CardListSkeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, Checkbox } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useResource } from "@/hooks/useResource";
import { deleteRole, getRoles, updateRolePermissions } from "@/lib/api";
import { summarizePermissions } from "@/lib/permissions";
import { cn, errorMessage } from "@/lib/utils";
import {
  MODULE_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionMap,
  type PermissionModule,
  type RoleWithCount,
} from "@/types/role";
import { RoleFormModal } from "./RoleFormModal";

const SUPER_ADMIN_ID = "r-super-admin";

function samePermissions(a: PermissionMap, b: PermissionMap): boolean {
  return PERMISSION_MODULES.every((m) => {
    const x = [...(a[m] ?? [])].sort().join();
    const y = [...(b[m] ?? [])].sort().join();
    return x === y;
  });
}

function lostAny(before: PermissionMap, after: PermissionMap): boolean {
  return PERMISSION_MODULES.some((m) => (before[m] ?? []).some((a) => !(after[m] ?? []).includes(a)));
}

type Dialog = "create" | "edit" | "delete" | "discard" | "self-lockout" | null;

export function RolesView() {
  const can = useCan();
  const toast = useToast();
  const me = useAuth();
  const loader = useCallback(() => getRoles(), []);
  const { data: roles, error, reload } = useResource(loader);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ roleId: string; perms: PermissionMap } | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [switchTarget, setSwitchTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canEdit = can("roles", "edit");
  const canCreate = can("roles", "create");
  const canDelete = can("roles", "delete");

  const selected: RoleWithCount | undefined = roles?.find((r) => r.id === selectedId) ?? roles?.[0];
  const locked = selected?.id === SUPER_ADMIN_ID;
  const perms: PermissionMap | undefined = selected
    ? draft && draft.roleId === selected.id
      ? draft.perms
      : selected.permissions
    : undefined;
  const dirty = Boolean(selected && perms && !samePermissions(perms, selected.permissions));

  const select = (id: string) => {
    if (selected && id === selected.id) return;
    if (dirty) {
      setSwitchTarget(id);
      setDialog("discard");
    } else {
      setSelectedId(id);
      setDraft(null);
    }
  };

  const setCell = (module: PermissionModule, action: PermissionAction, on: boolean) => {
    if (!selected || !perms) return;
    let next = new Set(perms[module] ?? []);
    if (on) {
      next.add(action);
      next.add("view"); // can't create/edit/delete what you can't see
    } else {
      next.delete(action);
      if (action === "view") next = new Set(); // removing view removes everything for the module
    }
    const ordered = PERMISSION_ACTIONS.filter((a) => next.has(a));
    setDraft({ roleId: selected.id, perms: { ...perms, [module]: ordered } });
  };

  const setRow = (module: PermissionModule, on: boolean) => {
    if (!selected || !perms) return;
    setDraft({ roleId: selected.id, perms: { ...perms, [module]: on ? [...PERMISSION_ACTIONS] : [] } });
  };

  const save = async () => {
    if (!selected || !perms) return;
    setBusy(true);
    try {
      await updateRolePermissions(selected.id, perms);
      toast.success("Permissions saved", `${selected.name}: mock only, not enforced by a server yet.`);
      setDraft(null);
      setDialog(null);
      reload();
    } catch (e) {
      toast.error("Couldn't save permissions", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const requestSave = () => {
    if (!selected || !perms) return;
    // Warn before removing access from the role the signed-in admin belongs to.
    if (selected.name === me.roleName && lostAny(selected.permissions, perms)) setDialog("self-lockout");
    else void save();
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await deleteRole(selected.id);
      toast.success("Role deleted", selected.name);
      setSelectedId(null);
      setDraft(null);
      setDialog(null);
      reload();
    } catch (e) {
      toast.error("Couldn't delete role", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteBlockedReason = !selected
    ? ""
    : selected.isSystem
      ? "System roles can't be deleted."
      : selected.userCount > 0
        ? `${selected.userCount} user${selected.userCount === 1 ? " is" : "s are"} assigned to this role. Reassign them before deleting it.`
        : "";

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Decide who can see and change what in the admin."
        actions={
          canCreate && (
            <Button onClick={() => setDialog("create")}>
              <Plus className="h-4 w-4" aria-hidden /> New role
            </Button>
          )
        }
      />

      <div role="note" className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          <strong className="font-semibold">Placeholder:</strong> these permissions control what this admin interface shows, and are held in
          memory only. They are <strong className="font-semibold">not</strong> a security boundary. The backend must check the signed-in
          user&apos;s permissions on every request before this can be relied on.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>
      ) : !roles ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6"><CardListSkeleton rows={5} /></div>
      ) : roles.length === 0 || !selected || !perms ? (
        <div className="rounded-xl border border-gray-200 bg-white"><EmptyState icon={ShieldCheck} title="No roles yet" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <nav aria-label="Roles" className="lg:col-span-1">
            <ul className="space-y-2">
              {roles.map((r) => {
                const active = r.id === selected.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => select(r.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left shadow-sm transition-colors",
                        active ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-medium text-gray-900">
                          {r.name}
                          {r.isSystem && <Lock className="h-3.5 w-3.5 text-gray-400" aria-label="System role" />}
                        </span>
                        <span className="text-xs text-gray-500">
                          {r.userCount} user{r.userCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{r.description}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-6 lg:col-span-2">
            <Card
              title={selected.name}
              description={selected.description}
              actions={
                <div className="flex shrink-0 gap-2">
                  {canEdit && !locked && (
                    <Button size="sm" variant="secondary" onClick={() => setDialog("edit")}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="danger-outline"
                      disabled={deleteBlockedReason !== ""}
                      title={deleteBlockedReason || undefined}
                      onClick={() => setDialog("delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                    </Button>
                  )}
                </div>
              }
            >
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Summary: </span>
                {summarizePermissions(perms)}
              </p>
              {deleteBlockedReason && canDelete && <p className="mt-2 text-xs text-gray-500">{deleteBlockedReason}</p>}
            </Card>

            <Card title="Permissions" padded={false}>
              {locked && (
                <p className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3 text-sm text-gray-700">
                  <Lock className="h-4 w-4" aria-hidden /> Super Admin always has full access and can&apos;t be changed.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                  <caption className="sr-only">Permissions for the {selected.name} role</caption>
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <tr>
                      <th scope="col" className="px-5 py-3">Module</th>
                      {PERMISSION_ACTIONS.map((a) => (
                        <th key={a} scope="col" className="px-4 py-3 text-center capitalize">{a}</th>
                      ))}
                      <th scope="col" className="px-4 py-3 text-center">All</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {PERMISSION_MODULES.map((m) => {
                      const granted = perms[m] ?? [];
                      const all = granted.length === PERMISSION_ACTIONS.length;
                      return (
                        <tr key={m}>
                          <th scope="row" className="px-5 py-3 font-medium text-gray-900">{MODULE_LABELS[m]}</th>
                          {PERMISSION_ACTIONS.map((a) => (
                            <td key={a} className="px-4 py-3 text-center">
                              <Checkbox
                                aria-label={`${selected.name} can ${a} ${MODULE_LABELS[m].toLowerCase()}`}
                                checked={granted.includes(a)}
                                disabled={!canEdit || locked}
                                onChange={(e) => setCell(m, a, e.target.checked)}
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <Checkbox
                              aria-label={`Grant all ${MODULE_LABELS[m].toLowerCase()} permissions to ${selected.name}`}
                              checked={all}
                              disabled={!canEdit || locked}
                              onChange={(e) => setRow(m, e.target.checked)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {canEdit && !locked && (
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-3">
                  {dirty && <p className="mr-auto text-sm text-amber-800">You have unsaved permission changes.</p>}
                  <Button variant="secondary" disabled={!dirty || busy} onClick={() => setDraft(null)}>
                    Reset
                  </Button>
                  <Button disabled={!dirty} loading={busy && dialog === null} onClick={requestSave}>
                    Save permissions
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <RoleFormModal
        open={dialog === "create"}
        onClose={() => setDialog(null)}
        onSaved={(r) => {
          setDialog(null);
          setSelectedId(r.id);
          setDraft(null);
          reload();
        }}
      />
      <RoleFormModal
        open={dialog === "edit"}
        role={selected}
        onClose={() => setDialog(null)}
        onSaved={() => {
          setDialog(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        loading={busy}
        tone="danger"
        title={`Delete the ${selected?.name ?? ""} role?`}
        description="This removes the role permanently. No users are assigned to it."
        confirmLabel="Delete role"
        onConfirm={remove}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "discard"}
        title="Discard unsaved changes?"
        description="You changed permissions for this role but haven't saved them."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          setDraft(null);
          if (switchTarget) setSelectedId(switchTarget);
          setSwitchTarget(null);
          setDialog(null);
        }}
        onCancel={() => {
          setSwitchTarget(null);
          setDialog(null);
        }}
      />
      <ConfirmDialog
        open={dialog === "self-lockout"}
        loading={busy}
        tone="danger"
        title="You may lose access"
        description={`You're signed in with the ${me.roleName} role. Removing its permissions could lock you out of parts of the admin, including this page.`}
        confirmLabel="Save anyway"
        cancelLabel="Go back"
        onConfirm={save}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}
