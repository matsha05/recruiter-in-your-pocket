import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

type RefreshOptions = {
  fallbackDecrement?: boolean;
  includeUserRefresh?: boolean;
  requireOk?: boolean;
};

type FreeStatusOptions = {
  refreshUser?: () => Promise<void>;
  setFreeUsesRemaining: Dispatch<SetStateAction<number>>;
};

export function useFreeStatus({ refreshUser, setFreeUsesRemaining }: FreeStatusOptions) {
  const refreshFreeStatus = useCallback(
    async ({ fallbackDecrement = false, includeUserRefresh = false, requireOk = false }: RefreshOptions = {}) => {
      try {
        const statusRes = await fetch("/api/free-status");
        const statusData = await statusRes.json();

        const shouldUpdate = requireOk ? statusData.ok : statusData.free_uses_left !== undefined;
        if (shouldUpdate && statusData.free_uses_left !== undefined) {
          setFreeUsesRemaining(statusData.free_uses_left);
        }

        if (includeUserRefresh) {
          await refreshUser?.();
        }
        return true;
      } catch (err) {
        console.error("Failed to refresh free status:", err);
        if (fallbackDecrement) {
          setFreeUsesRemaining((prev) => Math.max(0, prev - 1));
        }
        return false;
      }
    },
    [refreshUser, setFreeUsesRemaining]
  );

  useEffect(() => {
    refreshFreeStatus();
  }, [refreshFreeStatus]);

  return { refreshFreeStatus };
}
