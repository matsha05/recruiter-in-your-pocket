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
      let statusRefreshed = false;
      try {
        const statusRes = await fetch("/api/free-status");
        const statusData = await statusRes.json();
        const reportedUses = readAuthoritativeFreeUses(statusRes.ok, statusData);
        setFreeUsesRemaining(preservePaidReportAccess(reportedUses, hasPaidAccess));
        statusRefreshed = true;
      } catch (err) {
        console.error("Failed to refresh free status:", err);
        if (fallbackDecrement) {
          setFreeUsesRemaining((prev) => preservePaidReportAccess(
            Math.max(0, prev - 1),
            hasPaidAccess
          ));
        }
      } finally {
        if (includeUserRefresh) {
          try {
            await refreshUser?.();
          } catch (error) {
            console.error("Failed to refresh account access:", error);
          }
        }
      }
      return statusRefreshed;
    },
    [hasPaidAccess, refreshUser, setFreeUsesRemaining]
  );

  useEffect(() => {
    refreshFreeStatus();
  }, [refreshFreeStatus]);

  return { refreshFreeStatus };
}
