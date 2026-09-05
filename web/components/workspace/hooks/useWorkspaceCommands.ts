"use client";

import { toast } from "sonner";
import { useCommandAction } from "@/components/CommandPalette";

export function useWorkspaceCommands(input: {
  hasReport: boolean;
  canExportPdf: boolean;
  onExport: () => void;
  onUpgrade: () => void;
  onUpload: () => void;
  onRun: () => void;
}) {
  useCommandAction((action) => {
    switch (action) {
      case "export-pdf":
        if (input.hasReport && input.canExportPdf) input.onExport();
        else if (input.hasReport) input.onUpgrade();
        break;
      case "copy-link":
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
        break;
      case "upload":
        input.onUpload();
        break;
      case "run-analysis":
        input.onRun();
        break;
      case "keyboard-shortcuts":
        toast.info("Press Cmd+K on Mac or Ctrl+K on Windows to open commands. Use the arrow keys to choose an action, then press Enter.");
        break;
    }
  });
}
