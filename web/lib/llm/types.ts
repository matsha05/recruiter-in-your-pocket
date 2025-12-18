export type LlmTask = "resume_feedback" | "resume_ideas";

export type LlmTelemetry = {
  request_id: string;
  user_id?: string;
  task: LlmTask;
  model: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost_estimate_usd: number;
  outcome:
    | "success"
    | "timeout"
    | "rate_limited"
    | "network_error"
    | "provider_error"
    | "schema_invalid"
    | "internal_error";
};

export type LlmRunContext = {
  request_id: string;
  user_id?: string;
  route: string;
};

