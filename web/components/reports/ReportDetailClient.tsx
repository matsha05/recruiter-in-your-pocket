"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Chrome, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReportPanel from "@/components/workspace/ReportPanel";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { useAuth } from "@/components/providers/AuthProvider";
import { Analytics } from "@/lib/analytics";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";

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
    const requestBody = buildPdfExportRequest(payload);
    if (!requestBody) {
      toast.error("This report is missing some data. Please rerun it and try exporting again.");
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
    return "Recruiter report";
  }, [state]);

  return (
    <main data-visual-anchor="report-detail-page" className="flex-1 min-h-0 flex flex-col overflow-hidden bg-body">
      <div className="border-b border-border/40 bg-background/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <button
            onClick={() => router.push("/workspace")}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Workspace
          </button>
          <Link
            href="/workspace"
            className="text-xs font-medium text-brand hover:underline underline-offset-4"
          >
            Run another report
          </Link>
        </div>
      </div>

      {state === "loading" && (
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="app-card inline-flex items-center gap-2 px-5 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading report...
          </div>
        </div>
      )}

      {state === "not_found" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="app-card max-w-md p-8 text-center">
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
          <div className="app-card max-w-md p-8 text-center">
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
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-6 md:px-6">
            <AppPageIntro
              eyebrow="Saved recruiter report"
              title="Recruiter report"
              description={hasJobDescription
                ? "Your saved recruiter report, with role-fit context and the exact fixes worth making first."
                : "Your saved recruiter report, preserved with the original read, rewrites, and evidence trail."}
              meta={
                <>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {report.score ?? "—"}/100
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {headerTitle}
                  </span>
                </>
              }
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                  >
                    All saved reports
                  </Link>
                  <Link
                    href="/extension"
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                  >
                    <Chrome className="h-4 w-4" />
                    Extension
                  </Link>
                </div>
              }
            />
            <div className="mt-4 rounded-xl border border-brand/15 bg-brand/[0.045] px-4 py-3 text-sm text-muted-foreground">
              Saved reports preserve the first impression and rewrites from that run. If you want a fresh report with new role context, get another report from the workspace.
            </div>
          </div>

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
        </div>
      )}
    </main>
  );
}
