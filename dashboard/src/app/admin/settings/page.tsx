import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { SettingsView } from "./SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <RequirePermission module="settings">
      <SettingsView />
    </RequirePermission>
  );
}
