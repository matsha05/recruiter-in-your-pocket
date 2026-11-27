"use client";

import { discardPendingLineAnswers } from "@/lib/reports/line-answers";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

/**
 * Naming and deleting a saved report, from the report itself (Nov 11, 2026). My reports is a list that opens
 * reports; what a person does to one report lives where they are looking at it. A deleted report goes back to
 * the list.
 */
export function ReportManageMenu({ reportId, initialName }: { reportId: string; initialName: string | null }) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [draft, setDraft] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveName() {
    if (saving) return;
    const next = draft.trim();
    if (next === name) {
      setRenaming(false);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new ClientActionError(data?.message, "Could not rename this report. Try again.");
      setName(next);
      setRenaming(false);
      toast.success(next ? "Report renamed" : "Report name cleared");
    } catch (error) {
      toast.error(getClientActionError(error, "Could not rename this report. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteReport() {
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new ClientActionError(data?.message, "Could not delete this report. Try again.");
      discardPendingLineAnswers(reportId);
      toast.success("Report deleted");
      router.push("/reports");
      router.refresh();
    } catch (error) {
      toast.error(getClientActionError(error, "Could not delete this report. Try again."));
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="quiet" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Rename or delete this report" data-testid="report-manage">
            <DotsThree className="size-5" weight="bold" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="min-h-11" onSelect={() => { setDraft(name); setRenaming(true); }}>
            <PencilSimple className="mr-2 size-4" aria-hidden="true" />
            {name ? "Rename" : "Name this report"}
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-11 text-destructive focus:text-destructive" onSelect={() => setConfirmingDelete(true)}>
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Delete report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renaming} onOpenChange={(open) => { if (!open && !saving) setRenaming(false); }}>
        <DialogContent className="max-w-[420px] p-6">
          <DialogHeader className="gap-y-2">
            <DialogTitle className="font-display text-lg font-bold">{name ? "Rename this report" : "Name this report"}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">The name leads its row on My reports. Leave it empty to show the verdict instead.</DialogDescription>
          </DialogHeader>
          <form className="mt-4 flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); void saveName(); }}>
            <label htmlFor="report-name" className="sr-only">Report name</label>
            <Input id="report-name" value={draft} maxLength={100} autoFocus onChange={(event) => setDraft(event.target.value)} placeholder="Name this version" className="min-h-12 text-base" />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setRenaming(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={saving} loadingLabel="Saving…">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() => void deleteReport()}
        title="Delete this report?"
        description={`${name || "This report"} will be permanently deleted. Your account and any other saved reports will stay intact.`}
        confirmText="Delete report"
        variant="destructive"
        loading={deleting}
      />
    </>
  );
}
