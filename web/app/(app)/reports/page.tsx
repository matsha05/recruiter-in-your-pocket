import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, GoogleChromeLogo, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { launchFlags } from "@/lib/launch/flags";
import { ReportHistoryList } from "@/components/reports/ReportHistoryList";
import { LINKEDIN_SAVED_PREVIEW } from "@/lib/reports/report-document";

/** The verdict as one plain line for a row: trimmed, and cut at a sentence when the stored text runs long. */
function verdictLine(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= 220) return text;
  const firstSentence = text.match(/^.{40,220}?[.!?](?=\s|$)/u)?.[0];
  return firstSentence ?? `${text.slice(0, 217).trimEnd()}…`;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My reports",
  description: "Every report you’ve saved, with where it stood and what the recruiter took from it.",
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
    // The row leads with the report's own one-sentence verdict (Nov 11, 2026), read out of the stored report: the
    // worklist report's `verdict`, or the earlier report's first impression.
    .select("id, score, score_label, resume_preview, name, target_role, created_at, verdict:report_json->>verdict, first_impression:report_json->>first_impression, takeaway:report_json->>first_impression_takeaway")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(51);

  if (reportsError) {
    console.error("[ReportsPage] Failed to load report history", reportsError);
  }

  const hasMoreReports = (reports?.length || 0) > 50;
  const items = (reports || []).slice(0, 50);

  return (
    <section className="flex-1 bg-background">
      <div className="mx-auto flex box-content w-auto max-w-column flex-col gap-8 px-[var(--marketing-gutter)] py-8 sm:py-12">
        <AppPageIntro
          title="Your saved reports"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {launchFlags.extensionSync ? (
                <Button asChild variant="secondary">
                  <Link
                    href="/extension"
                  >
                    <GoogleChromeLogo className="size-4" aria-hidden="true" />
                    Extension
                  </Link>
                </Button>
              ) : null}
              <Button asChild>
                <Link
                  href="/workspace"
                >
                  New report
                  <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          }
        />

        {!reportsError && hasMoreReports ? (
          <p className="-mt-4 text-xs text-muted-foreground">These are your latest 50 reports. Older ones are still saved, and an account export includes them.</p>
        ) : null}

        {reportsError ? (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-error-surface px-5 py-10 text-center sm:rounded-3xl sm:p-10">
            <WarningCircle className="mx-auto size-7 text-destructive" aria-hidden="true" />
            <h2 className="mt-4 font-display text-heading text-foreground">We couldn’t load My reports.</h2>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <form action="/reports" method="get">
                <Button
                  type="submit"
                >
                  Try again
                </Button>
              </form>
              <Button asChild variant="secondary">
                <Link
                  href="/help"
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
              isProfile: report.resume_preview === LINKEDIN_SAVED_PREVIEW,
              verdict: verdictLine(report.verdict || report.first_impression || report.takeaway),
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
