export type ResumeFeedbackRequest = {
  text: string;
  jobDescription?: string;
  savedJobId?: string | null;
  mode?: "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation";
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
};

export type ResumeFeedbackError = {
  ok: false;
  message?: string;
  errorCode?: string;
  free_uses_remaining?: number;
};

async function postResumeFeedback(
  payload: ResumeFeedbackRequest
): Promise<ResumeFeedbackResponse | ResumeFeedbackError> {
  const res = await fetch(`/api/resume-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      text: payload.text,
      jobDescription: payload.jobDescription,
      savedJobId: payload.savedJobId || undefined,
      mode: payload.mode || "resume"
    })
  });

  const data = await res.json();
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
  attemptConsumed?: boolean;
  creditRestored?: boolean;
}> {
  let res: Response;
  try {
    res = await fetch("/api/resume-feedback-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        text: resumeText,
        jobDescription,
        savedJobId: options?.savedJobId || undefined,
        mode: mode
      }),
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
    return { ok: false, message: `HTTP error: ${res.status}` };
  }

  if (!res.body) {
    return {
      ok: false,
      errorCode: "STREAM_TRANSPORT_ERROR",
      message: "The connection ended before the report finished.",
    };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  void onChunk;
  let finalReport: any = null;
  let finalReportId: string | null = null;
  let errorMessage: string | null = null;
  let errorCode: string | undefined;
  let attemptConsumed: boolean | undefined = res.headers.get("x-riyp-attempt-consumed") === "1"
    ? true
    : undefined;
  let creditRestored = false;

  while (true) {
    let readResult: ReadableStreamReadResult<Uint8Array>;
    try {
      readResult = await reader.read();
    } catch (err: any) {
      if (options?.signal?.aborted) {
        return { ok: false, message: "Canceled", aborted: true, attemptConsumed, creditRestored };
      }
      return {
        ok: false,
        errorCode: "STREAM_TRANSPORT_ERROR",
        message: "The connection ended before the report finished.",
        attemptConsumed,
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

        if (event.type === "complete") {
          finalReport = event.data;
          if (finalReport && event.report_id) {
            finalReport.report_id = event.report_id;
          }
          if (finalReport && event.report_receipt) {
            finalReport.report_receipt = event.report_receipt;
          }
          finalReportId = event.report_id || null;
        } else if (event.type === "error") {
          errorMessage = event.message;
          errorCode = typeof event.errorCode === "string" ? event.errorCode : undefined;
          attemptConsumed = event.attempt_consumed === true
            ? true
            : event.credit_restored === true
              ? false
              : undefined;
          creditRestored = event.credit_restored === true;
        } else if (event.type === "meta") {
          if (event.attempt_consumed === true) attemptConsumed = true;
        }
      } catch {
        // Ignore malformed lines
      }
    }
  }

  if (errorMessage) {
    return { ok: false, errorCode, message: errorMessage, attemptConsumed, creditRestored };
  }

  if (finalReport) {
    return { ok: true, report: finalReport, reportId: finalReportId, attemptConsumed: true };
  }

  return {
    ok: false,
    errorCode: "STREAM_TRANSPORT_ERROR",
    message: "The connection ended before the report finished.",
    attemptConsumed,
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

/**
 * Parse a LinkedIn PDF file and return the extracted text.
 */
async function parseLinkedInPdf(file: File): Promise<{ ok: boolean; text?: string; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "linkedin");

  const res = await fetch("/api/parse-resume", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data;
}
