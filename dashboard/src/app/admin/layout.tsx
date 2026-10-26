import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin" };

// Always evaluate auth per request: never cache an authenticated shell.
export const dynamic = "force-dynamic";

/** Wraps every /admin page. Access is decided on the server before any UI renders. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LockKeyhole className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
          <p className="mt-2 text-sm text-gray-600">
            You need to sign in with an administrator account to view this area.
          </p>
          <p className="mt-4 rounded-lg bg-gray-50 p-3 text-left text-xs text-gray-600">
            <strong className="font-semibold text-gray-800">For developers:</strong> real authentication isn&apos;t connected yet.
            Implement <code>getCurrentUser()</code> in <code>src/lib/auth.ts</code>, or set <code>ALLOW_MOCK_AUTH=true</code> for a
            private demo only.
          </p>
        </div>
      </main>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
