"use client";

import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { EmptyReportIcon } from "@/components/icons";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ReportHistoryItem = {
  id: string;
  score: number | null;
  resumePreview: string | null;
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

// targetRole is the report's best-fit role suggestion, not the person's job,
// so it stays in the meta line and never becomes the title.
function reportTitle(report: ReportHistoryItem) {
  return report.name || "Resume review";
}

export function ReportHistoryList({ initialReports }: { initialReports: ReportHistoryItem[] }) {
  const router = useRouter();
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
      if (!response.ok || !data?.ok) throw new ClientActionError(data?.message, "Could not rename this report. Please try again.");

      setReports((current) => current.map((item) => (
        item.id === report.id ? { ...item, name: nextName || null } : item
      )));
      cancelRename();
      toast.success(nextName ? "Report renamed" : "Report name cleared");
      router.refresh();
    } catch (error) {
      toast.error(getClientActionError(error, "Could not rename this report. Please try again."));
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
      if (!response.ok || !data?.ok) throw new ClientActionError(data?.message, "Could not delete this report. Please try again.");

      setReports((current) => current.filter((report) => report.id !== reportId));
      setDeleteId(null);
      toast.success("Report deleted");
      router.refresh();
    } catch (error) {
      toast.error(getClientActionError(error, "Could not delete this report. Please try again."));
    } finally {
      setDeletingId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center sm:rounded-3xl sm:p-12">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-tint text-brand">
          <EmptyReportIcon className="size-12" />
        </div>
        <h2 className="font-display text-report-title text-foreground">Nothing here yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Your first read is free. It&apos;ll wait here, Verdict and all, for whenever you revise.
        </p>
        <Button asChild className="mt-6">
          <Link
            href="/workspace"
          >
            Get your first report
            <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl">
        {reports.map((report) => {
          const title = reportTitle(report);
          const isRenaming = renamingId === report.id;

          return (
            <article key={report.id} className="group grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-4 gap-y-3 p-5 transition-colors duration-fast ease-snap hover:bg-muted/40 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:p-6">
              <ScoreBadge score={report.score ?? 0} className="pt-0.5" />
              <div className="min-w-0">
                <p className="text-[0.8125rem] text-muted-foreground [overflow-wrap:anywhere]">
                  {formatReportDate(report.createdAt)}
                  {report.targetRole ? <> · Points toward {report.targetRole}</> : null}
                </p>

                {isRenaming ? (
                  <div className="mt-2 flex max-w-xl flex-col gap-2 sm:flex-row">
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
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Cancel rename"
                      >
                        <X className="size-4" weight="bold" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link href={`/reports/${report.id}`} className="focus-ring mt-1 block rounded-lg">
                    <h2 className="break-words font-display text-xl font-bold leading-7 text-foreground transition-colors duration-fast ease-snap group-hover:text-brand">{title}</h2>
                    {report.resumePreview ? (
                      <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">{report.resumePreview}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Open the report to see the Verdict and fixes.</p>
                    )}
                  </Link>
                )}
              </div>

              {!isRenaming ? (
                <div className="col-start-2 -ml-3 flex flex-wrap items-center gap-1 sm:col-start-3 sm:ml-0 sm:self-start">
                  <Link
                    href={`/reports/${report.id}`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-fast ease-snap hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Open
                    <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => beginRename(report)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <PencilSimple className="size-4" aria-hidden="true" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(report.id)}
                    className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    aria-label={`Delete ${title}`}
                  >
                    <Trash className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

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
