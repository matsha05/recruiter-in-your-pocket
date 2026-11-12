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
 * The homepage's worked example and the hero's reviewer note. The verdict, the line, the note and the question
 * are quoted word for word from Jordan's generated sample report (public/sample-report.json, the worklist
 * prompt resume_v3 5619c27b): the verdict is the report's opinion in two or three sentences, the line is a card's quoted
 * line, the note is that card's "what a recruiter can't tell", and the question is the card's question.
 * Regenerate the sample and update these together when the prompt changes.
 */
export const JORDAN_EXAMPLE = {
    verdict: "Your customer success work at Northwind Analytics is easy to place, and the account portfolio gives it weight. I’d move it forward with a question: what changed after you introduced the renewal-risk reviews?",
    line: "Introduced monthly renewal-risk reviews across the portfolio",
    note: "Introducing the reviews is useful work. What happened with the risks you identified is still open, and that matters for a renewal-focused role.",
    asks: [
        { question: "What did you do with the findings from the reviews?" },
    ],
} as const;
