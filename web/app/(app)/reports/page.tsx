import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, Chrome, ChartNoAxesCombined } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { launchFlags } from "@/lib/launch/flags";
import { ReportHistoryList } from "@/components/reports/ReportHistoryList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report History",
  description: "View, revisit, and manage your saved resume reports.",
};

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/auth?from=reports&next=/reports");
  }

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("id, score, score_label, resume_preview, name, target_role, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(51);

  if (reportsError) {
    console.error("[ReportsPage] Failed to load report history", reportsError);
  }

  const hasMoreReports = (reports?.length || 0) > 50;
  const items = (reports || []).slice(0, 50);
  const reportCountLabel = reportsError
    ? "History unavailable"
    : hasMoreReports
      ? "Latest 50 reports"
      : `${items.length} saved report${items.length === 1 ? "" : "s"}`;

  return (
    <section className="flex-1 bg-background">
      <div className="mx-auto flex box-content w-auto max-w-workspace flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <AppPageIntro
          eyebrow="Report history"
          title="Your saved reports"
          description="Find feedback from earlier reports or open one to compare with a revised resume."
          meta={
            <>
              <span className="inline-flex max-w-full items-center rounded-full bg-brand-tint px-3 py-1.5 text-xs font-medium text-brand [overflow-wrap:anywhere]">
                {reportCountLabel}
              </span>
              <span className="inline-flex max-w-full items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground [overflow-wrap:anywhere]">
                Signed in as {user.email}
              </span>
            </>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {launchFlags.extensionSync ? (
                <Button asChild variant="outline">
                  <Link
                    href="/extension"
                  >
                    <Chrome className="size-4" />
                    Extension
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link
                  href="/dashboard"
                >
                  <ChartNoAxesCombined className="size-4" />
                  Progress
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href="/workspace"
                >
                  Get another report
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          }
        />

        <div className="rounded-xl bg-brand/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
          Signed-in reports stay attached to this account until you delete them.
          {launchFlags.extensionSync
            ? " Choose a saved job to review your resume against its requirements."
            : " Add a job posting in the workspace to review your resume against its requirements."}
        </div>

        {!reportsError && hasMoreReports ? (
          <p className="-mt-4 text-xs text-muted-foreground">Showing your latest 50 reports. Older reports remain stored and can be included in an account export.</p>
        ) : null}

        {reportsError ? (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-error-surface px-5 py-10 text-center sm:rounded-3xl sm:p-10">
            <AlertTriangle className="mx-auto size-7 text-destructive" aria-hidden="true" />
            <h2 className="mt-4 font-display text-report-title text-foreground">Your report history could not load.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try again in a moment. If you still can’t open your reports, contact support.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <form action="/reports" method="get">
                <Button
                  type="submit"
                >
                  Try again
                </Button>
              </form>
              <Button asChild variant="outline">
                <Link
                  href="/support"
                >
                  Contact support
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <ReportHistoryList
            initialReports={items.map((report) => ({
              id: report.id,
              score: report.score,
              resumePreview: report.resume_preview,
              name: report.name,
              targetRole: report.target_role,
              createdAt: report.created_at,
            }))}
          />
        )}
      </div>
    </section>
  );
}
