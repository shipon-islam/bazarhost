import LoginForm from "@/components/admin/LoginForm";
import { Store } from "lucide-react";

/**
 * Landing page for the admin app. The public storefront (bazarhost.com) is a
 * separate site; when this admin is merged into the main repo, remove or
 * replace this page: `/admin/*` is self-contained.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Store className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">BazarHost Admin</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your catalogue, orders and customers.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
