export const REPORT_ACCESS_NOT_USED =
  "No report was delivered, so this attempt did not use your free report or a paid report credit.";

export const REPORT_ACCESS_USED_BEFORE_DELIVERY =
  "The report passed its checks and used one report, but the connection ended before it reached this screen.";

export const REPORT_ACCESS_OUTCOME_UNKNOWN =
  "We could not confirm whether report access changed. Check your report count before retrying.";

export function withGenerationAccessOutcome(
  message: string,
  accessConsumed: boolean | null
) {
  const detail = accessConsumed === null
    ? REPORT_ACCESS_OUTCOME_UNKNOWN
    : accessConsumed
      ? REPORT_ACCESS_USED_BEFORE_DELIVERY
      : REPORT_ACCESS_NOT_USED;
  return `${message.trim()} ${detail}`;
}
