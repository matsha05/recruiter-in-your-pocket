"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ExternalLink, ChevronDown, Check, Building2, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JobDetail, JobStatus } from "@/components/jobs/jobDetailTypes";
import { STATUS_CONFIG } from "@/components/jobs/jobDetailTypes";

type JobDetailHeaderProps = {
  jobId: string;
  job: JobDetail;
  onJobUpdate: Dispatch<SetStateAction<JobDetail | null>>;
};

export default function JobDetailHeader({ jobId, job, onJobUpdate }: JobDetailHeaderProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusConfig = STATUS_CONFIG[job.status];
  const capturedDate = new Date(job.captured_at);

  const handleStatusSelect = async (statusKey: JobStatus) => {
    if (statusKey === job.status) {
      setStatusMenuOpen(false);
      return;
    }

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
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
      setStatusMenuOpen(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">
            {job.title}
          </h1>
          <div className="relative">
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              disabled={updatingStatus}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors",
                statusConfig.bgColor,
                statusConfig.color,
                "hover:opacity-80 cursor-pointer"
              )}
            >
              {statusConfig.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {statusMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded shadow-sm z-50">
                {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((statusKey) => {
                  const config = STATUS_CONFIG[statusKey];
                  const isSelected = job.status === statusKey;
                  return (
                    <button
                      key={statusKey}
                      onClick={() => handleStatusSelect(statusKey)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm flex items-center justify-between",
                        "hover:bg-muted transition-colors",
                        isSelected && "bg-muted/50"
                      )}
                    >
                      <span className={config.color}>{config.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-success" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {job.company}
          </span>
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Captured {capturedDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border hover:bg-muted transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        View Original
      </a>
    </div>
  );
}
