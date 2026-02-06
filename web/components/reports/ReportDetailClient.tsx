"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReportPanel from "@/components/workspace/ReportPanel";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { useAuth } from "@/components/providers/AuthProvider";
import { Analytics } from "@/lib/analytics";

type ReportLoadState = "loading" | "ready" | "not_found" | "error";

type ReportDetailClientProps = {
  reportId: string;
};

export default function ReportDetailClient({ reportId }: ReportDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<ReportLoadState>("loading");
  const [report, setReport] = useState<ReportData | null>(null);
  const [hasJobDescription, setHasJobDescription] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
  const freeUsesRemaining = Math.max(0, user?.freeUsesLeft ?? 0);

  const loadReport = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      const data = await res.json();

      if (res.status === 404) {
        setState("not_found");
        return;
      }

      if (!data?.ok || !data?.report) {
        setState("error");
        return;
      }

      const nextReport: ReportData = { ...data.report, id: reportId };
      setReport(nextReport);
      setHasJobDescription(Boolean(data.jdPreview));
      setState("ready");
      Analytics.track("report_detail_opened", { report_id: reportId });
    } catch {
      setState("error");
    }
  }, [reportId]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function handleExportPdf(overrideReport?: ReportData) {
    const payload = overrideReport || report;
    if (!payload) return;
    setIsExporting(true);
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: payload }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || "Failed to export PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume-report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Analytics.pdfExported();
    } catch (err: any) {
      toast.error(err?.message || "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  }

  const headerTitle = useMemo(() => {
    if (state === "loading") return "Loading report";
    if (state === "not_found") return "Report not found";
    if (state === "error") return "Could not load report";
    return "Report details";
  }, [state]);

  return (
    <main className="flex-1 min-h-0 flex flex-col overflow-hidden bg-body">
      <div className="border-b border-border/40 bg-background px-6 py-3">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/workspace")}
              className="inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Workspace
            </button>
            <p className="text-sm text-muted-foreground">{headerTitle}</p>
          </div>
          <Link
            href="/workspace"
            className="text-xs font-medium text-brand hover:underline underline-offset-4"
          >
            Run another review
          </Link>
        </div>
      </div>

      {state === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading report...
          </div>
        </div>
      )}

      {state === "not_found" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md rounded-xl border border-border/50 bg-card p-8 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-warning" />
            <h1 className="mt-3 font-display text-2xl text-foreground">Report not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This report does not exist, or you do not have access to it.
            </p>
            <Link
              href="/workspace"
              className="mt-5 inline-flex rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
            >
              Back to Workspace
            </Link>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md rounded-xl border border-border/50 bg-card p-8 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-warning" />
            <h1 className="mt-3 font-display text-2xl text-foreground">Could not load report</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Try again in a moment. If this keeps happening, restore access from Billing.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => void loadReport()}
                className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Retry
              </button>
              <Link
                href="/purchase/restore"
                className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Restore Access
              </Link>
            </div>
          </div>
        </div>
      )}

      {state === "ready" && report && (
        <ReportPanel
          report={report}
          isLoading={false}
          hasJobDescription={hasJobDescription}
          onExportPdf={handleExportPdf}
          isExporting={isExporting}
          isSample={false}
          onNewReport={() => router.push("/workspace")}
          freeUsesRemaining={freeUsesRemaining}
          onUpgrade={() => router.push("/pricing")}
          isGated={false}
          justUnlocked={false}
          highlightSection={null}
          hasPaidAccess={hasPaidAccess}
        />
      )}
    </main>
  );
}
