export type ResumeFeedbackRequest = {
  text: string;
  jobDescription?: string;
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
    missing_wins?: string[];
    next_steps?: string[];
  };
  free_uses_remaining?: number;
  access_tier?: string;
  access?: string;
};

export type ResumeFeedbackError = {
  ok: false;
  message?: string;
  errorCode?: string;
  free_uses_remaining?: number;
};

export async function postResumeFeedback(
  payload: ResumeFeedbackRequest
): Promise<ResumeFeedbackResponse | ResumeFeedbackError> {
  const res = await fetch(`/api/resume-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      text: payload.text,
      jobDescription: payload.jobDescription,
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
export async function createResumeFeedback(resumeText: string, jobDescription?: string): Promise<{ ok: boolean; report?: any; message?: string }> {
  const result = await postResumeFeedback({
    text: resumeText,
    jobDescription,
    mode: "resume"
  });

  console.log("[createResumeFeedback] API response:", result);

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
 * Calls onChunk with accumulated JSON as it arrives.
 * Returns the complete report when done.
 */
export async function streamResumeFeedback(
  resumeText: string,
  jobDescription: string | undefined,
  onChunk: (partialJson: string, partialReport: any | null) => void,
  mode: "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" = "resume"
): Promise<{ ok: boolean; report?: any; message?: string }> {
  console.log("[streamResumeFeedback] Starting...");

  const res = await fetch("/api/resume-feedback-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      text: resumeText,
      jobDescription,
      mode: mode
    })
  });

  console.log("[streamResumeFeedback] Response status:", res.status);

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
  let errorMessage: string | null = null;
  let chunkCount = 0;

  console.log("[streamResumeFeedback] Starting to read stream...");

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("[streamResumeFeedback] Stream done after", chunkCount, "chunks");
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line);
        chunkCount++;

        if (event.type === "chunk") {
          accumulatedJson += event.content;
          // Log progress every 10 chunks
          if (chunkCount % 10 === 0) {
            console.log(`[streamResumeFeedback] Received ${chunkCount} chunks, JSON length: ${accumulatedJson.length}`);
          }
          // Try to parse partial JSON for early display
          const partialReport = tryParsePartialJson(accumulatedJson);
          if (partialReport) {
            console.log("[streamResumeFeedback] Parsed partial report with keys:", Object.keys(partialReport));
          }
          onChunk(accumulatedJson, partialReport);
        } else if (event.type === "complete") {
          console.log("[streamResumeFeedback] Got complete event");
          finalReport = event.data;
        } else if (event.type === "error") {
          console.log("[streamResumeFeedback] Got error event:", event.message);
          errorMessage = event.message;
        } else if (event.type === "meta") {
          console.log("[streamResumeFeedback] Got meta event:", event);
        }
      } catch {
        // Ignore malformed lines
      }
    }
  }

  if (errorMessage) {
    return { ok: false, message: errorMessage };
  }

  if (finalReport) {
    return { ok: true, report: finalReport };
  }

  return { ok: false, message: "Stream ended without completion" };
}

/**
 * Attempts to parse partial JSON and extract any complete fields.
 * Returns null if parsing fails.
 */
function tryParsePartialJson(json: string): any | null {
  // Try direct parse first
  try {
    return JSON.parse(json);
  } catch {
    // Try to close incomplete object
    let attempt = json;
    // Count open braces/brackets and close them
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escaped = false;

    for (const char of attempt) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (char === "{") braceCount++;
      if (char === "}") braceCount--;
      if (char === "[") bracketCount++;
      if (char === "]") bracketCount--;
    }

    // Add missing closers
    for (let i = 0; i < bracketCount; i++) attempt += "]";
    for (let i = 0; i < braceCount; i++) attempt += "}";

    try {
      return JSON.parse(attempt);
    } catch {
      return null;
    }
  }
}
