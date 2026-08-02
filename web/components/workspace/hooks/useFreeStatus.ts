import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  preservePaidReportAccess,
  readAuthoritativeFreeUses,
} from "@/lib/billing/freeStatusClient";

type RefreshOptions = {
  fallbackDecrement?: boolean;
  includeUserRefresh?: boolean;
  requireOk?: boolean;
};

type FreeStatusOptions = {
  refreshUser?: () => Promise<void>;
  setFreeUsesRemaining: Dispatch<SetStateAction<number>>;
  hasPaidAccess: boolean;
};

export function useFreeStatus({
  refreshUser,
  setFreeUsesRemaining,
  hasPaidAccess,
}: FreeStatusOptions) {
  const refreshFreeStatus = useCallback(
    async ({ fallbackDecrement = false, includeUserRefresh = false }: RefreshOptions = {}) => {
      try {
        const statusRes = await fetch("/api/free-status");
        const statusData = await statusRes.json();
        const reportedUses = readAuthoritativeFreeUses(statusRes.ok, statusData);
        setFreeUsesRemaining(preservePaidReportAccess(reportedUses, hasPaidAccess));

        if (includeUserRefresh) {
          await refreshUser?.();
        }
        return true;
      } catch (err) {
        console.error("Failed to refresh free status:", err);
        if (fallbackDecrement) {
          setFreeUsesRemaining((prev) => preservePaidReportAccess(
            Math.max(0, prev - 1),
            hasPaidAccess
          ));
        }
        return false;
      }
    },
    [hasPaidAccess, refreshUser, setFreeUsesRemaining]
  );

  useEffect(() => {
    refreshFreeStatus();
  }, [refreshFreeStatus]);

  return { refreshFreeStatus };
}
