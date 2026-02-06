import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ReviewMode } from "@/components/workspace/ModeSwitcher";

type WorkspaceInitOptions = {
  searchParams: ReadonlyURLSearchParams;
  setResumeText: Dispatch<SetStateAction<string>>;
  setSkipSample: Dispatch<SetStateAction<boolean>>;
  setReviewMode: Dispatch<SetStateAction<ReviewMode>>;
  pendingAutoRunRef: MutableRefObject<boolean>;
};

export function useWorkspaceInit({
  searchParams,
  setResumeText,
  setSkipSample,
  setReviewMode,
  pendingAutoRunRef
}: WorkspaceInitOptions) {
  useEffect(() => {
    const pendingText = sessionStorage.getItem("pending_resume_text");
    const autoRun = sessionStorage.getItem("pending_auto_run");

    if (pendingText) {
      setResumeText(pendingText);
      sessionStorage.removeItem("pending_resume_text");
      sessionStorage.removeItem("pending_auto_run");
      setSkipSample(true);

      if (autoRun === "true") {
        pendingAutoRunRef.current = true;
      }
    }

    const modeParam = searchParams.get("mode");
    if (modeParam === "linkedin") {
      setReviewMode("linkedin");
    }
  }, [searchParams, setResumeText, setSkipSample, setReviewMode, pendingAutoRunRef]);
}
