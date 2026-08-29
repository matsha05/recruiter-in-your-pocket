import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AuthContext } from "@/lib/auth/content";
import { toast } from "sonner";

export function useReportSave({
  setPendingReportForSave,
  setIsSavePromptOpen,
  setAuthContext,
  setIsAuthOpen,
}: {
  setPendingReportForSave: Dispatch<SetStateAction<any>>;
  setIsSavePromptOpen: Dispatch<SetStateAction<boolean>>;
  setAuthContext: Dispatch<SetStateAction<AuthContext>>;
  setIsAuthOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const saveReportForCurrentUser = useCallback(async (reportToSave: any) => {
    if (!reportToSave) return;

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report: reportToSave }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.message || "Failed to save report");

    toast.success("Report saved to your history");
    setPendingReportForSave(null);
    setIsSavePromptOpen(false);
  }, [setIsSavePromptOpen, setPendingReportForSave]);

  const handleRequestSaveAuth = useCallback(() => {
    setIsSavePromptOpen(false);
    setAuthContext("report");
    setIsAuthOpen(true);
  }, [setAuthContext, setIsAuthOpen, setIsSavePromptOpen]);

  return { handleRequestSaveAuth, saveReportForCurrentUser };
}
