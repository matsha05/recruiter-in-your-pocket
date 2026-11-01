import "server-only";

import { requestPolishedLine, type PolishedLineResult } from "../llm/revise-line-model";
import { checkPolishedLine, POLISH_ALLOWS_JOINERS, type PolishRejection } from "./revised-line-polish";
import { composeRevisedLine } from "./revised-line";

export type PolishOutcome =
  | { outcome: "polished"; line: string; reason: "polished"; model: string; usage?: PolishedLineResult["usage"] }
  | { outcome: "fallback"; line: null; reason: PolishRejection | "unchanged"; detail: string; proposed: string; model: string; usage?: PolishedLineResult["usage"] }
  | { outcome: "error"; line: null; reason: "timeout" | "provider"; detail: string };

/** Ask the model for a smoother line and keep it only if the guard passes. Never throws. */
export async function polishRevisedLine(input: {
  line: string;
  answers: readonly string[];
  signal?: AbortSignal;
  model?: string;
  allowJoiners?: boolean;
}): Promise<PolishOutcome> {
  const literal = composeRevisedLine(input.line, input.answers.map((value) => ({ kind: "answered" as const, value })));
  if (!literal) return { outcome: "error", line: null, reason: "provider", detail: "no answers" };
  let proposed: PolishedLineResult;
  try {
    proposed = await requestPolishedLine({ line: input.line, answers: input.answers, signal: input.signal, model: input.model });
  } catch (error) {
    const code = (error as { code?: string } | null)?.code || "";
    return { outcome: "error", line: null, reason: code === "OPENAI_TIMEOUT" ? "timeout" : "provider", detail: code || "unknown" };
  }
  const polished = proposed.line.trim();
  // The same words in the same order, give or take punctuation, is not a polish.
  const bare = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (bare(polished) === bare(literal)) {
    return { outcome: "fallback", line: null, reason: "unchanged", detail: "same as the literal line", proposed: polished, model: proposed.model, usage: proposed.usage };
  }
  const check = checkPolishedLine(
    { sourceLine: input.line, answers: input.answers, literal, polished },
    { allowJoiners: input.allowJoiners ?? POLISH_ALLOWS_JOINERS },
  );
  if (!check.ok) {
    return { outcome: "fallback", line: null, reason: check.reason, detail: check.detail, proposed: polished, model: proposed.model, usage: proposed.usage };
  }
  return { outcome: "polished", line: polished, reason: "polished", model: proposed.model, usage: proposed.usage };
}
