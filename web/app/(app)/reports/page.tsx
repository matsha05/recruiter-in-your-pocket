import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, FileText, ArrowRight, Chrome, ChartNoAxesCombined } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { EmptyReportIcon } from "@/components/icons";
import { launchFlags } from "@/lib/launch/flags";

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
        ) : items.length === 0 ? (
          <div className="border-y border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center border border-cyan-bright/35 bg-surface-sky text-brand">
              <EmptyReportIcon className="size-12" />
            </div>
            <h2 className="font-display text-2xl text-foreground">No saved reports yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Get a report from the workspace and save it while signed in to build your history.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border-y border-border bg-card">
            {items.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="group block p-5 transition-colors hover:bg-mineral"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="gap-y-2">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={report.score ?? 0} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-foreground">
                        {report.name || report.target_role || "Saved report"}
                      </h2>
                      {report.resume_preview ? (
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                          {report.resume_preview}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="size-4" />
                    <span className="group-hover:text-foreground">Open report</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
