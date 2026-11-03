/**
 * What the report says when a revised line can't be copied yet (W3, Nov 2026). The guard names the
 * word it objects to, in the person's own words, and every message ends with the "if it's true"
 * clause: nothing here ever suggests adding something that isn't.
 *
 * Contract (Engine): `checkPolishedLine` and `revisedLinePolicy` return
 * `{ ok, reason: "new_fact" | "relationship" | "lost_answer" | "empty", tokens?, nearest? }`.
 * Until that ships, today's shapes (`copyable` plus `newFacts`, or a `PolishRejection` with a
 * `detail`) are read the same way, so the copy is never worse than the contract.
 */

export type GuardReason = "new_fact" | "relationship" | "lost_answer" | "empty";

export interface GuardVerdict {
  ok: boolean;
  reason?: GuardReason;
  /** The words that aren't in the line or the answers. */
  tokens?: string[];
  /** The closest words the person did write, one per token where there is one. */
  nearest?: string[];
}

type LegacyPolicy = { copyable: boolean; newFacts?: string[]; reason?: string; issues?: Array<{ code: string; detail: string }> };
type LegacyPolish = { ok: boolean; reason?: string; detail?: string };

function splitDetail(detail?: string) {
  return (detail || "").replace(/^unsupported (?:bracket )?facts:\s*/u, "").split(/\s*[,|]\s*/u).map((value) => value.trim()).filter(Boolean);
}

/** One shape for the guard's answer, whichever version of the guard produced it. */
export function readGuardVerdict(result: GuardVerdict | LegacyPolicy | LegacyPolish | undefined | null): GuardVerdict {
  if (!result) return { ok: false, reason: "empty" };
  if ("copyable" in result) {
    if (result.copyable) return { ok: true };
    if (result.reason === "source_unavailable" || result.reason === "unresolved_placeholders") return { ok: false, reason: "empty" };
    const tokens = result.newFacts?.length ? result.newFacts : result.issues?.filter((issue) => issue.code === "unsupported_fact").flatMap((issue) => splitDetail(issue.detail)) || [];
    return tokens.length ? { ok: false, reason: "new_fact", tokens } : { ok: false, reason: "relationship" };
  }
  if ("ok" in result && typeof result.reason === "string" && !["new_fact", "relationship", "lost_answer", "empty"].includes(result.reason)) {
    const legacy = result as LegacyPolish;
    if (legacy.ok) return { ok: true };
    if (legacy.reason === "new_word" || legacy.reason === "new_name" || legacy.reason === "new_number") return { ok: false, reason: "new_fact", tokens: splitDetail(legacy.detail) };
    if (legacy.reason === "dropped_answer") return { ok: false, reason: "lost_answer", tokens: splitDetail(legacy.detail) };
    if (legacy.reason === "empty") return { ok: false, reason: "empty" };
    return { ok: false, reason: "relationship" };
  }
  const verdict = result as GuardVerdict;
  return verdict.ok ? { ok: true } : { ok: false, reason: verdict.reason || "relationship", tokens: verdict.tokens, nearest: verdict.nearest };
}

const quote = (value: string) => `“${value}”`;

/**
 * The sentence under the revised line while Copy waits. Null when there is nothing to say (the line
 * is copyable, or there is no line yet).
 */
export function guardMessage(verdict: GuardVerdict): string | null {
  if (verdict.ok || verdict.reason === "empty") return null;
  if (verdict.reason === "lost_answer") {
    const lost = verdict.tokens?.length ? `Your answer ${quote(verdict.tokens[0])} isn't in the line anymore.` : "One of your answers isn't in the line anymore.";
    return `${lost} Put it back if it's true, or skip that question.`;
  }
  if (verdict.reason === "new_fact") {
    const tokens = verdict.tokens?.filter(Boolean) || [];
    if (tokens.length === 0) return "This adds a detail that isn't in your line or your answers. Use the words you wrote, or add it as an answer if it's true.";
    const first = tokens[0];
    const nearest = verdict.nearest?.[0];
    const rest = tokens.length > 1 ? ` (and ${tokens.length - 1} more)` : "";
    const named = nearest
      ? `${quote(first)} isn't in your line or your answers, but ${quote(nearest)} is.`
      : `${quote(first)}${rest} isn't in your line or your answers.`;
    return `${named} Use the words you wrote, or add it as an answer if it's true.`;
  }
  return "We can't tell which number goes with which claim in this line. Use your exact words, or put each number next to what it describes, if that's what's true.";
}

/** Whether the message should offer "Use my exact words" as the way out. */
export function guardOffersExactWords(verdict: GuardVerdict) {
  return !verdict.ok && verdict.reason === "relationship";
}
