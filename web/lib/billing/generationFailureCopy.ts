// Every sentence that tells someone whether a failed or stopped report used one
// of their reports. Server routes and the workspace share these so a message is
// never stated twice or in two different ways.

export const REPORT_ACCESS_NOT_USED = "This didn't use one of your reports.";

export const REPORT_ACCESS_USED_BEFORE_DELIVERY =
  "Your report finished and counted as one of your reports, but the connection dropped before it showed up here.";

export const REPORT_ACCESS_USED = "This used one of your reports, because it had already started.";

export const REPORT_ACCESS_RESTORED = "We gave that report back. Try again whenever you're ready.";

export const REPORT_ACCESS_OUTCOME_UNKNOWN =
  "We couldn't tell whether this used one of your reports. Check My reports before running it again.";

export const REPORT_ACCESS_USED_COUNT_UPDATED = "This used one of your reports. Your count is up to date.";

export const REPORT_ACCESS_USED_CHECK = "This used one of your reports. Check My reports before running it again.";

// A visitor who isn't signed in only ever has the free report, and has no My reports
// page to check. Each outcome above has a version that says so; `forVisitor` swaps them in.
const GUEST_OUTCOMES: Array<[string, string]> = [
  [REPORT_ACCESS_NOT_USED, "This didn't use your free report."],
  [REPORT_ACCESS_USED_BEFORE_DELIVERY, "Your report finished and used your free report, but the connection dropped before it showed up here."],
  [REPORT_ACCESS_USED, "This used your free report, because it had already started."],
  [REPORT_ACCESS_RESTORED, "We gave your free report back. Try again whenever you're ready."],
  [REPORT_ACCESS_OUTCOME_UNKNOWN, "We couldn't tell whether this used your free report. The line under the report button shows what's left."],
  [REPORT_ACCESS_USED_COUNT_UPDATED, "This used your free report."],
  [REPORT_ACCESS_USED_CHECK, "This used your free report."],
];

const ACCESS_OUTCOMES = [
  REPORT_ACCESS_NOT_USED,
  REPORT_ACCESS_USED_BEFORE_DELIVERY,
  REPORT_ACCESS_USED,
  REPORT_ACCESS_RESTORED,
  REPORT_ACCESS_OUTCOME_UNKNOWN,
  ...GUEST_OUTCOMES.map(([, guest]) => guest),
];

// Older server builds may still send these until every deployment has rolled over.
const LEGACY_ACCESS_OUTCOMES = [
  "Your report credit was restored; please try again",
  "This report attempt was used because generation had already started",
  "We could not confirm that your report credit was restored. Check your remaining reports before retrying",
  "We could not confirm this attempt's status. Check History and your remaining reports before retrying",
  "This attempt did not use your free report or a paid report credit",
  "Your report was completed and counted toward your report allowance, but the connection ended before it appeared here",
  "We could not confirm whether this attempt used a report. Check how many reports you have left before trying again",
];

const escapeForPattern = (phrase: string) => phrase.replace(/[.!?]+$/u, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const OUTCOME_PATTERN = [...ACCESS_OUTCOMES, ...LEGACY_ACCESS_OUTCOMES].map(escapeForPattern).join("|");

/** True when a message already says whether the attempt used a report. */
export function hasAccessOutcome(message: string) {
  return new RegExp(OUTCOME_PATTERN, "iu").test(message);
}

/** Removes a trailing access outcome so a fresher one can replace it. */
export function stripAccessOutcome(message: string) {
  return message.trim().replace(new RegExp(`\\s*(?:${OUTCOME_PATTERN})[.!?]*$`, "iu"), "");
}

/** Says whether the attempt used a report, unless the message already does. */
export function withGenerationAccessOutcome(
  message: string,
  accessConsumed: boolean | null
) {
  if (hasAccessOutcome(message)) return message.trim();
  const detail = accessConsumed === null
    ? REPORT_ACCESS_OUTCOME_UNKNOWN
    : accessConsumed
      ? REPORT_ACCESS_USED_BEFORE_DELIVERY
      : REPORT_ACCESS_NOT_USED;
  return `${message.trim()} ${detail}`;
}

/** Rewrites report-access sentences for someone who isn't signed in. */
export function forVisitor(message: string, signedIn: boolean) {
  if (signedIn) return message;
  return GUEST_OUTCOMES.reduce((text, [account, guest]) => text.replace(account, guest), message);
}
