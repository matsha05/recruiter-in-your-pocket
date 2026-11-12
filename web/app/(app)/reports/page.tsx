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
import { splitVerdict } from "@/lib/reports/report-opening";
import { groupReportVersions, lineProgress, revisionProgress, scoreChanges } from "@/lib/reports/report-history";
import { isPassActive, isUnlimitedPassTier } from "@/lib/billing/entitlements";

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
  description: "Every report you’ve saved, and what the recruiter took from each.",
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
    // The cards and the kept answers ride along so a row can say how many lines are answered (lib/reports/report-history.ts).
    .select("id, score, score_label, resume_preview, name, target_role, created_at, line_answers, verdict:report_json->>verdict, first_impression:report_json->>first_impression, takeaway:report_json->>first_impression_takeaway, cards:report_json->cards")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(51);

  if (reportsError) {
    console.error("[ReportsPage] Failed to load report history", reportsError);
  }

  // Which report each one revises (migration 026), read on its own so the page still loads where the column
  // doesn't exist yet: without it every report simply stands alone, as before.
  const { data: links } = reportsError
    ? { data: null }
    : await supabase.from("reports").select("id, revises_report_id").eq("user_id", user.id).not("revises_report_id", "is", null).limit(200);
  const revises = new Map((links || []).map((link: { id: string; revises_report_id: string | null }) => [link.id, link.revises_report_id] as const));

  const hasMoreReports = (reports?.length || 0) > 50;
  const items = (reports || []).slice(0, 50);

  // The change since the person's previous report for the same role, across the rows the page shows.
  const changes = scoreChanges(items.map((report) => ({
    id: report.id,
    score: report.score,
    targetRole: report.target_role,
    createdAt: report.created_at,
    isProfile: report.resume_preview === LINKEDIN_SAVED_PREVIEW,
  })));

  // What each later version's list looks like against its resume's first version (lib/reports/report-history.ts).
  const revisions = new Map<string, { sinceId: string; gone: number; still: number; added: number }>();
  const shapeChanged = new Set<string>();
  for (const group of groupReportVersions(items.map((report) => ({ id: report.id, score: report.score, createdAt: report.created_at, revises: revises.get(report.id) ?? null, cards: report.cards, isProfile: report.resume_preview === LINKEDIN_SAVED_PREVIEW })))) {
    const first = group[group.length - 1];
    for (const version of group.slice(0, -1)) {
      const progress = version.isProfile === first.isProfile ? revisionProgress(first.cards, version.cards) : null;
      if (progress) revisions.set(version.id, { sinceId: first.id, ...progress });
      // Version 1 was saved before the worklist: its list and score aren't the same kind of thing as this one's.
      if (version.isProfile === first.isProfile && !Array.isArray(first.cards) && Array.isArray(version.cards)) shapeChanged.add(version.id);
    }
  }

  // The pass, for the line above the list: how many reports are left and the day it ends. A failed read leaves
  // the line to what the signed-in session already knows.
  const { data: passes } = await supabase
    .from("passes")
    .select("tier, uses_remaining, expires_at, revoked_at, revocation_reason")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const activePass = (passes || []).find((pass) => isPassActive(pass) && !isUnlimitedPassTier(pass.tier)) ?? null;

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
            pass={activePass ? { usesLeft: Number(activePass.uses_remaining || 0), expiresAt: activePass.expires_at } : null}
            initialReports={items.map((report) => ({
              id: report.id,
              score: report.score,
              isProfile: report.resume_preview === LINKEDIN_SAVED_PREVIEW,
              progress: lineProgress(report.cards, report.line_answers),
              change: changes.get(report.id) ?? null,
              revises: revises.get(report.id) ?? null,
              revisions: revisions.get(report.id) ?? null,
              earlierShape: shapeChanged.has(report.id),
              // An earlier report's first impression runs two or three sentences; its row shows the first, the way
              // that report opens (lib/reports/report-opening.ts). A worklist verdict runs two or three since November 12, 2026, and its row shows the first too.
              verdict: verdictLine((typeof report.verdict === "string" && report.verdict.trim() ? splitVerdict(report.verdict).lead : null) || (typeof report.first_impression === "string" && report.first_impression.trim() ? splitVerdict(report.first_impression).lead : null) || report.takeaway),
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
