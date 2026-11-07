"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import ReportPanel from "@/components/workspace/ReportPanel";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { useAuth } from "@/components/providers/AuthProvider";
import { Analytics } from "@/lib/analytics";
import type { StoredLineAnswersByFix } from "@/lib/reports/line-answers";
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
  const [lineAnswers, setLineAnswers] = useState<StoredLineAnswersByFix | null>(null);
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
    setLineAnswers(null);
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
      setLineAnswers(data.lineAnswers ?? null);
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
    <div data-visual-anchor="report-detail-page" className="flex flex-1 flex-col bg-body">
      <div className="border-b border-border/40 bg-background px-4 md:px-6">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-3">
          <Link href="/reports" className="riyp-link-nav inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" weight="bold" aria-hidden="true" />
            My reports
          </Link>
          {/* The header already offers "New report"; from a saved report the next step is checking a revision against it. */}
          <Link href={revisionHref || "/workspace"} className="riyp-link-nav inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            {revisionHref ? "Compare my revision" : "New report"}
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
            <h1 className="mt-3 font-display text-heading text-foreground">Report not found</h1>
            <Button asChild size="sm" className="mt-5">
                <Link
                  href="/workspace"
                >
                  Back to your workspace
                </Link>
            </Button>
          </div>
        </div>
      )}

      {state === "signed_out" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="app-card max-w-md p-8 text-center">
            <WarningCircle className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-3 font-display text-heading text-foreground">Sign in to view this report</h1>
            <Button asChild size="sm" className="mt-5">
              <Link href={`/auth?from=reports&next=${encodeURIComponent(`/reports/${reportId}`)}`}>
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="app-card max-w-md p-8 text-center">
            <WarningCircle className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-3 font-display text-heading text-foreground">We couldn’t load this report.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your report is safe.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button type="button"
                onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                  variant="secondary" size="sm"
              >
                Try again
              </Button>
              <Button asChild variant="secondary" size="sm">
                  <Link
                    href="/help"
                  >
                    Contact support
                  </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {state === "ready" && report && (
        <div className="flex-1">
          {/* On a phone the report's own header row sits right under the page bar: no blank strip between them (audit, Nov 5). */}
          <div className="hidden md:block md:h-6" aria-hidden="true" />
          <ReportPanel
            isSavedReport
            report={report}
            storedLineAnswers={lineAnswers}
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
            isSignedIn
          />
        </div>
      )}
    </div>
  );
}
