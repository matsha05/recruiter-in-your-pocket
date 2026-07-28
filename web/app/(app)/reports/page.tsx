import Link from "next/link";
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <AppPageIntro
          eyebrow="Report history"
          title="Your saved reports"
          description="Reopen past reports, compare your progress, and keep a clean record of the versions you want to revisit."
          meta={
            <>
              <span className="inline-flex items-center border-l-2 border-cyan-bright bg-surface-sky px-3 py-1 text-xs font-medium text-muted-foreground">
                {reportCountLabel}
              </span>
              <span className="inline-flex items-center border-l-2 border-line bg-paper-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Signed in as {user.email}
              </span>
            </>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {launchFlags.extensionSync ? (
                <Link
                  href="/extension"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-paper-muted"
                >
                  <Chrome className="size-4" />
                  Extension
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-paper-muted"
              >
                <ChartNoAxesCombined className="size-4" />
                Progress
              </Link>
              <Link
                href="/workspace"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Get another report
                <ArrowRight className="size-4 text-citron" />
              </Link>
            </div>
          }
        />

        <div className="border-l-2 border-cyan-bright bg-surface-sky px-4 py-3 text-sm text-muted-foreground">
          Signed-in reports stay attached to this account until you delete them.
          {launchFlags.extensionSync
            ? " Extension-saved jobs can send role context back into the studio when you want a fresh comparison."
            : " Add a role in the workspace whenever you want a targeted comparison."}
        </div>

        {!reportsError && hasMoreReports ? (
          <p className="-mt-4 text-xs text-muted-foreground">Showing your latest 50 reports. Older reports remain stored and can be included in an account export.</p>
        ) : null}

        {reportsError ? (
          <div role="alert" className="border-y border-destructive/35 bg-error-surface p-8 text-center">
            <AlertTriangle className="mx-auto size-7 text-destructive" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl text-foreground">Your report history could not load.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Your saved reports have not been removed. Try the request again, or contact support if this keeps happening.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <form action="/reports" method="get">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"
                >
                  Try again
                </button>
              </form>
              <Link
                href="/support"
                className="inline-flex min-h-11 items-center rounded-md border border-foreground bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-paper-muted"
              >
                Contact support
              </Link>
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
