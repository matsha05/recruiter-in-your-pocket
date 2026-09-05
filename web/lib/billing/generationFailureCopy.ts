export const REPORT_ACCESS_NOT_USED =
  "This attempt did not use your free report or a paid report credit.";

export const REPORT_ACCESS_USED_BEFORE_DELIVERY =
  "Your report was completed and counted toward your report allowance, but the connection ended before it appeared here.";

export const REPORT_ACCESS_OUTCOME_UNKNOWN =
  "We could not confirm whether this attempt used a report. Check how many reports you have left before trying again.";

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
