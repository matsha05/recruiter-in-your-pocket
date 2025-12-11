export type ResumeFeedbackRequest = {
  text: string;
  jobDescription?: string;
  mode?: "resume" | "resume_ideas";
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

export async function createCheckoutSession(tier: "24h" | "30d" = "24h"): Promise<{ ok: boolean; url?: string; message?: string }> {
  const res = await fetch(`/api/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tier })
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
