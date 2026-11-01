/**
 * Jordan A. Miller is fictional. The lines below are from Jordan's resume
 * (tests/fixtures/sample/jordan-miller-resume.txt) and the sample report generated from it.
 * The re-check and the score changes are illustrative: a real re-check needs a revised resume.
 * Every surface that shows them labels them "Fictional example".
 */

export const JORDAN_RECHECK = {
    before: "Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills.",
    after: "Introduced monthly renewal-risk reviews across the portfolio",
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
        { label: "Needs more detail", text: "How renewal risks were identified and followed up" },
        { label: "Not shown in the resume", text: "Expansion or upsell revenue", missing: true },
    ],
} as const;

/**
 * The homepage's worked example and the hero's reviewer note. The verdict, the line and the question
 * are quoted word for word from Jordan's generated sample report (public/sample-report.json, prompt
 * resume_v2 after plan 1.3). The note is the fictional hiring team's, written to ask what the report asks.
 */
export const JORDAN_EXAMPLE = {
    verdict: {
        lead: "Your current title points to customer success, but",
        miss: "the objective could apply to almost any role.",
    },
    line: "Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills.",
    note: "Solid book of business, but the objective could apply to almost any role. Is Jordan after another customer success role?",
    question: "Are you pursuing another customer success role?",
    answers: [
        { label: "The role Jordan wants", placeholder: "Jordan\u2019s answer" },
    ],
} as const;
