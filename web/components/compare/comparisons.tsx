import type { ReactNode } from "react";
import Link from "next/link";
import type { ResearchSource } from "@/components/research/AnswerArticle";

// One entry per tool we compare ourselves with. Every price and feature in the "them" column
// comes from that tool's own pricing page, read on `pricesChecked`; the source list links it.
// We haven't run the other tools on the same resume, so each page compares what the tool sells,
// not the quality of its output, and says so in "How we compare". Our own column follows
// lib/billing/pricing.ts and the Help page: keep them in step when the pass changes.

export const PRICES_CHECKED = "2026-11-03";

export type ComparisonRow = {
    label: string;
    them: ReactNode;
    us: ReactNode;
};

export type ComparisonSection = {
    id: string;
    title: string;
    paragraphs: ReactNode[];
};

export type Comparison = {
    slug: string;
    /** The other tool's name, as it writes it. */
    name: string;
    path: string;
    /** The H1 and the search title: "<Tool> vs Recruiter in Your Pocket". */
    title: string;
    /** One line for the "Other comparisons" list. */
    summary: string;
    /** The hub table's three cells. */
    hub: { does: string; costs: string; free: string };
    /** Two or three plain sentences: who each tool is for. */
    answer: ReactNode;
    rows: ComparisonRow[];
    sections: ComparisonSection[];
    sources: ResearchSource[];
};

const OUR_NAME = "Recruiter in Your Pocket";

const ourRows = {
    whatItIs: "A report on the resume you already have, read against a recruiter’s review criteria.",
    whoReads: "AI applies review criteria written by a recruiter with 14 years in hiring. Nobody reads individual reports.",
    whatYouGet: "A Verdict, the Critical Misses that could cost you the interview in the order to fix them, a note on each line that needs work, and rewrites built only from your facts.",
    price: "The first report is free. Then $29 once for five more reports, good for 90 days.",
    free: "One complete report. No card, no account, nothing held back.",
    renewal: "None. The pass expires after 90 days and never renews.",
} as const;

export const comparisons: Comparison[] = [
    {
        slug: "topresume",
        name: "TopResume",
        path: "/compare/topresume",
        title: "TopResume vs Recruiter in Your Pocket",
        summary: "A human writer rewrites your resume, from $179 a package.",
        hub: {
            does: "A human writer rewrites your resume. Larger packages add a cover letter, a LinkedIn makeover, and coaching.",
            costs: "$179 to $599 per package, paid once.",
            free: "A free resume review that leads into the packages.",
        },
        answer: (
            <>
                TopResume sells a rewrite: a human writer produces a new resume, in packages from $179. {OUR_NAME} reads the resume you already have the way a recruiter would, free for the first report, and leaves the writing to you.
                If you want someone else to do the writing, TopResume is the closer fit. If you want to know what a recruiter would question and fix it yourself, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "A resume-writing service. A writer rewrites your resume from your current document and an intake.",
                us: ourRows.whatItIs,
            },
            {
                label: "Who does the work",
                them: "A human writer. TopResume lists 170 writers across 65 industries.",
                us: ourRows.whoReads,
            },
            {
                label: "What you get back",
                them: "A new resume. The larger packages add a cover letter, a LinkedIn makeover, and interview coaching.",
                us: ourRows.whatYouGet,
            },
            {
                label: "Price",
                them: "$179 to $599 per package, paid once. Monthly financing is offered.",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "A free resume review, which leads into the paid packages.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "None. Each package is a one-time purchase.",
                us: ourRows.renewal,
            },
            {
                label: "Guarantee",
                them: "A 60-day interview guarantee. The pricing page doesn’t spell out its terms.",
                us: "A full refund within 14 days if you haven’t used any paid reports.",
            },
            {
                label: "How long it takes",
                them: "Not stated on the pricing page. 48-hour express delivery is a paid add-on.",
                us: "Minutes, while you wait.",
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is TopResume worth it?",
                paragraphs: [
                    <>
                        If the writing is the part you keep putting off, a writer who does it for you is worth more than any critique. The packages from $229 up also bundle a cover letter and a LinkedIn makeover, so if you need all three done at once, one purchase covers it.
                    </>,
                    <>
                        What the price can’t buy is the writer’s knowledge of your work. They describe jobs they didn’t see, from the intake you give them, so the result is only as specific as what you hand over. Read the draft you get back the way a recruiter would: every number, every claim of ownership, every result should be something you can back up in an interview.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You want to know what’s wrong before you pay anyone. The first report is complete, and it quotes the lines a recruiter would question, so you can see whether the problem is the writing or the missing facts.
                    </>,
                    <>
                        Your resume is close and you have the facts. The report asks for the details you left off, such as how many people, what changed, and whether you owned the decision, then rewrites the line from your answer. Nothing gets added that you didn’t say.
                    </>,
                    <>
                        What it won’t do: write the resume for you. You make the final edit, and there is no cover letter or LinkedIn service.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        TopResume’s resume-writing page listed four packages on {formatChecked()}: Professional Growth at $179 for the resume, Career Evolution at $229 with a cover letter, Career Confidence at $349 with a LinkedIn makeover and an interview coaching session from a writer it places in its top 20%, and Executive Priority at $599 with two coaching sessions from a top-10% writer. The page was also advertising a 25% promotion; the figures here are the list prices.
                    </>,
                    <>
                        {OUR_NAME}’s first report is free, with no card or account. The Job Search Pass is $29 once for five more reports, good for 90 days, and never renews. <Link href="/pricing" className="riyp-link">The full pricing page</Link> has the details.
                    </>,
                ],
            },
            {
                id: "both",
                title: "Using both",
                paragraphs: [
                    <>
                        Run the free report before you buy a rewrite, so you know what the writer has to fix and what facts to put in the intake. Run it again on the draft that comes back, and check that the Critical Miss it found the first time is gone.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Professional resume writing services (packages and prices)",
                publisher: "TopResume",
                year: "Read " + formatChecked(),
                href: "https://www.topresume.com/resume-writing",
            },
        ],
    },
    {
        slug: "jobscan",
        name: "Jobscan",
        path: "/compare/jobscan",
        title: "Jobscan vs Recruiter in Your Pocket",
        summary: "Scores your keyword match against one job posting, $29.98 to $49.95 a month.",
        hub: {
            does: "Scores how closely your resume’s keywords match one job posting and lists the missing terms.",
            costs: "$49.95 a month, or $89.95 every three months. Recurring.",
            free: "Five scans a month, with the tracker and builder.",
        },
        answer: (
            <>
                Jobscan compares your resume to one job posting and scores the keyword match, with five free scans a month and a subscription for more. {OUR_NAME} reads the whole resume the way a recruiter would and tells you what could cost you the interview, with the first report free and no subscription.
                If you tailor the wording for many applications a week, Jobscan is built for that. If you want to know whether the resume itself holds up, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "A keyword scanner. Paste a job posting and it reports how closely your resume matches and which terms are missing.",
                us: "A recruiter-style read of the whole resume, with the job posting as context when you add one.",
            },
            {
                label: "What it checks",
                them: "Keywords and skills against one posting, with what it calls ATS and recruiter findings.",
                us: "What your bullets say you did and what changed because of it, the lines a recruiter would question, and the facts you left off.",
            },
            {
                label: "What you get back",
                them: "A match rate, the missing keywords, and on paid plans AI rewrites, cover letters, and a LinkedIn optimizer.",
                us: ourRows.whatYouGet,
            },
            {
                label: "Price",
                them: "$49.95 a month, or $89.95 every three months (about $29.98 a month).",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "Five resume scans a month, plus the job tracker, resume builder, and Chrome extension.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "Recurring, monthly or quarterly, until you cancel. The quarterly plan starts with a 7-day trial; the monthly plan has none.",
                us: ourRows.renewal,
            },
            {
                label: "When you stop paying",
                them: "Paid features and the data tied to them go away when the subscription ends, per Jobscan’s plan page.",
                us: "Saved reports and their PDFs stay with your account. A new report needs a new pass or free access.",
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is Jobscan worth it?",
                paragraphs: [
                    <>
                        If you send many applications and each posting uses its own vocabulary, a scanner that lists the terms you’re missing saves real time, and the free plan’s five scans a month may be all you need. The subscription is the price of doing that without a limit.
                    </>,
                    <>
                        What a match rate can’t tell you is whether a recruiter believes the bullets. A resume can match most of the keywords and still read as a list of duties with no results. Jobscan’s score is also its own model of an applicant tracking system, and the documentation from the systems employers actually use describes parsing, not a universal rejection score. <Link href="/research/ats-myths" className="riyp-link">What applicant tracking systems do</Link> covers that.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You have one resume and you want to know what it says to the person reading it. The report quotes the line behind every note and starts with the one problem most likely to cost you the interview.
                    </>,
                    <>
                        You’d rather pay once. Five reports for $29 covers a revision and a few target roles, and when you add a job posting the report reads your resume against that role without turning it into a keyword count.
                    </>,
                    <>
                        What it won’t do: give you a match percentage, a list of missing keywords, or an application tracker.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        Jobscan’s plan page listed three plans on {formatChecked()}: Free at $0 with five resume scans a month, Quarterly at $89.95 every three months (shown as $29.98 a month) with a 7-day free trial, and Monthly at $49.95. Paid plans add unlimited scans, AI optimizations, a cover letter generator, a LinkedIn optimizer, and auto-apply credits. You can cancel any time and keep access to the end of the period you paid for.
                    </>,
                    <>
                        {OUR_NAME}’s first report is free, with no card or account. The Job Search Pass is $29 once for five more reports, good for 90 days, and never renews. <Link href="/pricing" className="riyp-link">The full pricing page</Link> has the details.
                    </>,
                ],
            },
            {
                id: "both",
                title: "Using both",
                paragraphs: [
                    <>
                        Fix the resume first, then tailor it. Run the free report on your base resume and clear the Critical Misses, then use Jobscan’s free scans for the vocabulary of a specific posting. Use a term only where it truthfully describes what you did; the report will flag a line that claims more than it shows.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Choose your plan (prices and plan features)",
                publisher: "Jobscan",
                year: "Read " + formatChecked(),
                href: "https://app.jobscan.co/plan",
            },
        ],
    },
    {
        slug: "resume-worded",
        name: "Resume Worded",
        path: "/compare/resume-worded",
        title: "Resume Worded vs Recruiter in Your Pocket",
        summary: "Scores your resume and LinkedIn against its checklist, $19 to $49 a month.",
        hub: {
            does: "Scores your resume and LinkedIn profile against its checklist, with sample lines and AI rewrites.",
            costs: "$49 a month, $99 a quarter, or $229 a year. Subscription.",
            free: "A score and a limited report.",
        },
        answer: (
            <>
                Resume Worded scores your resume and LinkedIn profile against its own checklist and sells the full line-by-line report as a subscription, from $19 to $49 a month depending on the term. {OUR_NAME} gives you the complete report on one resume free, then $29 once for five more.
                If you want an ongoing score on your resume and LinkedIn in one place, Resume Worded Pro is the closer fit. If you want a recruiter’s read of one resume without a subscription, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "A resume and LinkedIn scorer with a checklist of fixes, templates, and sample lines.",
                us: ourRows.whatItIs,
            },
            {
                label: "What you get back",
                them: "A score with a line-by-line analysis, a LinkedIn keyword analysis, sample lines from other candidates, and AI rewrites.",
                us: "A Verdict, the Critical Misses in the order to fix them, a note on each line that needs work, and rewrites built only from facts you supplied. No sample lines from anyone else’s resume.",
            },
            {
                label: "Who does the work",
                them: "Software, against Resume Worded’s checklist.",
                us: ourRows.whoReads,
            },
            {
                label: "Price",
                them: "$49 a month, $99 every three months, or $229 a year (shown as $19 a month).",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "A resume score and a limited report. The line-by-line analysis is part of Pro.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "A subscription on the term you pick. The page says you can cancel any time.",
                us: ourRows.renewal,
            },
            {
                label: "LinkedIn",
                them: "A full LinkedIn analysis is part of Pro.",
                us: "Not included.",
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is Resume Worded worth it?",
                paragraphs: [
                    <>
                        If you want a score you can check on several documents over a few months, and a LinkedIn checkup in the same account, the annual plan at $229 is the cheapest way to get that from Resume Worded. The monthly plan at $49 makes sense only for a short, intense search.
                    </>,
                    <>
                        The score comes from Resume Worded’s own checklist. Its page describes a line-by-line analysis, keyword analysis, and ATS checking, which are useful and are not the same as a recruiter deciding whether the work is real. The sample lines from “top candidates” are other people’s facts; anything you borrow has to be rebuilt around your own.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You want the whole report once, without a subscription. The free report holds nothing back, and $29 buys five more for the revisions and target roles that follow.
                    </>,
                    <>
                        You want the feedback tied to your own lines. Every note quotes the line it’s about, and when a line needs more, the report asks you for the fact instead of offering someone else’s sentence.
                    </>,
                    <>
                        What it won’t do: review your LinkedIn profile, supply templates, or keep a running score over time. Saved reports, when you sign in, are the history.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        Resume Worded’s Pro page listed three terms on {formatChecked()}: $49 a month, $99 every three months (shown as $33 a month), and one payment of $229 for a year (shown as $19 a month), each marked “cancel anytime.” Pro includes the full Score My Resume report with the line-by-line analysis, the full LinkedIn analysis, sample resume lines, AI rewrites, unlimited uploads, and resume templates.
                    </>,
                    <>
                        {OUR_NAME}’s first report is free, with no card or account. The Job Search Pass is $29 once for five more reports, good for 90 days, and never renews. <Link href="/pricing" className="riyp-link">The full pricing page</Link> has the details.
                    </>,
                ],
            },
            {
                id: "both",
                title: "Using both",
                paragraphs: [
                    <>
                        Resume Worded’s free score is a quick check on structure. Use the {OUR_NAME} report for the question the score can’t answer: which line a recruiter would doubt, and what fact would settle it.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Upgrade to Resume Worded Pro (plans and prices)",
                publisher: "Resume Worded",
                year: "Read " + formatChecked(),
                href: "https://resumeworded.com/get-pro",
            },
        ],
    },
    {
        slug: "teal",
        name: "Teal",
        path: "/compare/teal",
        title: "Teal vs Recruiter in Your Pocket",
        summary: "A resume builder and job tracker, free, with Teal+ at $13 a week to $79 a quarter.",
        hub: {
            does: "Builds resumes from templates, tracks applications, and matches keywords against a posting.",
            costs: "Teal+ at $13 a week, $29 a month, or $79 a quarter. Recurring.",
            free: "Unlimited resumes and tracking, with limits on templates, keywords, and AI.",
        },
        answer: (
            <>
                Teal is a resume builder and application tracker with a free plan and a Teal+ subscription at $13 a week, $29 a month, or $79 a quarter. {OUR_NAME} doesn’t build or track. It reads the resume you have and tells you what a recruiter would question, free for the first report.
                If you’re running many applications and want to build each resume in one place, Teal is built for that. If you want a second opinion on the resume itself, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "A resume builder with templates, an application tracker, and AI writing help.",
                us: "A report on a finished resume.",
            },
            {
                label: "What it checks",
                them: "Keyword matching against a posting (the top five on the free plan, all of them on Teal+), a match score, and a built-in analysis of structure and content.",
                us: "What your bullets say you did and what changed, the questions a recruiter would have, and the lines to fix first.",
            },
            {
                label: "What you get back",
                them: "A resume you build in Teal, exported as a PDF or Word file, plus AI bullets, summaries, and cover letters.",
                us: "A Verdict, the Critical Misses in the order to fix them, a note on each line, and rewrites from your facts. Download it as a PDF when you sign in.",
            },
            {
                label: "Price",
                them: "$13 every 7 days, $29 every 30 days, or $79 every 90 days.",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "Unlimited resumes and job tracking, 10 templates, top-five keyword matching, and a small number of AI credits.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "Recurring on the cycle you pick until you cancel. Refunds depend on a window set by the plan.",
                us: ourRows.renewal,
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is Teal worth it?",
                paragraphs: [
                    <>
                        For volume, yes. If you’re tracking dozens of applications and building a version of your resume for each, the free plan already does most of it, and Teal+ removes the template and AI limits. The 30-day plan is $29; the weekly plan at $13 costs more than that once you keep it past two weeks, so pick the term before you start.
                    </>,
                    <>
                        What a builder can’t do is tell you whether the bullets hold up. Teal’s analysis and match score check structure and keywords against its own rules. Whether a recruiter would believe a line, or stop on it, is a different question.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You’ve already written the resume. The report doesn’t ask you to rebuild it in a new tool; it reads the one you have, quotes the lines that need work, and tells you which to fix first.
                    </>,
                    <>
                        You don’t want another subscription. One free report, then $29 once for five more, is the whole price.
                    </>,
                    <>
                        What it won’t do: build the resume, store templates, or track applications.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        Teal’s pricing page listed Teal+ at $13 every 7 days, $29 every 30 days, and $79 every 90 days on {formatChecked()}, with no card required to start on the free plan and the option to change or cancel at any time. The free plan includes unlimited resumes and job tracking, 10 templates, top-five keyword matching, basic analysis, and a few AI credits. Teal+ adds unlimited templates, keywords, analysis, and AI generation, plus the full match score and advanced design settings.
                    </>,
                    <>
                        {OUR_NAME}’s first report is free, with no card or account. The Job Search Pass is $29 once for five more reports, good for 90 days, and never renews. <Link href="/pricing" className="riyp-link">The full pricing page</Link> has the details.
                    </>,
                ],
            },
            {
                id: "both",
                title: "Using both",
                paragraphs: [
                    <>
                        Build and track in Teal, then export the resume you plan to send and run it through the free report before it goes out. If the report finds a Critical Miss, fix it in Teal and export again.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Teal+ pricing (plans and what each includes)",
                publisher: "Teal",
                year: "Read " + formatChecked(),
                href: "https://www.tealhq.com/pricing",
            },
        ],
    },
];

export function comparison(slug: string): Comparison {
    const entry = comparisons.find((candidate) => candidate.slug === slug);
    if (!entry) throw new Error(`No comparison for "${slug}" (components/compare/comparisons.tsx).`);
    return entry;
}

/** "November 3, 2026", the day we read the other tool's pricing page. */
export function formatChecked(date: string = PRICES_CHECKED) {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
        new Date(`${date}T00:00:00Z`),
    );
}
