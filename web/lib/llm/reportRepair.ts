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
    const schemaIssues = (internal as { schemaIssues?: unknown }).schemaIssues;
    if (Array.isArray(schemaIssues)) {
      const issues = schemaIssues.filter(issue => issue && typeof issue.path === "string" && typeof issue.message === "string");
      if (issues.length > 0) return issues.slice(0, 12).map(issue => `${issue.path}: ${issue.message}`).join("; ");
    }
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
1. Copy every top_fixes[].evidence.excerpt and every rewrites[].original character-for-character from the resume, including capitalization and punctuation. Use the full source line for rewrites[].original. Never prepend "I", add quotes, truncate the line, or alter tense.
2. The quoted text in biggest_gap_example must also be a character-for-character resume excerpt.
3. Do not ask for a metric, tool, scope detail, or outcome that already appears anywhere in the resume. Choose a genuinely weak bullet when the cited bullet is already complete.
4. Preserve ownership exactly. Supported, assisted, helped, contributed, and participated must not become leadership verbs.
5. Do not write causal phrases such as "resulting in [measurable result]" or "enhancing [verified outcome]" when the source does not state that outcome.
6. Do not copy claims from the failed draft unless the original resume independently supports them.
7. Return "rewrites": [] in the repair response. A rejected rewrite must never be rescued by paraphrasing or by inventing a placeholder draft.
8. Every bracket in every other field must be exactly one of: [specific scope], [team size], [customer count], [cycle time], [tool name], [ownership detail], [measurable result], [verified outcome], [completed artifact], or [target role]. Never create a custom bracket label.
9. Each top fix must name a concrete edit action and the genuinely missing fact in ordinary language. Use an approved bracket placeholder only when it helps explain what to add. Its evidence must be about the same topic as the fix.
10. If recommending a genuinely absent section, use only the matching marker: "No summary section present", "No skills section present", or "No education section present". Never cite an unrelated bullet.
11. Re-score from the evidence on the page. Senior titles, tenure, and progression alone do not justify 70+. A resume made mostly of generic duties with no quantified outcomes belongs from 55 to 68.
12. Return one to three distinct top fixes, three strengths, three gaps, three next steps, and zero rewrites. Never pad top fixes or cite the same source bullet twice. Keep the JSON concise.
13. Recheck every field rule from the original system prompt, including sentence counts, word limits, a natural resume-specific summary opening, five ideas questions, and enhancement_note beginning with "Add".
14. Never expose SOURCE_### catalog tags in any field. Use human section names such as "Work Experience" instead.
15. Keep useful questions about missing facts in top_fixes and ideas.questions. Do not invent a result, count, or timeframe, and do not append labeled "Mechanism:", "Scope:", or "Outcome:" clauses.
16. Remove evaluator jargon and canned phrasing. Never write "cited bullet", "cited line", "role-level signal", "personal mechanism", "material gap", or "harder to place". Do not repeat a complete sentence across fields or restate one diagnosis without adding a useful detail or action.
17. Every best_fit_roles and stretch_roles value must be one complete role title copied character-for-character from either the resume or the job description. Never synthesize or combine a new title.
18. Never calculate, count, or derive a quantity the resume does not state explicitly. Describe the pattern without adding a total.
19. If the audit names an unsupported employer, school, credential, tool, or number, delete that exact claim everywhere. Do not repeat it, paraphrase it, or infer a replacement. A degree without a named school must remain a degree without a named school.
20. Preserve every source qualifier exactly. "Up to 50" cannot become "50," "over $12M" cannot become "$12M," and approximate values must remain approximate.
21. Do not require a number for every recommendation. A decision, deliverable, resolved problem, or clearly described responsibility can be useful detail. Ask for a measurement only when it helps explain the particular work.
22. A missing detail is not proof that you lack the experience. Describe what the resume leaves unclear without predicting interview or hiring decisions.
23. Keep score_comment_short to one complete sentence of 10 to 14 words, never more than 16. Count the words and rewrite the sentence if it is too long.
24. Return one to five relevant best_fit_roles and zero to three relevant stretch_roles, using exact source titles. Use an empty stretch_roles array when no relevant next step is supported. Do not fill it with unrelated past work or a title already in best_fit_roles.
25. Questions must not assume decision authority when the source only describes presenting, supporting, or influencing. Ask about the contribution actually stated. If text looks garbled, ask the user to compare it with their original file before calling it a spelling mistake.
26. Section names describe content, not just literal headings. Review an Objective, Career Objective, Profile, or Professional Profile under section_review.Summary. Review skill statements under Additional Information or Strengths and Technologies under section_review.Skills. Do not mark those existing sections N/A.
27. A question category such as TENSION POINT does not establish that a conflict occurred. If the resume does not describe one, first ask whether inputs ever differed; do not write a question or explanation that assumes they did.
28. Deciding, planning, recommending, or agreeing to do something does not establish that it happened. Ask what supported the decision; do not describe the work as launched, expanded, or implemented unless the source says it was completed.


Audit findings: ${repairIssueSummary(error)}`,
    },
  ];
}
