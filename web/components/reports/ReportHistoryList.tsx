"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, FileText, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { EmptyReportIcon } from "@/components/icons";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

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

function reportTitle(report: ReportHistoryItem) {
  return report.name || report.targetRole || "Saved report";
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
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Could not rename this report.");

      setReports((current) => current.map((item) => (
        item.id === report.id ? { ...item, name: nextName || null } : item
      )));
      cancelRename();
      toast.success(nextName ? "Report renamed" : "Report name cleared");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not rename this report.");
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
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Could not delete this report.");

      setReports((current) => current.filter((report) => report.id !== reportId));
      setDeleteId(null);
      toast.success("Report deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete this report.");
    } finally {
      setDeletingId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="border-y border-border bg-card p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center border border-cyan-bright/35 bg-surface-sky text-brand">
          <EmptyReportIcon className="size-12" />
        </div>
        <h2 className="font-display text-2xl text-foreground">No saved reports yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Run a first read, then keep the versions you want to compare or revisit.
        </p>
        <Link
          href="/workspace"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Get your first report
          <ArrowRight className="size-4 text-citron" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border border-y border-border bg-card">
        {reports.map((report) => {
          const title = reportTitle(report);
          const isRenaming = renamingId === report.id;

          return (
            <article key={report.id} className="group grid gap-4 p-5 transition-colors hover:bg-mineral sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ScoreBadge score={report.score ?? 0} />
                  <span className="text-xs text-muted-foreground">{formatReportDate(report.createdAt)}</span>
                  {report.targetRole && report.targetRole !== title ? (
                    <span className="border-l-2 border-cyan-bright bg-surface-sky px-2 py-1 text-xs text-muted-foreground">
                      {report.targetRole}
                    </span>
                  ) : null}
                </div>

                {isRenaming ? (
                  <div className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row">
                    <label htmlFor={`report-name-${report.id}`} className="sr-only">Report name</label>
                    <input
                      id={`report-name-${report.id}`}
                      value={draftName}
                      maxLength={100}
                      autoFocus
                      onChange={(event) => setDraftName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void saveRename(report);
                        if (event.key === "Escape") cancelRename();
                      }}
                      className="min-h-11 min-w-0 flex-1 border border-foreground/25 bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15"
                      placeholder="Name this version"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveRename(report)}
                        disabled={savingId === report.id}
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
                      >
                        {savingId === report.id ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : null}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        className="inline-flex size-11 items-center justify-center rounded-md border border-foreground/25 bg-background text-muted-foreground hover:text-foreground"
                        aria-label="Cancel rename"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href={`/reports/${report.id}`} className="focus-ring mt-3 block rounded-sm">
                    <h2 className="font-display text-xl text-foreground transition-colors group-hover:text-brand">{title}</h2>
                    {report.resumePreview ? (
                      <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">{report.resumePreview}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Open the recruiter read and its saved fixes.</p>
                    )}
                  </Link>
                )}
              </div>

              {!isRenaming ? (
                <div className="flex items-center gap-1 sm:self-start">
                  <Link
                    href={`/reports/${report.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => beginRename(report)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-paper-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(report.id)}
                    className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${title}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
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
