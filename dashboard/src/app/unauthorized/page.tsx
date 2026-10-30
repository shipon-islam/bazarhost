"use client";
import { ArrowLeft, Home, LockKeyhole, ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <ShieldX size={40} strokeWidth={1.6} />
        </div>

        {/* Status */}
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
          Error 403
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Access denied
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
          Sorry, you don&apos;t have permission to access this page. Please
          contact your administrator if you believe this is a mistake.
        </p>

        {/* Notice */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <LockKeyhole size={20} className="mt-0.5 shrink-0 text-slate-500" />

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Restricted area
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Your account may not have the required role or permissions to view
              the admin dashboard.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Home size={18} />
            Login Page
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-slate-500 dark:text-slate-500">
          If you need access, please contact your system administrator.
        </p>
      </div>
    </main>
  );
}
