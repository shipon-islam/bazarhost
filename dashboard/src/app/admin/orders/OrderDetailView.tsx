"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, CircleDot, RotateCcw, XCircle } from "lucide-react";
import { useCan } from "@/components/admin/AuthContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ErrorState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { PAYMENT_METHOD_LABELS, StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, Field, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useResource } from "@/hooks/useResource";
import { addOrderNote, allowedNextStatuses, getOrder, refundOrder, updateOrderStatus } from "@/lib/api";
import { cn, errorMessage, formatCurrency, formatDateTime, titleCase } from "@/lib/utils";
import { orderNoteSchema, type OrderNoteValues } from "@/validations/order";
import { ORDER_FLOW, type Address, type Order, type OrderStatus } from "@/types/order";

type Pending = { kind: "status"; status: OrderStatus } | { kind: "refund" } | null;

function AddressBlock({ title, a }: { title: string; a: Address }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <address className="mt-2 text-sm not-italic leading-relaxed text-gray-700">
        <span className="font-medium text-gray-900">{a.name}</span>
        <br />
        {a.line1}
        <br />
        {a.city} {a.postalCode}
        <br />
        {a.country}
        <br />
        {a.phone}
      </address>
    </div>
  );
}

function Totals({ o }: { o: Order }) {
  const rows: Array<[string, string]> = [
    ["Subtotal", formatCurrency(o.subtotal)],
    ["Discount", o.discount > 0 ? `−${formatCurrency(o.discount)}` : formatCurrency(0)],
    ["Shipping", formatCurrency(o.shipping)],
    ["Tax", formatCurrency(o.tax)],
  ];
  return (
    <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <dt className="text-gray-600">{k}</dt>
          <dd className="text-gray-900">{v}</dd>
        </div>
      ))}
      <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
        <dt className="text-gray-900">Total</dt>
        <dd className="text-gray-900">{formatCurrency(o.total)}</dd>
      </div>
    </dl>
  );
}

function Timeline({ order }: { order: Order }) {
  const reached = new Map(order.timeline.map((t) => [t.status, t.at]));
  const cancelled = order.status === "cancelled";
  const steps = cancelled ? [...ORDER_FLOW.filter((s) => reached.has(s)), "cancelled" as const] : ORDER_FLOW;
  const extra = order.timeline.filter((t) => t.status === "refunded");

  return (
    <ol className="space-y-4" aria-label="Order progress">
      {steps.map((s) => {
        const at = reached.get(s);
        const done = at !== undefined;
        const bad = s === "cancelled";
        return (
          <li key={s} className="flex gap-3" aria-current={order.status === s ? "step" : undefined}>
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                bad ? "bg-red-100 text-red-700" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400",
              )}
            >
              {bad ? <XCircle className="h-4 w-4" aria-hidden /> : done ? <Check className="h-4 w-4" aria-hidden /> : <CircleDot className="h-4 w-4" aria-hidden />}
            </span>
            <div>
              <p className={cn("text-sm font-medium", done ? "text-gray-900" : "text-gray-500")}>{titleCase(s)}</p>
              <p className="text-xs text-gray-500">{at ? formatDateTime(at) : "Not yet"}</p>
            </div>
          </li>
        );
      })}
      {extra.map((t) => (
        <li key={t.at} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">Payment refunded</p>
            <p className="text-xs text-gray-500">{formatDateTime(t.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Notes({ order, onUpdated, canEdit }: { order: Order; onUpdated: (o: Order) => void; canEdit: boolean }) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderNoteValues>({ resolver: zodResolver(orderNoteSchema), defaultValues: { text: "" } });

  const submit = handleSubmit(async ({ text }) => {
    try {
      onUpdated(await addOrderNote(order.id, text));
      reset({ text: "" });
      toast.success("Note added");
    } catch (e) {
      toast.error("Couldn't add note", errorMessage(e));
    }
  });

  return (
    <Card title="Internal notes" description="Only visible to staff.">
      {order.notes.length === 0 ? (
        <p className="text-sm text-gray-600">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {order.notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="whitespace-pre-line text-gray-800">{n.text}</p>
              <p className="mt-1.5 text-xs text-gray-500">
                {n.author} · {formatDateTime(n.at)}
              </p>
            </li>
          ))}
        </ul>
      )}
      {canEdit && (
        <form onSubmit={submit} noValidate className="mt-4 space-y-3">
          <Field label="Add a note" htmlFor="note" error={errors.text?.message}>
            <Textarea id="note" rows={3} error={errors.text?.message} {...register("text")} />
          </Field>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Add note
          </Button>
        </form>
      )}
    </Card>
  );
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const can = useCan();
  const toast = useToast();
  const loader = useCallback(() => getOrder(orderId), [orderId]);
  const { data: order, error, reload, setData } = useResource(loader);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const canEdit = can("orders", "edit");

  const run = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "status") {
        setData(await updateOrderStatus(orderId, pending.status));
        toast.success(`Order marked ${pending.status}`);
      } else {
        setData(await refundOrder(orderId));
        toast.success("Payment marked as refunded", "Mock only: no money was moved.");
      }
      setPending(null);
    } catch (e) {
      toast.error("Action failed", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <>
        <PageHeader title="Order" backHref="/admin/orders" backLabel="Back to orders" />
        <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>
      </>
    );
  }
  if (!order) {
    return (
      <>
        <PageHeader title="Order" backHref="/admin/orders" backLabel="Back to orders" />
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </>
    );
  }

  const next = allowedNextStatuses(order.status);
  const forward = next.filter((s) => s !== "cancelled");
  const canCancel = next.includes("cancelled");

  return (
    <>
      <PageHeader
        title={`Order ${order.number}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        backHref="/admin/orders"
        backLabel="Back to orders"
        meta={<StatusBadge kind="order" status={order.status} />}
        actions={
          canEdit && (
            <>
              {forward.map((s) => (
                <Button key={s} onClick={() => setPending({ kind: "status", status: s })}>
                  Mark as {s}
                </Button>
              ))}
              {order.paymentStatus === "paid" && (
                <Button variant="secondary" onClick={() => setPending({ kind: "refund" })}>
                  <RotateCcw className="h-4 w-4" aria-hidden /> Refund
                </Button>
              )}
              {canCancel && (
                <Button variant="danger-outline" onClick={() => setPending({ kind: "status", status: "cancelled" })}>
                  Cancel order
                </Button>
              )}
            </>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Items" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <caption className="sr-only">Items in this order</caption>
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th scope="col" className="px-5 py-3">Product</th>
                    <th scope="col" className="px-5 py-3 text-right">Unit price</th>
                    <th scope="col" className="px-5 py-3 text-right">Qty</th>
                    <th scope="col" className="px-5 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((it) => (
                    <tr key={`${it.productId}-${it.sku}`}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{it.name}</p>
                        <p className="font-mono text-xs text-gray-500">{it.sku}</p>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(it.unitPrice)}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{it.quantity}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 p-5">
              <Totals o={order} />
            </div>
          </Card>

          <Card title="Customer & addresses">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</h3>
                <p className="mt-2 text-sm font-medium text-gray-900">{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.customerEmail}</p>
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
              </div>
              <AddressBlock title="Shipping address" a={order.shippingAddress} />
              <AddressBlock title="Billing address" a={order.billingAddress} />
            </div>
          </Card>

          <Notes order={order} onUpdated={setData} canEdit={canEdit} />
        </div>

        <div className="space-y-6">
          <Card title="Payment">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-600">Method</dt>
                <dd className="font-medium text-gray-900">{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-600">Status</dt>
                <dd><StatusBadge kind="payment" status={order.paymentStatus} /></dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-600">Transaction ID</dt>
                <dd className="font-mono text-xs text-gray-900">{order.transactionId ?? "—"}</dd>
              </div>
            </dl>
          </Card>
          <Card title="Progress">
            <Timeline order={order} />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        loading={busy}
        tone={pending?.kind === "refund" || (pending?.kind === "status" && pending.status === "cancelled") ? "danger" : "primary"}
        title={
          pending?.kind === "refund"
            ? "Refund this payment?"
            : pending?.status === "cancelled"
              ? "Cancel this order?"
              : `Mark order as ${pending?.status ?? ""}?`
        }
        description={
          pending?.kind === "refund"
            ? `The ${formatCurrency(order.total)} payment will be marked as refunded. Order records are kept for accounting.`
            : pending?.status === "cancelled"
              ? "A cancelled order can't be reopened. The order record is kept for accounting."
              : "The customer's order timeline will be updated."
        }
        confirmLabel={pending?.kind === "refund" ? "Refund payment" : pending?.status === "cancelled" ? "Cancel order" : "Update status"}
        cancelLabel="Go back"
        onConfirm={run}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
