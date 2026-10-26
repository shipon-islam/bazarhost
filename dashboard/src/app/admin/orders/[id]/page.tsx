import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { OrderDetailView } from "../OrderDetailView";

export const metadata: Metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission module="orders">
      <OrderDetailView orderId={id} />
    </RequirePermission>
  );
}
