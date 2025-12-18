import crypto from "crypto";
import type { OutcomeCategory } from "./outcomes";
import { containsForbiddenKeys } from "./pii";

export type LogLevel = "info" | "error";

export type LogRecord = {
  ts: string;
  level: LogLevel;
  msg: string;

  service: "recruiter-in-your-pocket";
  env: "development" | "preview" | "production";

  request_id?: string;
  route?: string;
  method?: string;
  path?: string;
  status?: number;
  latency_ms?: number;

  user_id?: string;
  outcome?: OutcomeCategory;

  http?: { body_bytes?: number; query_keys?: string[] };
  supabase?: { table?: string; op?: string; rows?: number; error_code?: string };
  stripe?: { event_id?: string; event_type?: string; session_id?: string };
  llm?: {
    task?: string;
    model?: string;
    prompt_version?: string;
    schema_version?: string;
    tokens_in?: number;
    tokens_out?: number;
    latency_ms?: number;
    cost_estimate_usd?: number;
    cache_hit?: boolean;
    idempotency_key_hash?: string;
  };

  err?: { name: string; message: string; code?: string; stack?: string };
};

function envLabel(): LogRecord["env"] {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  return "development";
}

function safeJson(obj: unknown) {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({ ts: new Date().toISOString(), level: "error", msg: "log.serialization_failed" });
  }
}

function shouldIncludeStack() {
  return envLabel() !== "production";
}

export function hashForLogs(value: string): string {
  const salt = process.env.SESSION_SECRET || "no-secret";
  return crypto.createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export function log(level: LogLevel, record: Omit<LogRecord, "ts" | "level" | "service" | "env">) {
  if (containsForbiddenKeys(record)) {
    const scrubbed: LogRecord = {
      ts: new Date().toISOString(),
      level: "error",
      msg: "log.pii_blocked",
      service: "recruiter-in-your-pocket",
      env: envLabel()
    };
    // eslint-disable-next-line no-console
    console.error(safeJson(scrubbed));
    return;
  }

  const full: LogRecord = {
    ts: new Date().toISOString(),
    level,
    msg: record.msg,
    service: "recruiter-in-your-pocket",
    env: envLabel(),
    ...record
  };

  if (level === "error" && full.err?.stack && !shouldIncludeStack()) {
    delete full.err.stack;
  }

  // eslint-disable-next-line no-console
  (level === "error" ? console.error : console.log)(safeJson(full));
}

export function logInfo(record: Omit<LogRecord, "ts" | "level" | "service" | "env">) {
  log("info", record);
}

export function logError(record: Omit<LogRecord, "ts" | "level" | "service" | "env">) {
  log("error", record);
}

