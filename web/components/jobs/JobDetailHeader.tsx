"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowSquareOut, Buildings, CalendarBlank, CaretDown, MapPin } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JobDetail, JobStatus } from "@/components/jobs/jobDetailTypes";
import { STATUS_CONFIG } from "@/components/jobs/jobDetailTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type JobDetailHeaderProps = {
  jobId: string;
  job: JobDetail;
  onJobUpdate: Dispatch<SetStateAction<JobDetail | null>>;
};

export default function JobDetailHeader({ jobId, job, onJobUpdate }: JobDetailHeaderProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusConfig = STATUS_CONFIG[job.status];
  const capturedDate = new Date(job.captured_at);

  const handleStatusSelect = async (statusKey: JobStatus) => {
    if (statusKey === job.status) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/extension/saved-jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusKey })
      });
      if (res.ok) {
        onJobUpdate((prev) => (prev ? { ...prev, status: statusKey } : prev));
        toast.success(`Status updated to ${STATUS_CONFIG[statusKey].label}`);
      } else {
        toast.error("We couldn't update the status. Please try again.");
      }
    } catch {
      toast.error("We couldn't update the status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Saved role
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-report-title tracking-tight text-foreground">
            Application status
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={updatingStatus}
                className={cn(
                  "inline-flex min-h-12 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45",
                  statusConfig.bgColor,
                  statusConfig.color,
                  "cursor-pointer hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
                )}
              >
                {updatingStatus ? "Updating…" : statusConfig.label}
                <CaretDown className="size-3" weight="bold" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-xl border-border bg-card p-1.5">
              <DropdownMenuRadioGroup
                value={job.status}
                onValueChange={(value) => void handleStatusSelect(value as JobStatus)}
                aria-label="Application status"
              >
                {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((statusKey) => {
                  const config = STATUS_CONFIG[statusKey];
                  return (
                    <DropdownMenuRadioItem
                      key={statusKey}
                      value={statusKey}
                      className="min-h-11 rounded-lg focus:bg-muted"
                    >
                      <span className={config.color}>{config.label}</span>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
            <Buildings className="size-4" aria-hidden="true" />
            {job.company}
          </span>
          {job.location && (
            <span className="flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
              <MapPin className="size-4" aria-hidden="true" />
              {job.location}
            </span>
          )}
          <span className="flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
            <CalendarBlank className="size-4" aria-hidden="true" />
            Saved {capturedDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-start">
        <Button asChild>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowSquareOut className="size-4" aria-hidden="true" />
            View job posting
          </a>
        </Button>
      </div>
    </div>
  );
}
