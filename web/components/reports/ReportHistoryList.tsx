"use client";

import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CaretRight } from "@phosphor-icons/react";
import { toast } from "sonner";
import { scoreBandFor } from "@/lib/reports/score-band";
import { Button } from "@/components/ui/button";
import { LINKEDIN_SAVED_PREVIEW } from "@/lib/reports/report-document";
import { useAuth } from "@/components/providers/AuthProvider";
import { Pile } from "@/components/materials/Pile";
import { earlierVersionsLabel, groupReportVersions, lineProgressLabel, reportVersions, revisionProgressLabel, revisionScoreLabel, scoreChangeLabel, versionChangeLabel, type LineProgress, type RevisionProgress, type ScoreChange } from "@/lib/reports/report-history";
import { VersionComparisonView } from "@/components/workspace/VersionComparisonView";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { getSavedReportRevisionHref } from "@/lib/reports/saved-report-revision";
import styles from "./ReportHistoryList.module.css";

export type ReportHistoryItem = {
  id: string;
  score: number | null;
  /** A LinkedIn profile review; otherwise a resume report. */
  isProfile: boolean;
  /** The report's one-sentence verdict, the line the report itself opens with. Never the resume's own text. */
  verdict: string | null;
  name: string | null;
  targetRole: string | null;
  createdAt: string;
  /** How many of the report's lines have an answer kept, when the report asked any. */
  progress?: LineProgress | null;
  /** The change in score from the person's previous report for the same role. */
  change?: ScoreChange | null;
  /** The saved report this one revises, when it was run as a re-check of it. */
  revises?: string | null;
  /** What this version's list looks like against the resume's first version: lines off it, still on it, new. */
  revisions?: (RevisionProgress & { sinceId: string }) | null;
};

type Comparison = { earlier: { id: string; createdAt: string; score: number; report: ReportData; label: string }; current: { id: string; createdAt: string; score: number; report: ReportData; label: string } };

/** The active pass, when the person has one that counts reports: what's left and the day it ends. */
export type ReportHistoryPass = { usesLeft: number; expiresAt: string | null };

function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved report";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// What a row is called when it has no verdict to lead with, and in its open link's label. On the page a
// row leads with its verdict (Nov 11, 2026): five rows all titled "Resume report" told nobody which was which, and
// the old preview was the resume's opening text, contact details included.
// targetRole is the report's best-fit role suggestion, not the person's job, so it stays in the meta line.
function reportTitle(report: ReportHistoryItem) {
  return report.name || (report.isProfile ? LINKEDIN_SAVED_PREVIEW : "Resume report");
}

/** What the signed-in person has left, in the words the upload page and Settings use. */
function accessLine(user: { membership?: string | null; paidUsesLeft?: number | null; freeUsesLeft?: number | null } | null | undefined) {
  if (!user) return null;
  if (user.membership === "lifetime") return "Lifetime access";
  if (user.membership === "monthly") return "Monthly plan";
  if (user.membership === "credit") {
    const paid = Number(user.paidUsesLeft || 0);
    return `${paid} ${paid === 1 ? "report" : "reports"} left on your pass`;
  }
  const free = Number(user.freeUsesLeft || 0);
  return `${free} free report${free === 1 ? "" : "s"} left`;
}

export function ReportHistoryList({ initialReports: reports, pass = null }: { initialReports: ReportHistoryItem[]; pass?: ReportHistoryPass | null }) {
  const { user } = useAuth();
  // The pass the server read wins: it is this page's own data, and it is there before the session hook answers.
  const access = pass && pass.usesLeft > 0
    ? `${pass.usesLeft} ${pass.usesLeft === 1 ? "report" : "reports"} left on your pass`
    : accessLine(user);
  const [comparingId, setComparingId] = useState<string | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);

  const groups = useMemo(() => groupReportVersions(reports), [reports]);
  const versions = useMemo(() => reportVersions(groups), [groups]);

  /** Opens the two reports side by side: the resume's first version and this one. */
  async function compare(first: ReportHistoryItem, current: ReportHistoryItem, firstLabel: string, currentLabel: string) {
    if (comparingId) return;
    setComparingId(current.id);
    try {
      const [a, b] = await Promise.all([first, current].map(async (report) => {
        const response = await fetch(`/api/reports/${report.id}`, { credentials: "same-origin", cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok || !data.report) throw new ClientActionError(data?.message, "We couldn’t open those two reports together. Try again.");
        return data.report as ReportData;
      }));
      setComparison({
        earlier: { id: first.id, createdAt: first.createdAt, score: first.score ?? 0, report: a, label: firstLabel },
        current: { id: current.id, createdAt: current.createdAt, score: current.score ?? 0, report: b, label: currentLabel },
      });
    } catch (error) {
      toast.error(getClientActionError(error, "We couldn’t open those two reports together. Try again."));
    } finally {
      setComparingId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>Nothing saved yet.</h2>
        <p className={styles.emptyBody}>A report you save shows up here with what the recruiter took from it, so you can come back to it or check a revision against it.</p>
        <Button asChild className="mt-6">
          <Link href="/workspace">
            Get my report
            <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  // Reports joined by a re-check are versions of one resume: the newest stands for it, the rest sit under it.
  const [latestGroup, ...earlierGroups] = groups;
  const latest = latestGroup[0];

  /**
   * What the revisions did, for the newest version of a resume: against the first version, which lines are off
   * the list, which are still there and what came up, then how far the score moved. This is what a person who
   * rewrote their resume came back to find out, so it sits under the verdict, not behind a click.
   */
  const journeyOf = (report: ReportHistoryItem) => {
    const group = groups.find((candidate) => candidate[0].id === report.id);
    const version = versions.get(report.id);
    if (!group || !version || version.number < 2) return null;
    const first = group[group.length - 1];
    const lists = report.revisions && report.revisions.sinceId === first.id ? report.revisions : null;
    const delta = typeof report.score === "number" && typeof first.score === "number" ? report.score - first.score : null;
    if (!lists && delta === null) return null;
    // With three or more versions, the last step is said too: a resume can be up overall and down on the latest try.
    const step = version.change && version.change.from !== 1 ? `${versionChangeLabel(version.change)}.` : null;
    return { first, lists, delta, step, version };
  };

  const journey = (report: ReportHistoryItem) => {
    const found = journeyOf(report);
    if (!found) return null;
    const { first, lists, delta, step } = found;
    return (
      <div className={styles.journey} data-testid="report-journey">
        <p className={styles.journeyLabel}>Since version 1 <span>· {formatReportDate(first.createdAt)}</span></p>
        {lists ? <p className={styles.journeyLines}>{revisionProgressLabel(lists)}</p> : null}
        {delta !== null ? (
          <p className={styles.journeyScore}>
            <span data-up={delta > 0 || undefined}>{revisionScoreLabel(delta, scoreBandFor(first.score ?? 0).name, scoreBandFor(report.score ?? 0).name)}</span>
            {step ? <span>{step}</span> : null}
          </p>
        ) : null}
      </div>
    );
  };

  /** "See what changed": the first version and this one, side by side. */
  const compareAction = (report: ReportHistoryItem, size: "sm" | "md") => {
    const found = journeyOf(report);
    if (!found) return null;
    const open = () => void compare(found.first, report, "Version 1", `Version ${found.version.number}`);
    const busy = comparingId === report.id;
    // In a row it is a text link on the verdict's edge; under the latest report it sits with the button.
    return size === "sm" ? (
      <button type="button" className={`riyp-link-quiet focus-ring ${styles.compare}`} onClick={open} disabled={busy} aria-busy={busy || undefined}>
        {busy ? "Opening both reports…" : "See what changed"}
      </button>
    ) : (
      <Button type="button" variant="quiet" size={size} onClick={open} isLoading={busy} loadingLabel="Opening both reports…">
        See what changed
      </Button>
    );
  };

  /**
   * Where a report stands: lines answered, and how its score moved against the person's previous report for the
   * same role. A resume with versions says how its score moved in what the revisions did, above.
   */
  const standing = (report: ReportHistoryItem) => {
    const moved = !versions.get(report.id) && report.change
      ? { up: report.change.delta > 0, label: scoreChangeLabel(report.change, formatReportDate(report.change.since), formatReportDate(report.createdAt)) }
      : null;
    if (!report.progress && !moved) return null;
    return (
      <p className={styles.standing} data-testid="report-standing">
        {report.progress ? <span data-done={report.progress.answered >= report.progress.total || undefined}>{lineProgressLabel(report.progress)}</span> : null}
        {moved ? <span data-up={moved.up || undefined}>{moved.label}</span> : null}
      </p>
    );
  };

  /** What a row adds under its verdict: its kind and role, how far along it is, and what its revisions did. */
  const details = (report: ReportHistoryItem) => (
    <>
      <p className={styles.meta}>
        {report.isProfile ? "LinkedIn profile" : "Resume"}
        {report.targetRole ? <> · {report.targetRole}</> : null}
        {versions.get(report.id) ? <> · Version {versions.get(report.id)?.number}</> : null}
      </p>
      {standing(report)}
      {journey(report)}
    </>
  );

  /** The earlier versions of a resume, closed until asked for: each opens its own report. */
  const earlierVersions = (group: ReportHistoryItem[]) => group.length > 1 ? (
    <details className={styles.versions} data-testid="report-versions">
      <summary className={`focus-ring ${styles.versionsSummary}`}>
        <CaretRight className={`size-3.5 ${styles.caret}`} weight="bold" aria-hidden="true" />
        {earlierVersionsLabel(group.length - 1)}
      </summary>
      <ol className={styles.versionList}>
        {group.slice(1).map((report) => {
          const version = versions.get(report.id);
          return (
            <li key={report.id} data-testid="report-version">
              <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.versionRow}`}>
                <span className={styles.when}>
                  <span className={styles.band}>Version {version?.number}</span>
                  <span className={styles.date}>{formatReportDate(report.createdAt)}</span>
                </span>
                <span className={styles.main}>
                  {report.name ? <span className={styles.versionName}>{report.name}</span> : null}
                  <span className={styles.versionVerdict}>{report.verdict || (report.name ? null : reportTitle(report))}</span>
                  <span className={styles.meta}>
                    {scoreBandFor(report.score ?? 0).name}
                    {version?.change ? <> · {versionChangeLabel(version.change)}</> : null}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </details>
  ) : null;

  const passEnds = pass?.expiresAt && !Number.isNaN(Date.parse(pass.expiresAt)) ? formatReportDate(pass.expiresAt) : null;

  return (
    <>
      <div className={styles.summary} data-testid="reports-summary">
        {pass && pass.usesLeft > 0 ? (
          <Pile count={Math.min(5, pass.usesLeft)} size="sm" label={`${pass.usesLeft} ${pass.usesLeft === 1 ? "report" : "reports"} left on your pass`} className={styles.sheets} />
        ) : null}
        <p>
          <span>{reports.length} {reports.length === 1 ? "report" : "reports"} saved</span>
          {access ? (
            <>
              <span aria-hidden="true"> · </span>
              <Link href="/settings/billing" className="riyp-link-quiet focus-ring">{access}</Link>
              {pass && passEnds ? <span>, good until {passEnds}</span> : null}
            </>
          ) : null}
        </p>
      </div>

      {/* The latest report, set larger: what a returning person came back for (Nov 11, 2026). The page opens
          reports; naming, deleting and checking a revision live in the report itself. */}
      <section className={styles.latest} aria-labelledby="latest-report-title" data-testid="latest-report">
        <p className={styles.latestLabel}>
          <span id="latest-report-title">Your latest report</span>
          <span className={styles.latestWhen}>{scoreBandFor(latest.score ?? 0).name} · {formatReportDate(latest.createdAt)}</span>
        </p>
        {latest.name ? <h2 className={styles.name}>{latest.name}</h2> : null}
        {latest.verdict
          ? latest.name ? <p className={styles.verdictUnderName}>{latest.verdict}</p> : <h2 className={styles.latestVerdict}>{latest.verdict}</h2>
          : latest.name ? null : <h2 className={styles.name}>{reportTitle(latest)}</h2>}
        {details(latest)}
        <div className={styles.latestActions}>
          <Button asChild>
            <Link href={`/reports/${latest.id}`}>Open the report <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link>
          </Button>
          {compareAction(latest, "md")}
        </div>
        {earlierVersions(latestGroup)}
      </section>

      {earlierGroups.length > 0 ? (
        <section aria-labelledby="earlier-reports-title">
          <h2 id="earlier-reports-title" className={styles.earlierTitle}>Earlier reports</h2>
          <ol className={styles.list}>
            {earlierGroups.map((group) => {
              const report = group[0];
              const title = reportTitle(report);
              const compareLink = compareAction(report, "sm");

              return (
                <li key={report.id} className={styles.row}>
                  {/* The band, as the report shows it; the score shows only as a change, on a re-check (Nov 6, 2026). */}
                  <div className={styles.when}>
                    <p className={styles.band} data-testid="report-band">{scoreBandFor(report.score ?? 0).name}</p>
                    <p className={styles.date}>{formatReportDate(report.createdAt)}</p>
                  </div>

                  <div className={styles.main}>
                    <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.open}`}>
                      {report.name ? <h3 className={styles.name}>{report.name}</h3> : null}
                      {report.verdict
                        ? report.name ? <p className={styles.verdictUnderName}>{report.verdict}</p> : <h3 className={styles.verdict}>{report.verdict}</h3>
                        : report.name ? null : <h3 className={styles.name}>{title}</h3>}
                      {details(report)}
                    </Link>
                    {compareLink ? <div className={styles.rowActions}>{compareLink}</div> : null}
                    {earlierVersions(group)}
                  </div>

                  <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.arrow}`} aria-label={`Open ${report.name || report.verdict || title}`} tabIndex={-1}>
                    <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {comparison ? (
        <VersionComparisonView
          reportA={{ ...comparison.earlier, name: comparison.earlier.label }}
          reportB={{ ...comparison.current, name: comparison.current.label }}
          onClose={() => setComparison(null)}
        />
      ) : null}
    </>
  );
}
