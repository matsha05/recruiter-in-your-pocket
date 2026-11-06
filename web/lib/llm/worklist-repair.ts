type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type RepairableError = Error & { code?: string; internal?: unknown };

function issueSummary(error: unknown) {
  const candidate = error as RepairableError | null;
  const internal = candidate?.internal as { schemaIssues?: unknown } | undefined;
  if (Array.isArray(internal?.schemaIssues)) {
    const issues = internal.schemaIssues.filter((issue: any) => issue && typeof issue.path === "string" && typeof issue.message === "string");
    if (issues.length > 0) return issues.slice(0, 12).map((issue: any) => `${issue.path}: ${issue.message}`).join("; ");
  }
  return candidate?.message || "The draft did not satisfy the worklist contract.";
}

/**
 * The one repair pass for a refused worklist draft. The model sees its own draft and the exact issues, and
 * returns one complete replacement. The rules below restate what the validator checks mechanically, so the
 * second draft is written to pass rather than to argue.
 */
export function buildWorklistRepairMessages(originalMessages: ChatMessage[], invalidDraft: string, error: unknown): ChatMessage[] {
  return [
    ...originalMessages,
    { role: "assistant", content: invalidDraft },
    {
      role: "user",
      content: `The draft above failed a mechanical check against the resume and must not be shown to the person.

Return one complete replacement JSON object in the same schema. Do not explain the correction. Re-read the resume in this conversation and check every card, not only the listed issues.

Correction rules:
1. Every "line" or "keep" card's line is copied character for character from one resume line in the SOURCE CATALOG (never the tag), in one piece. If the text you want isn't on the page as written, quote the line that is, or drop the card.
2. In every example, every number and every name that the resume does not state goes inside square brackets as a blank. Nothing outside a bracket may be new. Keep the line's own facts as written.
3. Keep the line's level of ownership. "Helped", "assisted", "supported", "contributed" and "participated" never become "led", "owned", "drove", "managed" or "ran".
4. One card per resume line. Merge two cards on the same line into one.
5. Never write "Critical Miss" or "the read". Speak to the person as "you"; never "the candidate".
6. Never write a computed duration or today's date. Copy dates as the resume writes them.
7. Keep the write-up in the recruiter's own voice, two or three short paragraphs, and keep the cards in the order a recruiter hits them.

Issues found: ${issueSummary(error)}`,
    },
  ];
}
