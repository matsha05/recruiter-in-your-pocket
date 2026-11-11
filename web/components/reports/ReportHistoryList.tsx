"use client";

import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { scoreBandFor } from "@/lib/reports/score-band";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LINKEDIN_SAVED_PREVIEW } from "@/lib/reports/report-document";
import { useAuth } from "@/components/providers/AuthProvider";
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
};

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

export function ReportHistoryList({ initialReports }: { initialReports: ReportHistoryItem[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const access = accessLine(user);
  const [reports, setReports] = useState(initialReports);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  return (
    <>
      <p className={styles.summary} data-testid="reports-summary">
        <span>{reports.length} {reports.length === 1 ? "report" : "reports"} saved</span>
        {access ? <><span aria-hidden="true">·</span> <Link href="/settings/billing" className="riyp-link-quiet focus-ring">{access}</Link></> : null}
      </p>

      <ol className={styles.list}>
        {reports.map((report) => {
          const title = reportTitle(report);
          const isRenaming = renamingId === report.id;
          const kind = report.isProfile ? "LinkedIn profile" : "Resume";

          return (
            <li key={report.id} className={styles.row}>
              {/* The band, as the report shows it; the score shows only as a change, on a re-check (Nov 6, 2026). */}
              <div className={styles.when}>
                <p className={styles.band} data-testid="report-band">{scoreBandFor(report.score ?? 0).name}</p>
                <p className={styles.date}>{formatReportDate(report.createdAt)}</p>
              </div>

              <div className={styles.main}>
                {isRenaming ? (
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
                      <Button
                        type="button"
                        onClick={() => void saveRename(report)}
                        isLoading={savingId === report.id}
                        loadingLabel="Saving…"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        onClick={cancelRename}
                        variant="secondary"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Cancel rename"
                      >
                        <X className="size-4" weight="bold" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.open}`}>
                    {report.name ? <h2 className={styles.name}>{report.name}</h2> : null}
                    {report.verdict
                      ? report.name
                        ? <p className={styles.verdictUnderName}>{report.verdict}</p>
                        : <h2 className={styles.verdict}>{report.verdict}</h2>
                      : report.name ? null : <h2 className={styles.name}>{title}</h2>}
                    <p className={styles.meta}>
                      {kind}
                      {report.targetRole ? <> · {report.targetRole}</> : null}
                    </p>
                  </Link>
                )}
              </div>

              {!isRenaming ? (
                <div className={styles.actions}>
                  <Button type="button" variant="quiet" size="icon" onClick={() => beginRename(report)} aria-label={`Rename ${title}`} title="Rename">
                    <PencilSimple className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="quiet"
                    size="icon"
                    onClick={() => setDeleteId(report.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${title}`}
                    title="Delete"
                  >
                    <Trash className="size-4" aria-hidden="true" />
                  </Button>
                  <Link href={`/reports/${report.id}`} className={`focus-ring ${styles.arrow}`} aria-label={`Open ${title}`} tabIndex={-1}>
                    <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

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
