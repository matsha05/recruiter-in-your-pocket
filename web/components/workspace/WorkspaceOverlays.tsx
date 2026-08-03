"use client";

import AuthModal from "@/components/shared/AuthModal";
import HistorySidebar from "@/components/workspace/HistorySidebar";
import PaywallModal from "@/components/workspace/PaywallModal";
import SaveReportPrompt from "@/components/workspace/SaveReportPrompt";
import type { AuthContext } from "@/lib/auth/content";
import { toast } from "sonner";

export default function WorkspaceOverlays(props: {
  user: any;
  report: any;
  resumeText: string;
  jobDescription: string;
  freeUsesRemaining: number;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isPaywallOpen: boolean;
  setIsPaywallOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authContext: AuthContext;
  setAuthContext: (context: AuthContext) => void;
  isSavePromptOpen: boolean;
  setIsSavePromptOpen: (open: boolean) => void;
  pendingReportForSave: any;
  refreshUser: () => Promise<unknown>;
  saveReportForCurrentUser: (report: any) => Promise<void>;
  handleRequestSaveAuth: () => void;
  loadReport: (reportId: string) => void;
}) {
  return <>
    <HistorySidebar
      isOpen={props.isHistoryOpen}
      onClose={() => props.setIsHistoryOpen(false)}
      user={props.user ? { email: props.user.email || undefined } : null}
      onSignIn={() => {
        props.setIsHistoryOpen(false);
        props.setAuthContext("history");
        props.setIsAuthOpen(true);
      }}
      onLoadReport={async (reportId) => {
        props.setIsHistoryOpen(false);
        props.loadReport(reportId);
      }}
    />
    <PaywallModal
      isOpen={props.isPaywallOpen}
      onClose={() => props.setIsPaywallOpen(false)}
      creditsRemaining={props.freeUsesRemaining}
      hasCurrentReport={Boolean(props.report)}
      workspaceState={props.report
        ? { report: props.report, resumeText: props.resumeText, jobDescription: props.jobDescription }
        : null}
    />
    <AuthModal
      isOpen={props.isAuthOpen}
      onClose={() => {
        props.setIsAuthOpen(false);
        props.setAuthContext("default");
      }}
      context={props.authContext}
      onSuccess={async () => {
        await props.refreshUser();
        if (props.pendingReportForSave) {
          try {
            await props.saveReportForCurrentUser(props.pendingReportForSave);
          } catch (error: any) {
            toast.error(error?.message || "Failed to save report");
          }
        }
        props.setIsAuthOpen(false);
        props.setAuthContext("default");
      }}
    />
    <SaveReportPrompt
      isOpen={props.isSavePromptOpen}
      onClose={() => props.setIsSavePromptOpen(false)}
      report={props.pendingReportForSave}
      onRequestAuth={props.handleRequestSaveAuth}
    />
  </>;
}
