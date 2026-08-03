import { withGenerationAccessOutcome } from "./billing/generationFailureCopy";
import {
  attachAnonymousReportRecoveryMarker,
  clearAnonymousReportRecoveryMarker,
  fetchAnonymousReportRecovery,
  type AnonymousReportRecoveryMarker,
} from "./reports/anonymous-report-recovery-client";

export type ResumeFeedbackRequest = {
  text: string;
  jobDescription?: string;
  savedJobId?: string | null;
  mode?: "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation";
  recovery_id?: string; operation_id?: string;
};

export type ResumeFeedbackResponse = {
  ok: true;
  data: {
    score?: number;
    score_label?: string;
    summary?: string;
    strengths?: string[];
    gaps?: string[];
    rewrites?: Array<{ label?: string; original?: string; better?: string; enhancement_note?: string }>;
    job_alignment?: {
      strongly_aligned?: string[];
      underplayed?: string[];
      missing?: string[];
    };
    next_steps?: string[];
  };
  free_uses_remaining?: number;
  access_tier?: string;
  access?: string;
  has_job_description?: boolean;
  report_id?: string | null;
  report_receipt?: string | null;
  recovery_id?: string | null; operation_id?: string | null;
};

export type ResumeFeedbackError = {
  ok: false;
  message?: string;
  errorCode?: string;
  free_uses_remaining?: number;
};

async function postResumeFeedback(payload: ResumeFeedbackRequest): Promise<ResumeFeedbackResponse | ResumeFeedbackError> {
  const requestPayload = {
    text: payload.text,
    jobDescription: payload.jobDescription,
    savedJobId: payload.savedJobId || undefined,
    mode: payload.mode || "resume",
  };
  const recovery = requestPayload.mode === "resume"
    ? attachAnonymousReportRecoveryMarker(requestPayload)
    : { marker: null, created: false, payload: requestPayload };
  const res = await fetch(`/api/resume-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(recovery.payload)
  });

  const data = await res.json();
  const recoveryMarker = recovery.marker;
  if (recoveryMarker && data?.operation_id === recoveryMarker.recoveryId && (
    data?.ok === true || data?.attempt_disposition === "restored" || data?.errorCode === "GENERATION_OPERATION_TERMINAL"
  )) clearAnonymousReportRecoveryMarker(recoveryMarker.recoveryId);
  else if (data?.ok === true && data?.recovery_id && recovery.marker) {
    data.data = { ...data.data, recovery_id: data.recovery_id };
  } else if (
    recovery.marker && recovery.created
    && data?.attempt_disposition !== "consumed"
    && data?.attempt_disposition !== "unknown"
  ) {
    clearAnonymousReportRecoveryMarker(recovery.marker.recoveryId);
  }
  return data;
}

export async function parseResume(formData: FormData): Promise<{ ok: boolean; text?: string; message?: string }> {
  const res = await fetch(`/api/parse-resume`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  return data;
}

// Wrapper for postResumeFeedback that returns data in format expected by WorkspaceClient
async function createResumeFeedback(resumeText: string, jobDescription?: string): Promise<{ ok: boolean; report?: any; message?: string }> {
  const result = await postResumeFeedback({
    text: resumeText,
    jobDescription,
    mode: "resume"
  });

  if (result.ok) {
    // The backend returns the report data in `data` property
    return {
      ok: true,
      report: result.data
    };
  }

  return {
    ok: false,
    message: result.message || "Failed to generate report"
  };
}

/**
 * Streaming version of createResumeFeedback.
 * A report is exposed only after the server sends the authoritative complete event.
 * Returns the complete report when done.
 */
export async function streamResumeFeedback(
  resumeText: string,
  jobDescription: string | undefined,
  onChunk: (partialJson: string, partialReport: any | null) => void,
  mode: "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" = "resume",
  options?: { signal?: AbortSignal; savedJobId?: string | null }
): Promise<{
  ok: boolean;
  report?: any;
  message?: string;
  errorCode?: string;
  aborted?: boolean;
  reportId?: string | null;
  accessConsumed?: boolean;
  attemptConsumed?: boolean;
  attemptDisposition?: "consumed" | "restored" | "unknown";
  creditRestored?: boolean;
}> {
  const attached = mode === "resume"
    ? attachAnonymousReportRecoveryMarker({
      text: resumeText,
      jobDescription,
      savedJobId: options?.savedJobId || undefined,
      mode,
    })
    : {
      marker: null,
      created: false,
      payload: {
        text: resumeText,
        jobDescription,
        savedJobId: options?.savedJobId || undefined,
        mode,
      },
    };
  const recoveryMarker = attached.marker;
  const recoveryMarkerWasCreated = attached.created;
  let res: Response;
  try {
    res = await fetch("/api/resume-feedback-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(attached.payload),
      signal: options?.signal
    });
  } catch (err: any) {
    if (options?.signal?.aborted) {
      return { ok: false, message: "Canceled", aborted: true };
    }
    return {
      ok: false,
      errorCode: "STREAM_TRANSPORT_ERROR",
      message: "The connection ended before the report finished.",
    };
  }

  if (!res.ok) {
    let message = `The report request failed with status ${res.status}. Please try again.`;
    let errorCode: string | undefined;
    let responseOperationId: string | null = null;
    try {
      const errorBody = await res.json();
      if (typeof errorBody?.message === "string") message = errorBody.message;
      if (typeof errorBody?.errorCode === "string") errorCode = errorBody.errorCode;
      if (typeof errorBody?.operation_id === "string") responseOperationId = errorBody.operation_id;
    } catch {
      // Keep the submitted recovery marker when terminality is not proven.
    }
    if (
      recoveryMarker
      && (
        errorCode === "GENERATION_OPERATION_CONFLICT"
        || (errorCode === "PAYWALL_REQUIRED"
          && responseOperationId === recoveryMarker.recoveryId)
        || (errorCode === "GENERATION_OPERATION_TERMINAL"
          && responseOperationId === recoveryMarker.recoveryId)
      )
    ) {
      clearAnonymousReportRecoveryMarker(recoveryMarker.recoveryId);
    }
    return {
      ok: false,
      errorCode,
      message: withGenerationAccessOutcome(message, false),
      accessConsumed: false,
    };
  }

  if (!res.body) {
    return {
      ok: false,
      errorCode: "STREAM_TRANSPORT_ERROR",
      message: "The connection ended before the report finished.",
    };
  }

  let acknowledgedRecoveryId = res.headers.get("x-riyp-recovery-id") === recoveryMarker?.recoveryId
    ? recoveryMarker.recoveryId
    : null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  void onChunk;
  let errorMessage: string | null = null;
  let errorCode: string | undefined;
  let attemptConsumed: boolean | undefined = res.headers.get("x-riyp-attempt-consumed") === "1"
    ? true
    : undefined;
  let attemptDisposition: "consumed" | "restored" | "unknown" | undefined = attemptConsumed
    ? "consumed"
    : undefined;
  let creditRestored = false;

  const recoverCompletedReport = async (marker: AnonymousReportRecoveryMarker | null) => {
    if (!marker || acknowledgedRecoveryId !== marker.recoveryId) return null;
    const recovered = await fetchAnonymousReportRecovery(marker);
    return recovered.status === "found"
      ? { ...recovered.report, recovery_id: recovered.recoveryId }
      : null;
  };

  while (true) {
    let readResult: ReadableStreamReadResult<Uint8Array>;
    try {
      readResult = await reader.read();
    } catch (err: any) {
      if (options?.signal?.aborted) {
        return { ok: false, message: "Canceled", aborted: true, attemptConsumed, attemptDisposition, creditRestored };
      }
      const recoveredReport = await recoverCompletedReport(recoveryMarker);
      if (recoveredReport) {
        return {
          ok: true,
          report: recoveredReport,
          reportId: null,
          accessConsumed: true,
          attemptConsumed: true,
          attemptDisposition: "consumed",
        };
      }
      return {
        ok: false,
        errorCode: "STREAM_TRANSPORT_ERROR",
        message: "The connection ended before the report finished.",
        attemptConsumed,
        attemptDisposition,
        creditRestored,
      };
    }
    const { done, value } = readResult;
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line);

        if (event.type === "complete" && event.data && typeof event.data === "object") {
          const completeReport = event.data;
          if (event.report_id) completeReport.report_id = event.report_id;
          if (event.report_receipt) completeReport.report_receipt = event.report_receipt;
          const completedOperationId = recoveryMarker && event.operation_id === recoveryMarker.recoveryId ? recoveryMarker.recoveryId : null;
          if (completedOperationId) clearAnonymousReportRecoveryMarker(completedOperationId);
          const completedRecoveryId = !completedOperationId && recoveryMarker && event.recovery_id === recoveryMarker.recoveryId
            ? recoveryMarker.recoveryId
            : acknowledgedRecoveryId;
          if (completedRecoveryId) completeReport.recovery_id = completedRecoveryId;
          else if (recoveryMarker && recoveryMarkerWasCreated) clearAnonymousReportRecoveryMarker(recoveryMarker.recoveryId);
          void reader.cancel().catch(() => undefined);
          return {
            ok: true,
            report: completeReport,
            reportId: event.report_id || null,
            accessConsumed: true,
            attemptConsumed: true,
            attemptDisposition: "consumed",
          };
        } else if (event.type === "error") {
          errorMessage = event.message;
          errorCode = typeof event.errorCode === "string" ? event.errorCode : undefined;
          attemptDisposition = event.attempt_disposition === "consumed"
            || event.attempt_disposition === "restored"
            || event.attempt_disposition === "unknown"
            ? event.attempt_disposition
            : undefined;
          attemptConsumed = attemptDisposition === "unknown"
            ? undefined
            : event.attempt_consumed === true
              ? true
              : event.access_consumed === true
                ? true
                : event.credit_restored === true || event.access_consumed === false
                  ? false
                  : undefined;
          creditRestored = event.credit_restored === true;
          if (recoveryMarker && (
            errorCode === "GENERATION_OPERATION_CONFLICT"
            || (event.operation_id === recoveryMarker.recoveryId
              && (attemptDisposition === "restored"
                || errorCode === "GENERATION_OPERATION_TERMINAL"
                || errorCode === "PAYWALL_REQUIRED"))
          )) clearAnonymousReportRecoveryMarker(recoveryMarker.recoveryId);
          if (creditRestored && recoveryMarker && recoveryMarkerWasCreated) clearAnonymousReportRecoveryMarker(recoveryMarker.recoveryId);
        } else if (event.type === "meta") {
          if (recoveryMarker && event.recovery_id === recoveryMarker.recoveryId) {
            acknowledgedRecoveryId = recoveryMarker.recoveryId;
          }
          if (event.attempt_consumed === true) {
            attemptConsumed = true;
            attemptDisposition = "consumed";
          }
        }
      } catch {
        // Ignore malformed lines
      }
    }
  }

  if (errorMessage) {
    const recoveredReport = attemptConsumed !== false
      ? await recoverCompletedReport(recoveryMarker)
      : null;
    if (recoveredReport) {
      return {
        ok: true,
        report: recoveredReport,
        reportId: null,
        accessConsumed: true,
        attemptConsumed: true,
        attemptDisposition: "consumed",
      };
    }
    return {
      ok: false,
      errorCode,
      message: errorMessage,
      accessConsumed: attemptConsumed,
      attemptConsumed,
      attemptDisposition,
      creditRestored,
    };
  }

  const recoveredReport = await recoverCompletedReport(recoveryMarker);
  if (recoveredReport) {
    return {
      ok: true,
      report: recoveredReport,
      reportId: null,
      accessConsumed: true,
      attemptConsumed: true,
      attemptDisposition: "consumed",
    };
  }
  return {
    ok: false,
    errorCode: "STREAM_TRANSPORT_ERROR",
    message: "The connection ended before the report finished.",
    accessConsumed: attemptConsumed,
    attemptConsumed,
    attemptDisposition,
    creditRestored,
  };
}

// ============================================
// LinkedIn API Functions
// ============================================

export type LinkedInFeedbackRequest = {
  profileUrl?: string;
  pdfText?: string;
  source: 'url' | 'pdf';
};

export type LinkedInStreamResult = {
  ok: boolean;
  report?: any;
  profile?: any;
  message?: string;
  errorCode?: string;
  fallback?: 'pdf';
};

/**
 * Streaming LinkedIn profile feedback.
 * Calls onChunk with raw progress only. A report object is exposed only after
 * the server sends the authoritative complete event.
 * Returns the complete report when done.
 */
export async function streamLinkedInFeedback(
  input: LinkedInFeedbackRequest,
  onChunk: (partialJson: string, partialReport: any | null) => void,
  onMeta?: (meta: { name?: string; headline?: string; source?: string }) => void,
  options?: { signal?: AbortSignal }
): Promise<LinkedInStreamResult & { aborted?: boolean }> {
  let res: Response;
  try {
    res = await fetch("/api/linkedin-feedback-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        profileUrl: input.profileUrl,
        pdfText: input.pdfText,
        source: input.source,
      }),
      signal: options?.signal
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { ok: false, message: "Canceled", aborted: true };
    }
    throw err;
  }

  if (!res.ok) {
    return { ok: false, message: `HTTP error: ${res.status}` };
  }

  if (!res.body) {
    return { ok: false, message: "No response body" };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulatedJson = "";
  let finalReport: any = null;
  let finalProfile: any = null;
  let errorMessage: string | null = null;
  let errorCode: string | null = null;
  let fallback: 'pdf' | undefined = undefined;

  while (true) {
    let readResult: ReadableStreamReadResult<Uint8Array>;
    try {
      readResult = await reader.read();
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return { ok: false, message: "Canceled", aborted: true };
      }
      throw err;
    }
    const { done, value } = readResult;
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line);

        if (event.type === "chunk") {
          accumulatedJson += event.content;
          onChunk(accumulatedJson, null);
        } else if (event.type === "complete") {
          finalReport = event.data;
          finalProfile = event.profile;
        } else if (event.type === "error") {
          errorMessage = event.message;
          errorCode = event.errorCode;
          if (event.fallback) fallback = event.fallback;
        } else if (event.type === "meta") {
          onMeta?.(event.profile || {});
        }
      } catch {
        // Ignore malformed lines
      }
    }
  }

  if (errorMessage) {
    return { ok: false, message: errorMessage, errorCode: errorCode || undefined, fallback };
  }

  if (finalReport) {
    return { ok: true, report: finalReport, profile: finalProfile };
  }

  return { ok: false, message: "Stream ended without completion" };
}
