/**
 * The posting read's terms, shared by the server and the input screen (no server-only imports here).
 *
 * A cost guard, not a product promise: each read is one model call, and its cost on the live model hasn't been
 * measured yet. Ten a day is more than a person applies to in a day and little enough that one account can't run
 * the model all night. Revisit once the cost per read is known.
 */
export const POSTING_READS_PER_DAY = 10;

/** The pass's posting reads, as the pricing card and the paywall list them. The day's limit is said where the offer is. */
export const POSTING_READS_FEATURE = `Read a resume you've already run against any job posting, up to ${POSTING_READS_PER_DAY} a day, without using a report`;

/** The same promise as a sentence, for the pricing page's pass card. */
export const POSTING_READS_SENTENCE = `Once a resume has its report, reading it against a job posting doesn't use another (up to ${POSTING_READS_PER_DAY} a day).`;

/** What happens to posting reads when the five reports are gone: they run to the end of the pass. */
export const POSTING_READS_AFTER_FIVE = "Reading a resume you've already run against a posting keeps working until the pass ends.";

/** Arriving from a saved report: saved reports don't keep the resume, so the person adds it again. */
export const POSTING_READ_ADD_RESUME = "Add the resume that report was written on, then paste the posting.";

/** Under the run button when the read is included: what it costs the person, said once. */
export const POSTING_READ_INCLUDED_HINT = "Included with your pass. This one doesn't use a report.";
