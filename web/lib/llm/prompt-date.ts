/** The model has no clock; the report's recency judgments need today's date. */
export function todayForPrompt(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function promptDateLine(today: string) {
  return `Today's date: ${today}. Use it only to judge how recent each date on the resume is.`;
}
