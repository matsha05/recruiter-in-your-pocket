/**
 * Jordan A. Miller is fictional. The lines below are from Jordan's resume
 * (tests/fixtures/sample/jordan-miller-resume.txt) and the sample report generated from it.
 * The re-check and the score changes are illustrative: a real re-check needs a revised resume.
 * Every surface that shows them labels them "Fictional example".
 */

export const JORDAN_RECHECK = {
    before: "Introduced monthly renewal-risk reviews across the portfolio",
    after: "Ran quarterly business reviews with customer leadership teams",
    change: 6,
    /** Score for each version, used only for bar length; the page prints changes, never the score (D5). */
    versions: [
        { label: "First report", score: 80 },
        { label: "Revision 1", score: 86 },
        { label: "Revision 2", score: 91 },
    ],
} as const;

export const JORDAN_ROLE_FIT = {
    posting: "Senior Customer Success Manager, Fabrikam",
    groups: [
        { label: "Relevant experience", text: "32 B2B SaaS accounts with $2.4M in annual recurring revenue" },
        { label: "Needs more detail", text: "How renewal risks were assessed and addressed" },
        { label: "Not shown in the resume", text: "Expansion or upsell revenue", missing: true },
    ],
} as const;

/**
 * The homepage's worked example and the hero's reviewer note. The read, the line and the questions are
 * quoted word for word from Jordan's generated sample report (public/sample-report.json, production
 * prompt resume_v2 83b2a2d1): the read is the sentence the report prints under its Verdict, and the
 * questions are the Critical Miss's "What to add". The note is the fictional hiring team's, written to
 * ask what the report asks. Regenerate the sample and update these together when the prompt changes.
 */
export const JORDAN_EXAMPLE = {
    verdict: {
        lead: "Your account portfolio and review cadence are specific, but",
        miss: "results remain unclear.",
    },
    line: "Introduced monthly renewal-risk reviews across the portfolio",
    note: "Solid book of business, but the renewal-risk reviews stop right before the good part. What did Jordan look for, and what changed?",
    asks: [
        { question: "What factors did you review when identifying renewal risk across the portfolio?" },
        { question: "What changed in your renewal workflow after you introduced the monthly risk reviews?" },
    ],
} as const;
