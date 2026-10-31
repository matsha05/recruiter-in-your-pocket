"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import ReportPanel from "@/components/workspace/ReportPanel";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { useAuth } from "@/components/providers/AuthProvider";
import { Analytics } from "@/lib/analytics";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";
import { getSavedReportRevisionHref } from "@/lib/reports/saved-report-revision";
import { getCheckoutPricingHref } from "@/lib/billing/checkoutReturn";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

type ReportLoadState = "loading" | "ready" | "signed_out" | "not_found" | "error";

type ReportDetailClientProps = {
  reportId: string;
};

export default function ReportDetailClient({ reportId }: ReportDetailClientProps) {
  const { push } = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;
  const requestIdentity = JSON.stringify([reportId, userId, isAuthLoading]);
  const [loadedFor, setLoadedFor] = useState(requestIdentity);
  const [loadState, setState] = useState<ReportLoadState>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const state = loadedFor === requestIdentity ? loadState : "loading";
  const [report, setReport] = useState<ReportData | null>(null);
  const [hasJobDescription, setHasJobDescription] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
  const canExportPdf = Boolean(user?.canExportPdf);
  const revisionHref = getSavedReportRevisionHref(reportId);
  const freeUsesRemaining = Math.max(0, user?.freeUsesLeft ?? 0);

  const loadReport = useCallback(async (signal: AbortSignal) => {
    setLoadedFor(requestIdentity);
    setState("loading");
    setReport(null);
    setHasJobDescription(false);
    if (isAuthLoading) return;
    if (!userId) {
      setState("signed_out");
      return;
    }
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
        signal,
        credentials: "same-origin",
        cache: "no-store",
      });
      if (signal.aborted) return;

      if (res.status === 401) {
        setState("signed_out");
        return;
      }

      if (res.status === 404) {
        setState("not_found");
        return;
      }

      const data = await res.json().catch(() => null);
      if (signal.aborted) return;
      if (!res.ok || !data?.ok || !data?.report) {
        setState("error");
        return;
      }

      const nextReport: ReportData = { ...data.report, id: reportId };
      setReport(nextReport);
      setHasJobDescription(Boolean(data.jdPreview));
      setState("ready");
      Analytics.track("report_detail_opened");
    } catch {
      if (!signal.aborted) setState("error");
    }
  }, [isAuthLoading, reportId, requestIdentity, userId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadReport(controller.signal);
    return () => controller.abort();
  }, [loadAttempt, loadReport]);

  async function handleExportPdf(overrideReport?: ReportData) {
    const payload = overrideReport || report;
    if (!payload) return;
    const requestBody = buildPdfExportRequest(payload);
    if (!requestBody) {
      toast.error("This report is missing details needed for a PDF. Contact support for help exporting it.");
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
        throw new ClientActionError(error?.message, "The PDF couldn’t download. Try exporting again.");
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
      toast.error(getClientActionError(err, "The PDF couldn’t download. Try exporting again."));
    } finally {
      setIsExporting(false);
    }
  }


  return (
    <div data-visual-anchor="report-detail-page" className="flex-1 min-h-0 flex flex-col overflow-hidden bg-body">
      <div className="border-b border-border/40 bg-background px-4 md:px-6">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-3">
          <Link href="/reports" className="riyp-link-nav inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" weight="bold" aria-hidden="true" />
            My reports
          </Link>
          {/* The header already offers "New report"; from a saved report the next step is checking a revision against it. */}
          <Link href={revisionHref || "/workspace"} className="riyp-link-nav inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            {revisionHref ? "Check a revision" : "New report"}
          </Link>
        </div>
      </div>

      {state === "loading" && (
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="app-card inline-flex items-center gap-2 px-5 py-4 text-sm text-muted-foreground" role="status" aria-live="polite">
            <CircleNotch className="size-4 motion-safe:animate-spin" aria-hidden="true" />
            Loading report…
          </div>
        </div>
      )}

      {state === "not_found" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="app-card max-w-md p-8 text-center">
            <WarningCircle className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-3 font-display text-2xl font-bold text-foreground">Report not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn’t find this report. It may have been deleted, or it belongs to another account.
            </p>
            <Link
              href="/workspace"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Back to your workspace
            </Link>
          </div>
        </div>
      )}

      {state === "signed_out" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="app-card max-w-md p-8 text-center">
            <WarningCircle className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-3 font-display text-2xl font-bold text-foreground">Sign in to view this report</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Saved reports are private to the account that created them.
            </p>
            <Link
              href={`/auth?from=reports&next=${encodeURIComponent(`/reports/${reportId}`)}`}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="app-card max-w-md p-8 text-center">
            <WarningCircle className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-3 font-display text-2xl font-bold text-foreground">We couldn’t load this report.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your report is safe. This is on our end; try again in a moment.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button type="button"
                onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                className="min-h-11 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Try again
              </button>
              <Link
                href="/support"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      )}

      {state === "ready" && report && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="h-4 md:h-6" aria-hidden="true" />
          <ReportPanel
            report={report}
            isLoading={false}
            hasJobDescription={hasJobDescription}
            onExportPdf={canExportPdf ? handleExportPdf : undefined}
            isExporting={isExporting}
            isSample={false}
            onNewReport={() => push("/workspace")}
            onStartRevision={revisionHref ? () => push(revisionHref) : undefined}
            freeUsesRemaining={freeUsesRemaining}
            onUpgrade={() => push(getCheckoutPricingHref(revisionHref))}
            isGated={false}
            justUnlocked={false}
            highlightSection={null}
            hasPaidAccess={hasPaidAccess}
          />
        </div>
      )}
    </div>
  );
}
