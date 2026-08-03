import { createAppError, type AppError } from "../backend/errors";

type GenerationCancellationError = AppError & { attemptConsumed?: boolean };
type GenerationDispositionError = AppError & {
  attemptDisposition?: "unknown";
  preventAccessRelease?: boolean;
};
type GenerationRollbackOutcome = { confirmed: true };

export function generationCancellationError(attemptConsumed = false): GenerationCancellationError {
  const error = createAppError(
    "CLIENT_CANCELED",
    "Analysis stopped before the report was complete.",
    499,
  ) as GenerationCancellationError;
  error.attemptConsumed = attemptConsumed;
  return error;
}

export function throwIfGenerationCanceled(signal?: AbortSignal, attemptConsumed = false) {
  if (signal?.aborted) throw generationCancellationError(attemptConsumed);
}

export function generationCancellationWasCommitted(error: unknown) {
  const candidate = error as GenerationCancellationError | null;
  return candidate?.code === "CLIENT_CANCELED" && candidate.attemptConsumed === true;
}

export function generationDispositionIsUnknown(error: unknown) {
  const candidate = error as GenerationDispositionError | null;
  return candidate?.attemptDisposition === "unknown" || candidate?.preventAccessRelease === true;
}

export function shouldSynthesizeGenerationCancellation(error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code !== "string" || code.length === 0;
}

function cleanupUnconfirmedError(originalError: unknown, rollbackError?: unknown) {
  const error = createAppError(
    "REPORT_CLEANUP_UNCONFIRMED",
    "We could not safely finish this report.",
    503,
  ) as GenerationDispositionError & { cause?: unknown; rollbackError?: unknown };
  error.attemptDisposition = "unknown";
  error.preventAccessRelease = true;
  error.cause = originalError;
  error.rollbackError = rollbackError;
  return error;
}

function reportIdFromError(error: unknown) {
  const reportId = (error as { reportId?: unknown } | null)?.reportId;
  return typeof reportId === "string" && reportId.length > 0 ? reportId : null;
}

export async function finalizeGenerationCompletion(input: {
  signal?: AbortSignal;
  persist?: () => Promise<string | null>;
  commit: () => Promise<void>;
  rollback?: (reportId: string) => Promise<GenerationRollbackOutcome>;
}) {
  throwIfGenerationCanceled(input.signal);
  let reportId: string | null = null;
  let committed = false;

  try {
    reportId = input.persist ? await input.persist() : null;
    throwIfGenerationCanceled(input.signal);
    await input.commit();
    committed = true;
    throwIfGenerationCanceled(input.signal, true);
    return { reportId, attemptConsumed: true as const };
  } catch (error) {
    if (committed && (error as AppError)?.code === "CLIENT_CANCELED") {
      (error as GenerationCancellationError).attemptConsumed = true;
    }
    const reportIdToClean = reportId || reportIdFromError(error);
    if (reportIdToClean && !committed) {
      if (!input.rollback) throw cleanupUnconfirmedError(error);
      try {
        const rollback = await input.rollback(reportIdToClean);
        if (rollback?.confirmed !== true) throw new Error("Report rollback was not confirmed");
      } catch (rollbackError) {
        throw cleanupUnconfirmedError(error, rollbackError);
      }
    }
    throw error;
  }
}
