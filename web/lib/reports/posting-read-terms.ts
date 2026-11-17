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

/** The opt-in to keep the resume on file, shown once a posting read has its resume. */
export const RESUME_ON_FILE_OFFER = "Applying to more than one job? Keep this resume on file and next time you only paste the posting.";
export const RESUME_ON_FILE_KEEP = "Keep it on file";
/**
 * The same offer when a different resume is already on file. An account keeps one, so keeping this one replaces
 * that one; the plain offer said nothing of it, and a click saved one resume over another (Nov 17, 2026).
 */
export const RESUME_ON_FILE_REPLACE_OFFER = "You keep a different resume on file.";
export const RESUME_ON_FILE_REPLACE = "Replace it with this one";
/** After keeping it: where it lives and how it leaves, said once. */
export const RESUME_ON_FILE_KEPT = "On file. We store the text of this resume in your account until you remove it.";
/** A posting read that found the resume on file. */
export const RESUME_ON_FILE_LOADED = "We filled in the resume you keep on file. Paste the posting and you're set.";
export const RESUME_ON_FILE_REMOVE = "Remove it from file";
/** The card's name for a resume on file that was kept without a file name (pasted text, or kept before names were stored). */
export const RESUME_ON_FILE_NAME = "Your resume on file";
/** On that card, the way to read a different resume: it clears the field, and the copy on file stays. */
export const RESUME_ON_FILE_USE_ANOTHER = "Use a different resume";
export const RESUME_ON_FILE_REMOVED = "Removed. Your resume is no longer on file.";

/** Under the run button when the read is included: what it costs the person, said once. */
export const POSTING_READ_INCLUDED_HINT = "Included with your pass. This one doesn't use a report.";
/** The same line before the posting is in: the read is included once there is a posting to read against. */
export const POSTING_READ_NEEDS_POSTING_HINT = "Paste the posting and this read is included with your pass.";
