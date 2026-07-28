import "server-only";

import * as Sentry from "@sentry/nextjs";

type OperationalSeverity = "warning" | "error" | "fatal";

/**
 * Report handled failures that Next cannot observe automatically. Callers pass
 * only bounded operational tags; customer content, email, and vendor payloads
 * must never be included.
 */
export function captureOperationalError(
  error: unknown,
  input: {
    operation: string;
    severity?: OperationalSeverity;
    tags?: Record<string, string | number | boolean>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setLevel(input.severity ?? "error");
    scope.setTag("riyp.operation", input.operation);
    for (const [key, value] of Object.entries(input.tags || {})) {
      scope.setTag(key, value);
    }
    Sentry.captureException(error instanceof Error ? error : new Error("Operational failure"));
  });
}
