import { generationCancellationError, throwIfGenerationCanceled } from "../billing/generation-cancellation";
import { createAppError } from "./errors";

export function createOpenAIAbortScope(externalSignal: AbortSignal | undefined, timeoutMs: number) {
  throwIfGenerationCanceled(externalSignal);
  const controller = new AbortController();
  let abortOwner: "client" | "timeout" | null = null;
  const abortFromClient = () => {
    if (abortOwner) return;
    abortOwner = "client";
    controller.abort(externalSignal?.reason);
  };
  externalSignal?.addEventListener("abort", abortFromClient, { once: true });
  const timer = setTimeout(() => {
    if (abortOwner) return;
    abortOwner = "timeout";
    controller.abort();
  }, timeoutMs);
  return {
    signal: controller.signal,
    abortOwner: () => abortOwner,
    dispose() {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", abortFromClient);
    },
  };
}

export function normalizeOpenAITransportError(
  error: any,
  scope: ReturnType<typeof createOpenAIAbortScope>,
  externalSignal?: AbortSignal,
) {
  const code = typeof error?.code === "string" ? error.code : "";
  const isStableAppError = code === "CLIENT_CANCELED" || code.startsWith("OPENAI_");
  if (isStableAppError && typeof error?.httpStatus === "number") return error;
  if (scope.abortOwner() === "timeout") return createAppError("OPENAI_TIMEOUT", "OpenAI request timed out.", 504);
  if (externalSignal?.aborted) return generationCancellationError();
  return createAppError(
    "OPENAI_NETWORK_ERROR",
    "There was a network hiccup while getting your report.",
    502,
    error?.message,
  );
}
