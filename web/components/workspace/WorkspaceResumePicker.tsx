"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import type { ResumeFileSelectionOptions } from "./hooks/useResumeReview";

export type WorkspaceResumePickerHandle = { open: () => void };

export const WorkspaceResumePicker = forwardRef<WorkspaceResumePickerHandle, {
  onFileSelect: (file: File, options?: ResumeFileSelectionOptions) => Promise<boolean>;
  onStartFresh?: () => void;
  onUploaded: (fileName: string) => void;
  onOpen?: () => void;
  isBusy: boolean;
}>(function WorkspaceResumePicker({ onFileSelect, onStartFresh, onUploaded, onOpen, isBusy }, ref) {
  const input = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  useImperativeHandle(ref, () => ({
    open() {
      if (isBusy || isReading) {
        toast.message("Wait for this report to finish or stop it before uploading another resume.");
        return;
      }
      onOpen?.();
      input.current?.click();
    },
  }), [isBusy, isReading, onOpen]);

  return <>
    <input
      ref={input}
      type="file"
      hidden
      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      aria-label="Upload resume file from commands"
      onChange={async (event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;
        if (file.size > 4 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(file.name)) {
          toast.error("Choose a PDF or DOCX under 4 MB.");
          return;
        }
        setIsReading(true);
        try {
          const accepted = await onFileSelect(file, { onParsed: onStartFresh, preserveExisting: true });
          if (accepted) onUploaded(file.name);
        } finally {
          setIsReading(false);
        }
      }}
    />
    <p role="status" aria-live="polite" className="sr-only">{isReading ? "Reading your resume file." : ""}</p>
  </>;
});
