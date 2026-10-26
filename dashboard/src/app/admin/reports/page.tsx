import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { ReportsView } from "./ReportsView";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <RequirePermission module="reports">
      <ReportsView />
    </RequirePermission>
  );
}
