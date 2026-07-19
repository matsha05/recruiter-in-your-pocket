type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type RepairableError = Error & {
  code?: string;
  internal?: unknown;
};

const REPAIRABLE_RESPONSE_CODES = new Set([
  "OPENAI_RESPONSE_PARSE_ERROR",
  "OPENAI_RESPONSE_SHAPE_INVALID",
]);

export function isRepairableResumeResponseError(error: unknown) {
  const candidate = error as RepairableError | null;
  return Boolean(candidate?.code && REPAIRABLE_RESPONSE_CODES.has(candidate.code));
}

function repairIssueSummary(error: unknown) {
  const candidate = error as RepairableError | null;
  const internal = candidate?.internal;

  if (internal && typeof internal === "object") {
    const grounding = (internal as { grounding?: unknown }).grounding;
    if (grounding && typeof grounding === "object") {
      const missingEvidence = Array.isArray((grounding as any).missingEvidence)
        ? (grounding as any).missingEvidence.filter((value: unknown) => typeof value === "string")
        : [];
      const inventedSpecifics = Array.isArray((grounding as any).inventedSpecifics)
        ? (grounding as any).inventedSpecifics.filter((value: unknown) => typeof value === "string")
        : [];
      const issues = [...missingEvidence, ...inventedSpecifics];
      if (issues.length > 0) return issues.slice(0, 12).join("; ");
    }
  }

  return candidate?.message || "The draft did not satisfy the response contract.";
}

export function buildResumeRepairMessages(
  originalMessages: ChatMessage[],
  invalidDraft: string,
  error: unknown,
): ChatMessage[] {
  return [
    ...originalMessages,
    { role: "assistant", content: invalidDraft },
    {
      role: "user",
      content: `The draft above failed a deterministic evidence audit and must not be shown to the user.

Return one complete replacement JSON object. Do not explain the correction. Re-read the original resume in this conversation and audit every field, not only the listed issue.

Correction rules:
1. Copy every top_fixes[].evidence.excerpt and every rewrites[].original character-for-character from the resume, including capitalization and punctuation. Never prepend "I" or alter tense.
2. The quoted text in biggest_gap_example must also be a character-for-character resume excerpt.
3. Do not ask for a metric, tool, scope detail, or outcome that already appears anywhere in the resume. Choose a genuinely weak bullet when the cited bullet is already complete.
4. Preserve ownership exactly. Supported, assisted, helped, contributed, and participated must not become leadership verbs.
5. Do not write causal phrases such as "resulting in [outcome]", "improving [X%]", or "enhancing [result]" when the source does not state that outcome. Use a neutral placeholder such as "; outcome: [measurable result]" instead.
6. Do not copy claims from the failed draft unless the original resume independently supports them.

Audit findings: ${repairIssueSummary(error)}`,
    },
  ];
}
