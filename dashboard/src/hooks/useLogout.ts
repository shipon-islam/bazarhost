"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { logout as apiLogout } from "@/lib/api";
import { errorMessage } from "@/lib/utils";

export function useLogout() {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const logout = useCallback(async () => {
    setPending(true);
    try {
      await apiLogout();
      toast.info("Signed out", "Placeholder auth: no real session existed to end.");
      router.push("/");
    } catch (e) {
      toast.error("Couldn't sign out", errorMessage(e));
    } finally {
      setPending(false);
    }
  }, [router, toast]);

  return { logout, pending };
}
