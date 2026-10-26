import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { OrdersView } from "./OrdersView";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <RequirePermission module="orders">
      <OrdersView />
    </RequirePermission>
  );
}
