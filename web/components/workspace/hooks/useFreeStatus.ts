import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { preservePaidReportAccess } from "@/lib/billing/freeStatusClient";
import { refreshFreeStatusBalance } from "@/lib/free-status-client";

type RefreshOptions = {
  fallbackDecrement?: boolean;
  includeUserRefresh?: boolean;
  requireOk?: boolean;
  shouldApply?: () => boolean;
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
    async ({ fallbackDecrement = false, includeUserRefresh = false, shouldApply }: RefreshOptions = {}) => {
      const refreshed = await refreshFreeStatusBalance({
        fallbackDecrement,
        setRemaining: (value) => setFreeUsesRemaining((previous) => {
          const reported = typeof value === "function" ? value(previous) : value;
          return preservePaidReportAccess(reported, hasPaidAccess);
        }),
        shouldApply,
      });
      if (!refreshed) console.error("Failed to refresh free status.");
      if (includeUserRefresh && (!shouldApply || shouldApply())) {
        try {
          await refreshUser?.();
        } catch (userError) {
          console.error("Failed to refresh user after free status:", userError);
        }
      }
      return refreshed;
    },
    [hasPaidAccess, refreshUser, setFreeUsesRemaining]
  );

  useEffect(() => {
    refreshFreeStatus();
  }, [refreshFreeStatus]);

  return { refreshFreeStatus };
}
