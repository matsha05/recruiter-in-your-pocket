import crypto from "crypto";
import type { OutcomeCategory } from "./outcomes";

export type RequestContext = {
  request_id: string;
  route: string;
  method: string;
  path: string;
  user_id?: string;
};

export function getRequestId(req: Request): string {
  const existing = req.headers.get("x-request-id") || req.headers.get("x-vercel-id");
  return existing && existing.trim() ? existing.trim() : crypto.randomUUID();
}

export function routeLabel(req: Request): { method: string; path: string } {
  const url = new URL(req.url);
  return { method: req.method.toUpperCase(), path: url.pathname };
}

export function outcomeFromHttpStatus(status: number): OutcomeCategory {
  if (status >= 200 && status < 300) return "success";
  if (status === 400) return "validation_error";
  if (status === 401) return "auth_required";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status === 408) return "timeout";
  if (status >= 500) return "internal_error";
  return "provider_error";
}

