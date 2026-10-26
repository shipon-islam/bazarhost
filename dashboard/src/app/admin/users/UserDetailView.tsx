"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Ban, CheckCircle2, Pencil, ShoppingBag } from "lucide-react";
import { useCan } from "@/components/admin/AuthContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Thumb } from "@/components/admin/Thumb";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useResource } from "@/hooks/useResource";
import { CURRENT_USER_ID, getUser, getUserOrders, updateUser } from "@/lib/api";
import { errorMessage, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export function UserDetailView({ userId }: { userId: string }) {
  const can = useCan();
  const toast = useToast();
  const loader = useCallback(async () => {
    const [user, orders] = await Promise.all([getUser(userId), getUserOrders(userId)]);
    return { user, orders };
  }, [userId]);
  const { data, error, reload } = useResource(loader);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (error) {
    return (
      <>
        <PageHeader title="User" backHref="/admin/users" backLabel="Back to users" />
        <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>
      </>
    );
  }
  if (!data) {
    return (
      <>
        <PageHeader title="User" backHref="/admin/users" backLabel="Back to users" />
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
          <Skeleton className="h-72" />
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
      </>
    );
  }

  const { user: u, orders } = data;
  const self = u.id === CURRENT_USER_ID;
  const active = u.status === "active";
  const spent = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);

  const toggleStatus = async () => {
    setBusy(true);
    try {
      await updateUser(u.id, {
        name: u.name,
        email: u.email,
        phone: u.phone,
        roleId: u.roleId,
        address: u.address,
        status: active ? "disabled" : "active",
      });
      toast.success(active ? "Account disabled" : "Account reactivated", u.name);
      setConfirming(false);
      reload();
    } catch (e) {
      toast.error("Action failed", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={u.name}
        description={u.email}
        backHref="/admin/users"
        backLabel="Back to users"
        meta={<StatusBadge kind="user" status={u.status} />}
        actions={
          <>
            {can("users", "edit") && !self && (
              <Button variant={active ? "danger-outline" : "secondary"} onClick={() => setConfirming(true)}>
                {active ? <Ban className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
                {active ? "Disable account" : "Reactivate"}
              </Button>
            )}
            {can("users", "edit") && (
              <LinkButton href={`/admin/users/${u.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden /> Edit user
              </LinkButton>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card title="Profile">
            <div className="flex items-center gap-3">
              <Thumb src={u.avatarUrl} name={u.name} size={56} rounded="full" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-600">{u.roleName}</p>
              </div>
            </div>
            <dl className="mt-4 divide-y divide-gray-100 text-sm">
              {[
                ["Email", u.email],
                ["Phone", u.phone || "—"],
                ["Address", u.address || "—"],
                ["Registered", formatDate(u.createdAt)],
                ["Last login", u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-gray-600">{k}</dt>
                  <dd className="text-right font-medium text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
            {!active && (
              <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                This account is {u.status}: the user cannot log in.
              </p>
            )}
          </Card>
          <Card title="Account activity">
            <p className="text-sm text-gray-600">
              Detailed audit logs aren&apos;t available yet. This needs an audit-log endpoint on the backend (see README).
            </p>
          </Card>
        </div>

        <Card
          title="Order history"
          description={orders.length > 0 ? `${orders.length} order${orders.length === 1 ? "" : "s"} · ${formatCurrency(spent)} paid` : undefined}
          className="lg:col-span-2"
          padded={false}
        >
          {orders.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" description="This user hasn't placed any orders." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <caption className="sr-only">Orders placed by {u.name}</caption>
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th scope="col" className="px-5 py-3">Order</th>
                    <th scope="col" className="px-5 py-3">Date</th>
                    <th scope="col" className="px-5 py-3 text-right">Total</th>
                    <th scope="col" className="px-5 py-3">Payment</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3">
                        {can("orders", "view") ? (
                          <Link href={`/admin/orders/${o.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                            {o.number}
                          </Link>
                        ) : (
                          <span className="font-medium text-gray-900">{o.number}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(o.total)}</td>
                      <td className="px-5 py-3"><StatusBadge kind="payment" status={o.paymentStatus} /></td>
                      <td className="px-5 py-3"><StatusBadge kind="order" status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirming}
        loading={busy}
        tone={active ? "danger" : "primary"}
        title={active ? `Disable ${u.name}?` : `Reactivate ${u.name}?`}
        description={
          active
            ? "Disabled users cannot log in. Their data and order history are kept, and you can reactivate the account at any time."
            : "They will be able to log in again straight away."
        }
        confirmLabel={active ? "Disable account" : "Reactivate"}
        onConfirm={toggleStatus}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
