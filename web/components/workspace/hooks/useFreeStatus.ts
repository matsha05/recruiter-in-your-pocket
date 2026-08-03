import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { refreshFreeStatusBalance } from "@/lib/free-status-client";

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
    async ({ fallbackDecrement = false, includeUserRefresh = false }: RefreshOptions = {}) => {
      const refreshed = await refreshFreeStatusBalance({
        fallbackDecrement,
        setRemaining: setFreeUsesRemaining,
      });
      if (!refreshed) console.error("Failed to refresh free status.");
      if (includeUserRefresh) {
        try {
          await refreshUser?.();
        } catch (userError) {
          console.error("Failed to refresh user after free status:", userError);
        }
      }
      return refreshed;
    },
    [refreshUser, setFreeUsesRemaining]
  );

  useEffect(() => {
    refreshFreeStatus();
  }, [refreshFreeStatus]);

  return { refreshFreeStatus };
}
