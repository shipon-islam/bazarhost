"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

/**
 * Warns before the user loses unsaved form edits.
 *
 *  - Tab close / refresh → the browser's native beforeunload prompt.
 *  - In-app link clicks (sidebar, breadcrumbs…) → our confirm dialog.
 *  - `navigate(href)` → use for the form's Cancel button.
 *
 * Limitation: the browser Back button can't be intercepted reliably in the App
 * Router, so it is not covered.
 */
export function useUnsavedChanges(dirty: boolean): {
  navigate: (href: string) => void;
  /** Call right before a deliberate navigation after a successful save. */
  allowNextNavigation: () => void;
  dialog: ReactNode;
} {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  const bypassRef = useRef(false);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current || bypassRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || bypassRef.current) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setPending(url.pathname + url.search);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (dirtyRef.current && !bypassRef.current) setPending(href);
      else router.push(href);
    },
    [router],
  );

  const allowNextNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title="Discard unsaved changes?"
      description="You have edits that haven't been saved. If you leave now, they will be lost."
      confirmLabel="Discard and leave"
      cancelLabel="Keep editing"
      tone="danger"
      onCancel={() => setPending(null)}
      onConfirm={() => {
        const href = pending;
        bypassRef.current = true;
        setPending(null);
        if (href) router.push(href);
      }}
    />
  );

  return { navigate, allowNextNavigation, dialog };
}
