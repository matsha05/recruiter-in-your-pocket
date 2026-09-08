"use client";

import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, FileText, Loader2, Pencil, Trash2, X } from "lucide-react";
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
        <h2 className="font-display text-report-title text-foreground">No saved reports yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Get a report on your resume, then save it to return to the feedback later.
        </p>
        <Button asChild className="mt-6">
          <Link
            href="/workspace"
          >
            Get your first report
            <ArrowRight className="size-4" aria-hidden="true" />
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
            <article key={report.id} className="group grid gap-5 p-5 transition-colors hover:bg-muted/40 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ScoreBadge score={report.score ?? 0} />
                  <span className="text-xs text-muted-foreground">{formatReportDate(report.createdAt)}</span>
                  {report.targetRole && report.targetRole !== title ? (
                    <span className="max-w-full rounded-full bg-brand-tint px-2.5 py-1 text-xs text-brand [overflow-wrap:anywhere]">
                      {report.targetRole}
                    </span>
                  ) : null}
                </div>

                {isRenaming ? (
                  <div className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row">
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
                        disabled={savingId === report.id}
                      >
                        {savingId === report.id ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : null}
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
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link href={`/reports/${report.id}`} className="focus-ring mt-3 block rounded-lg">
                    <h2 className="break-words font-display text-xl font-medium leading-7 text-foreground transition-colors group-hover:text-brand">{title}</h2>
                    {report.resumePreview ? (
                      <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">{report.resumePreview}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Open the saved report and its recommended fixes.</p>
                    )}
                  </Link>
                )}
              </div>

              {!isRenaming ? (
                <div className="flex flex-wrap items-center gap-1 lg:self-start">
                  <Link
                    href={`/reports/${report.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => beginRename(report)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(report.id)}
                    className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
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
