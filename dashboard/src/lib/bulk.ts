import type { BulkResult } from "@/lib/api";

interface ToastLike {
  success: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

/** Reports the outcome of a bulk action, calling out anything that was skipped. */
export function reportBulk(toast: ToastLike, noun: string, verb: string, res: BulkResult): void {
  const plural = res.done === 1 ? noun : `${noun}s`;
  if (res.skipped > 0) {
    toast.info(`${res.done} ${plural} ${verb}, ${res.skipped} skipped`, res.reason);
  } else {
    toast.success(`${res.done} ${plural} ${verb}`);
  }
}
