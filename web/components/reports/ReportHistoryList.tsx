"use client";

import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CaretRight, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { scoreBandFor } from "@/lib/reports/score-band";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LINKEDIN_SAVED_PREVIEW } from "@/lib/reports/report-document";
import { useAuth } from "@/components/providers/AuthProvider";
import { Pile } from "@/components/materials/Pile";
import { earlierVersionsLabel, groupReportVersions, lineProgressLabel, reportVersions, scoreChangeLabel, versionChangeLabel, type LineProgress, type ScoreChange } from "@/lib/reports/report-history";
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
};

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

// What a row is called when it has to be named in a sentence (the delete dialog, a button's label). On the page a
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

export function ReportHistoryList({ initialReports, pass = null }: { initialReports: ReportHistoryItem[]; pass?: ReportHistoryPass | null }) {
  const router = useRouter();
  const { user } = useAuth();
  // The pass the server read wins: it is this page's own data, and it is there before the session hook answers.
  const access = pass && pass.usesLeft > 0
    ? `${pass.usesLeft} ${pass.usesLeft === 1 ? "report" : "reports"} left on your pass`
    : accessLine(user);
  const [reports, setReports] = useState(initialReports);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groups = useMemo(() => groupReportVersions(reports), [reports]);
  const versions = useMemo(() => reportVersions(groups), [groups]);

  const reportToDelete = useMemo(
    () => reports.find((report) => report.id === deleteId) || null,
    [deleteId, reports],
  );

  function beginRename(report: ReportHistoryItem) {
    setRenamingId(report.id);
    setDraftName(report.name || "");
  }

  function cancelRename() {
    setRenamingId(null);
    setDraftName("");
  }

  async function saveRename(report: ReportHistoryItem) {
    if (savingId) return;
    const nextName = draftName.trim();
    if (nextName === (report.name || "")) {
      cancelRename();
      return;
    }

    setSavingId(report.id);
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new ClientActionError(data?.message, "Could not rename this report. Try again.");

      setReports((current) => current.map((item) => (
        item.id === report.id ? { ...item, name: nextName || null } : item
      )));
      cancelRename();
      toast.success(nextName ? "Report renamed" : "Report name cleared");
      router.refresh();
    } catch (error) {
      toast.error(getClientActionError(error, "Could not rename this report. Try again."));
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteId || deletingId) return;
    const reportId = deleteId;
    setDeletingId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new ClientActionError(data?.message, "Could not delete this report. Try again.");

      setReports((current) => current.filter((report) => report.id !== reportId));
      setDeleteId(null);
      toast.success("Report deleted");
      router.refresh();
    } catch (error) {
      toast.error(getClientActionError(error, "Could not delete this report. Try again."));
    } finally {
      setDeletingId(null);
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
   * Where a report stands: lines answered, and how its score moved. A version is measured against the version it
   * revises; a report on its own, against the person's previous report for the same role.
   */
  const standing = (report: ReportHistoryItem) => {
    const version = versions.get(report.id);
    const moved = version
      ? version.change ? { up: version.change.delta > 0, label: versionChangeLabel(version.change) } : null
      : report.change ? { up: report.change.delta > 0, label: scoreChangeLabel(report.change, formatReportDate(report.change.since), formatReportDate(report.createdAt)) } : null;
    if (!report.progress && !moved) return null;
    return (
      <p className={styles.standing} data-testid="report-standing">
        {report.progress ? <span data-done={report.progress.answered >= report.progress.total || undefined}>{lineProgressLabel(report.progress)}</span> : null}
        {moved ? <span data-up={moved.up || undefined}>{moved.label}</span> : null}
      </p>
    );
  };

  /** What a row adds under its verdict: its kind and role, then how far along it is and how its score moved. */
  const details = (report: ReportHistoryItem) => (
    <>
      <p className={styles.meta}>
        {report.isProfile ? "LinkedIn profile" : "Resume"}
        {report.targetRole ? <> · {report.targetRole}</> : null}
        {versions.get(report.id) ? <> · Version {versions.get(report.id)?.number}</> : null}
      </p>
      {standing(report)}
    </>
  );

  /** One earlier version of a resume, under the newest: its number and date, its verdict, how its score moved. */
  const versionRow = (report: ReportHistoryItem) => {
    const version = versions.get(report.id);
    return (
      <li key={report.id} className={styles.versionRow} data-testid="report-version">
        <div className={styles.when}>
          <p className={styles.band}>Version {version?.number}</p>
          <p className={styles.date}>{formatReportDate(report.createdAt)}</p>
        </div>
        <div className={styles.main}>
          {renamingId === report.id ? renameForm(report) : (
            <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.open}`}>
              {report.name ? <p className={styles.versionName}>{report.name}</p> : null}
              <p className={styles.versionVerdict}>{report.verdict || (report.name ? null : reportTitle(report))}</p>
              <p className={styles.meta}>{scoreBandFor(report.score ?? 0).name}</p>
              {standing(report)}
            </Link>
          )}
        </div>
        {renamingId !== report.id ? <div className={styles.actions}>{tools(report)}</div> : null}
      </li>
    );
  };

  /** The earlier versions of a resume, closed until asked for. */
  const earlierVersions = (group: ReportHistoryItem[]) => group.length > 1 ? (
    <details className={styles.versions} data-testid="report-versions">
      <summary className={`focus-ring ${styles.versionsSummary}`}>
        <CaretRight className={`size-3.5 ${styles.caret}`} weight="bold" aria-hidden="true" />
        {earlierVersionsLabel(group.length - 1)}
      </summary>
      <ol className={styles.versionList}>{group.slice(1).map(versionRow)}</ol>
    </details>
  ) : null;

  const renameForm = (report: ReportHistoryItem) => (
    <div className="flex max-w-xl flex-col gap-2 sm:flex-row">
      <label htmlFor={`report-name-${report.id}`} className="sr-only">Report name</label>
      <Input
        id={`report-name-${report.id}`}
        value={draftName}
        maxLength={100}
        autoFocus
        onChange={(event) => setDraftName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void saveRename(report);
          if (event.key === "Escape") cancelRename();
        }}
        className="min-h-12 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
        placeholder="Name this version"
      />
      <div className="flex gap-2">
        <Button type="button" onClick={() => void saveRename(report)} isLoading={savingId === report.id} loadingLabel="Saving…">Save</Button>
        <Button type="button" onClick={cancelRename} variant="secondary" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Cancel rename">
          <X className="size-4" weight="bold" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );

  const tools = (report: ReportHistoryItem) => (
    <>
      <Button type="button" variant="quiet" size="icon" onClick={() => beginRename(report)} aria-label={`Rename ${reportTitle(report)}`} title="Rename">
        <PencilSimple className="size-4" aria-hidden="true" />
      </Button>
      <Button type="button" variant="quiet" size="icon" onClick={() => setDeleteId(report.id)} className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${reportTitle(report)}`} title="Delete">
        <Trash className="size-4" aria-hidden="true" />
      </Button>
    </>
  );

  // A resume report can be checked against a revision; a profile review has its own flow.
  const revisionHref = (report: ReportHistoryItem) => (report.isProfile ? null : getSavedReportRevisionHref(report.id));
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

      {/* The latest report, set larger: what a returning person came back for (Nov 11, 2026). */}
      <section className={styles.latest} aria-labelledby="latest-report-title" data-testid="latest-report">
        <div className={styles.latestHead}>
          <p className={styles.latestLabel}>
            <span id="latest-report-title">Your latest report</span>
            <span className={styles.latestWhen}>{scoreBandFor(latest.score ?? 0).name} · {formatReportDate(latest.createdAt)}</span>
          </p>
          {renamingId !== latest.id ? <div className={styles.actions}>{tools(latest)}</div> : null}
        </div>
        {renamingId === latest.id ? renameForm(latest) : (
          <>
            {latest.name ? <h2 className={styles.name}>{latest.name}</h2> : null}
            {latest.verdict
              ? latest.name ? <p className={styles.verdictUnderName}>{latest.verdict}</p> : <h2 className={styles.latestVerdict}>{latest.verdict}</h2>
              : latest.name ? null : <h2 className={styles.name}>{reportTitle(latest)}</h2>}
            {details(latest)}
            <div className={styles.latestActions}>
              <Button asChild>
                <Link href={`/reports/${latest.id}`}>Open the report <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link>
              </Button>
              {revisionHref(latest) ? (
                <Button asChild variant="secondary">
                  <Link href={revisionHref(latest) as string}>Check a revision</Link>
                </Button>
              ) : null}
            </div>
          </>
        )}
        {earlierVersions(latestGroup)}
      </section>

      {earlierGroups.length > 0 ? (
        <section aria-labelledby="earlier-reports-title">
          <h2 id="earlier-reports-title" className={styles.earlierTitle}>Earlier reports</h2>
          <ol className={styles.list}>
            {earlierGroups.map((group) => {
              const report = group[0];
              const title = reportTitle(report);
              const isRenaming = renamingId === report.id;
              const revise = revisionHref(report);

              return (
                <li key={report.id} className={styles.row}>
                  {/* The band, as the report shows it; the score shows only as a change, on a re-check (Nov 6, 2026). */}
                  <div className={styles.when}>
                    <p className={styles.band} data-testid="report-band">{scoreBandFor(report.score ?? 0).name}</p>
                    <p className={styles.date}>{formatReportDate(report.createdAt)}</p>
                  </div>

                  <div className={styles.main}>
                    {isRenaming ? renameForm(report) : (
                      <>
                        <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.open}`}>
                          {report.name ? <h3 className={styles.name}>{report.name}</h3> : null}
                          {report.verdict
                            ? report.name ? <p className={styles.verdictUnderName}>{report.verdict}</p> : <h3 className={styles.verdict}>{report.verdict}</h3>
                            : report.name ? null : <h3 className={styles.name}>{title}</h3>}
                          {details(report)}
                        </Link>
                        {revise ? <Link href={revise} className={`riyp-link-quiet focus-ring ${styles.revise}`}>Check a revision</Link> : null}
                      </>
                    )}
                    {earlierVersions(group)}
                  </div>

                  {!isRenaming ? (
                    <div className={styles.actions}>
                      {tools(report)}
                      <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.arrow}`} aria-label={`Open ${title}`} tabIndex={-1}>
                        <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                      </Link>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete this report?"
        description={`${reportToDelete ? reportTitle(reportToDelete) : "This report"} will be permanently deleted. Your account and any other saved reports will stay intact.`}
        confirmText="Delete report"
        variant="destructive"
        loading={Boolean(deletingId)}
      />
    </>
  );
}
