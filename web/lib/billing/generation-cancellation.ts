import { createAppError, type AppError } from "../backend/errors";

type GenerationCancellationError = AppError & { attemptConsumed?: boolean };

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

export async function finalizeGenerationCompletion(input: {
  signal?: AbortSignal;
  persist?: () => Promise<string | null>;
  commit: () => Promise<void>;
  rollback?: (reportId: string) => Promise<void>;
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
    if (reportId && !committed && input.rollback) await input.rollback(reportId);
    throw error;
  }
}
