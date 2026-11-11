/**
 * The posting read's terms, shared by the server and the input screen (no server-only imports here).
 *
 * A cost guard, not a product promise: each read is one model call, and its cost on the live model hasn't been
 * measured yet. Ten a day is more than a person applies to in a day and little enough that one account can't run
 * the model all night. Revisit once the cost per read is known.
 */
export const POSTING_READS_PER_DAY = 10;

/** Under the run button when the read is included: what it costs the person, said once. */
export const POSTING_READ_INCLUDED_HINT = "Included with your pass. This one doesn't use a report.";
