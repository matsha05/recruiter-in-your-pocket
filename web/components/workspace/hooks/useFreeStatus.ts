import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
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
  accountId: string | null;
  refreshUser?: () => Promise<void>;
  setFreeUsesRemaining: Dispatch<SetStateAction<number>>;
  hasPaidAccess: boolean;
};

export function useFreeStatus({
  accountId,
  refreshUser,
  setFreeUsesRemaining,
  hasPaidAccess,
}: FreeStatusOptions) {
  const mounted = useRef(false);
  const revision = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const currentAccountId = useRef(accountId);
  useLayoutEffect(() => {
    currentAccountId.current = accountId;
  }, [accountId]);

  const refreshFreeStatus = useCallback(
    async ({ fallbackDecrement = false, includeUserRefresh = false, shouldApply }: RefreshOptions = {}) => {
      if (!mounted.current) return false;
      const requestRevision = ++revision.current;
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      const isCurrent = () => mounted.current
        && revision.current === requestRevision
        && currentAccountId.current === accountId
        && (!shouldApply || shouldApply());
      const refreshed = await refreshFreeStatusBalance({
        fallbackDecrement,
        setRemaining: (value) => setFreeUsesRemaining((previous) => {
          const reported = typeof value === "function" ? value(previous) : value;
          return preservePaidReportAccess(reported, hasPaidAccess);
        }),
        shouldApply: isCurrent,
        signal: controller.signal,
      });
      if (!refreshed && isCurrent()) console.error("Failed to refresh free status.");
      if (includeUserRefresh && isCurrent()) {
        try {
          await refreshUser?.();
        } catch (userError) {
          console.error("Failed to refresh user after free status:", userError);
        }
      }
      if (activeRequest.current === controller) activeRequest.current = null;
      return refreshed;
    },
    [accountId, hasPaidAccess, refreshUser, setFreeUsesRemaining]
  );

  useEffect(() => {
    mounted.current = true;
    void refreshFreeStatus();
    return () => {
      mounted.current = false;
      revision.current += 1;
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [refreshFreeStatus]);

  return { refreshFreeStatus };
}
