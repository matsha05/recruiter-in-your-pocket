import type { ReactNode } from "react";
import Link from "next/link";
import type { ResearchSource } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";

// One entry per tool we compare ourselves with. Every price and feature in the "them" column
// comes from that tool's own pricing page, read on `pricesChecked`; the source list links it.
// On November 5, 2026 one resume and one posting went through five of the tools and ours
// (docs/competitive-intelligence/head-to-head.md); `sameResume` holds what each said, dated, for
// "How we compare". A tool without it has not been run, and its page says so. Our own column follows
// lib/billing/pricing.ts and the Help page: keep them in step when the pass changes.

export const PRICES_CHECKED = "2026-11-04";

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
    /** The search title, the breadcrumb and the name in lists: "<Tool> vs Recruiter in Your Pocket". */
    title: string;
    /** The H1: the reader's situation first (docs/copy-system.md §8, Matt, November 11, 2026). */
    hook: string;
    /** The line after the hook: a fact from this file, with its source or its date further down the page. */
    spike: string;
    /** One line for the "Other comparisons" list. */
    summary: string;
    /** The hub table's three cells. */
    hub: { does: string; costs: string; free: string };
    /** Two or three plain sentences: who each tool is for. */
    answer: ReactNode;
    rows: ComparisonRow[];
    sections: ComparisonSection[];
    sources: ResearchSource[];
    /** The same resume through this tool and ours, once: what each said, in plain words, for "How we compare". */
    sameResume?: { them: string; us: string };
};

const OUR_NAME = "Recruiter in Your Pocket";

/** The day one resume (a senior technical recruiter's, three pages) and one posting went through five tools and ours. */
export const SAME_RESUME_DATE = "2026-11-05";

/** What ours said to that resume, the same on every page that ran. */
const OURS_ON_THE_SAME_RESUME =
    "Ours led with the resume’s own numbers, put one line first with the line it came from, and questioned a “300% reduction in time to hire” as a figure that can’t be right. Thirty-six seconds without the posting, a minute and a half with it, and no line misread. One resume, one role, one day, on the report as it ran then; the report now cards every line a recruiter trips on, not one.";

const ourRows = {
    whatItIs: "A report on the resume you already have, read against a recruiter’s review criteria.",
    whoReads: "AI applies review criteria written by a recruiter with 15 years in hiring. Nobody reads individual reports.",
    whatYouGet: "A recruiter’s write-up, then every line that needs work in the order a recruiter hits it, with what they can’t tell from it and an example built only from your facts.",
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
        hook: "Don’t pay $179 to find out what’s wrong.",
        spike: "TopResume’s packages start at $179, and its free review leads into them. The first report here is complete and free, and it quotes the lines a recruiter would question.",
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
                        What the price can’t buy is the writer’s knowledge of your work. They describe jobs they didn’t see, from the intake you give them, so the result is only as specific as what you hand over. Read the draft you get back the way a recruiter would: every number, every claim of ownership, every result should be something you can back up, because <ResearchLink to="star-method">every line on a resume is a story you may be asked to tell</ResearchLink>.
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
                        What it won’t do: write the resume for you. You make the final edit, and there is no cover letter. The LinkedIn profile review tells you what to change; it doesn’t rewrite the profile for you.
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
                        Run the free report before you buy a rewrite, so you know what the writer has to fix and what facts to put in the intake. Run it again on the draft that comes back, and check that the lines it carded the first time are off the list.
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
        hook: "You matched the keywords and still heard nothing.",
        spike: "A match rate can’t tell you why. On the resume we ran through both, Jobscan returned a 35% match and 55 items, 18 of them about that resume.",
        summary: "Scores your keyword match against one job posting, $29.98 to $49.95 a month.",
        sameResume: {
            them: "Jobscan returned a 35% match rate in under a minute, with 55 items: 18 about this resume, the rest generic or keyword rules. It couldn’t find the education section because the heading reads “Education and Certifications”, and it congratulated a summary the resume doesn’t have. With the posting field empty it wouldn’t run at all.",
            us: OURS_ON_THE_SAME_RESUME,
        },
        hub: {
            does: "Scores how closely your resume’s keywords match one job posting and lists the missing terms.",
            costs: "$49.95 a month, or $89.95 every three months. Recurring.",
            free: "Five scans a month, with the tracker and builder.",
        },
        answer: (
            <>
                Jobscan compares your resume to one job posting and scores the keyword match, with five free scans a month and a subscription for more. {OUR_NAME} reads the whole resume the way a recruiter would and lists every line that needs work, with the first report free and no subscription.
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
                        What a match rate can’t tell you is whether a recruiter believes the bullets. A resume can match most of the keywords and still read as a list of duties with no results. Jobscan’s score is also its own model of an applicant tracking system, and the documentation from the systems employers actually use says <ResearchLink to="ats-myths">the software pulls your text into fields, and automatic rejection runs on application questions, not on a match score</ResearchLink>. Whether a recruiter believes a line is a different question, and <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You have one resume and you want to know what it says to the person reading it. The report quotes the line behind every note and works down the page top to bottom, the way a recruiter reads it.
                    </>,
                    <>
                        You’d rather pay once. Five reports for $29 covers a revision and a few target roles, and when you add a job posting the report reads your resume against that role without turning it into a keyword count.
                    </>,
                    <>
                        What it won’t do: give you a match percentage or an application tracker. Add a posting and the report lists what it asks for that your resume doesn’t show, without a score for it.
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
                        Fix the resume first, then tailor it. Run the free report on your base resume and work through the lines it lists, then add the posting you’re going for and read what it asks for that your resume doesn’t show. Jobscan’s free scans give you a match rate for the same posting if you want a number. Use a term only where it truthfully describes what you did; the report will flag a line that claims more than it shows.
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
        hook: "You got a score. You still don’t know what to fix.",
        spike: "On the resume we ran through both, Resume Worded scored it 74 out of 100 and set three useful comments among 78 generic items and 13 locked ones.",
        summary: "Scores your resume and LinkedIn against its checklist, $19 to $49 a month.",
        sameResume: {
            them: "Resume Worded scored it 74 out of 100 and opened with three comments that quote real lines, the closest thing to a recruiter’s read we saw. Around them sat 78 generic items and 13 locked ones. Its one rewrite suggestion added an applicant tracking system and “bar calibration” work the resume never claims, on the reasoning that the employer “makes them believable”. A sales email followed 77 minutes later.",
            us: OURS_ON_THE_SAME_RESUME,
        },
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
                us: "A recruiter’s write-up, every line that needs work in the order a recruiter hits it, what they can’t tell from each, and an example built only from facts you supplied. No sample lines from anyone else’s resume.",
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
                us: "A profile review from LinkedIn’s own PDF of your profile. It uses one report.",
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
                        The score comes from Resume Worded’s own checklist. Its page describes a line-by-line analysis, keyword analysis, and ATS checking, which are useful and are not the same as a recruiter deciding whether the work is real. The sample lines from “top candidates” are other people’s facts; anything you borrow has to be rebuilt around your own: <ResearchLink to="quantifying-impact">what changed, how you measured it, and what you did to get there</ResearchLink>.
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
                        What it won’t do: supply templates or keep a running score over time. Saved reports, when you sign in, are the history.
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
        hook: "You’re tracking every application. Nobody’s calling back.",
        spike: "A tracker can’t tell you why. On the resume we ran through both, Teal scored it 45% and locked all sixteen reasons behind Teal+.",
        summary: "A resume builder and job tracker, free, with Teal+ at $13 a week to $79 a quarter.",
        sameResume: {
            them: "Teal rebuilt the resume in its own template, scored it 45%, and locked all sixteen reasons behind Teal+. With the posting it showed an 18% match and five missing phrases, one of which the resume contains in other words (“Full-cycle recruiting” for “Full Lifecycle Recruiting”).",
            us: OURS_ON_THE_SAME_RESUME,
        },
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
                us: "A recruiter’s write-up, every line that needs work in order, what they can’t tell from each, and an example from your facts. Download it as a PDF when you sign in.",
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
                        What a builder can’t do is tell you whether the bullets hold up. Teal’s analysis and match score check structure and keywords against its own rules. Whether a recruiter would believe a line, or stop on it, is a different question: <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>, and a match score doesn’t read that section the way a person does.
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
                        Build and track in Teal, then export the resume you plan to send and run it through the free report before it goes out. If the report cards a line, fix it in Teal and export again.
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
    {
        slug: "kickresume",
        name: "Kickresume",
        path: "/compare/kickresume",
        title: "Kickresume vs Recruiter in Your Pocket",
        hook: "A new template won’t tell you why they passed.",
        spike: "On the resume we ran through both, Kickresume rebuilt it into its own template, scored the rebuild 80 out of 100, and put every fix behind Premium.",
        summary: "An AI resume builder with 40 templates, free with limits, Premium from $8 a month on the yearly plan.",
        sameResume: {
            them: "Kickresume rebuilt the resume into its template before scoring the rebuild 80 out of 100, then put every fix and its “recruiter feedback” behind Premium. The checker is the way into the builder, not a read of the file you uploaded.",
            us: OURS_ON_THE_SAME_RESUME,
        },
        hub: {
            does: "Builds a resume from a template and drafts the text with AI from your job title. Premium adds an ATS checker, a cover letter writer, and a personal website.",
            costs: "$24 a month, $54 a quarter, or $96 a year. Recurring.",
            free: "Four basic templates, pre-written phrases, and unlimited downloads.",
        },
        answer: (
            <>
                Kickresume builds the resume: pick a template, give it your job title, and its AI writer drafts the summary and the bullets, free with four templates and from $8 a month on a yearly plan for the rest. {OUR_NAME} doesn’t build anything. It reads the resume you already have the way a recruiter would, free for the first report.
                If you’re starting from a blank page and want it to look finished fast, Kickresume is built for that. If you have a resume and want to know what a recruiter would question, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "A resume builder. You choose a template, enter your job title and experience, and its AI writer drafts the text.",
                us: ourRows.whatItIs,
            },
            {
                label: "Who does the work",
                them: "You and the AI writer. The text comes from your job title and the phrases you pick. A human proofreader is a $30 add-on per resume.",
                us: ourRows.whoReads,
            },
            {
                label: "What you get back",
                them: "A designed resume and cover letter as a PDF, with an ATS checker score, a Career Map, and a personal website on Premium.",
                us: ourRows.whatYouGet,
            },
            {
                label: "Price",
                them: "$24 a month, $54 every three months (shown as $18 a month), or $96 a year (shown as $8 a month).",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "Four basic resume templates, four matching cover letter templates, 20,000 pre-written phrases, and unlimited downloads. The AI Writer and the other 40 templates are listed under the paid plans.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "Recurring on the term you pick. Each paid plan lists a 14-day money-back guarantee.",
                us: ourRows.renewal,
            },
            {
                label: "Students",
                them: "Premium is free for students who verify with ISIC, ITIC, or UNiDAYS.",
                us: "No student plan. The first report is free for everyone.",
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is Kickresume worth it?",
                paragraphs: [
                    <>
                        If you don’t have a resume yet, or yours is a plain document you dread opening, a builder earns its price: the templates are finished designs, and the yearly plan at $96 is the cheapest way to keep them for a whole search. Kickresume’s own FAQ recommends that plan because most searches take months.
                    </>,
                    <>
                        What the AI writer can’t know is what you did. It drafts from a job title and a library of phrases, so the bullets it writes are the ones anyone with that title could have written, and that is the section a reader weighs: <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>. Read every generated line as a claim you’ll be asked about. Its ATS checker scores you against Kickresume’s own database of resumes; <ResearchLink to="ats-myths">the systems employers use pull your text into fields, and automatic rejection runs on application questions, not on a score</ResearchLink>.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You already have a resume and the question is whether it holds up. The report quotes the lines a recruiter would question, top to bottom, the way a recruiter reads.
                    </>,
                    <>
                        You wrote it yourself and want the text to survive a reader, not a template. Where a bullet is generic, the report asks for <ResearchLink to="quantifying-impact">what changed, how you measured it, and what you did to get there</ResearchLink>, then rewrites the line from your answer. Nothing gets added that you didn’t say.
                    </>,
                    <>
                        What it won’t do: design the page, write a resume from a job title, or build you a website.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        Kickresume’s pricing page listed four plans on {formatChecked()}: Free at $0 with four basic resume templates, four matching cover letter templates, one basic website template, 20,000 pre-written phrases, 1,500 resume examples, and unlimited downloads; Monthly at $24; Quarterly at $54 every three months, shown as $18 a month; and Yearly at $96 every twelve months, shown as $8 a month and marked as a 25% saving. The paid plans share one feature list: 40 resume and 40 cover letter templates, all colors and typefaces, the AI Writer, the ATS Resume Checker, Career Map, LinkedIn and PDF import, the mobile apps, seven personal website templates, priority support, and a 14-day money-back guarantee. A human grammar correction is $30 per resume. Students who verify with ISIC, ITIC, or UNiDAYS get Premium free.
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
                        Build in Kickresume if you want the design, then export the PDF and run it through the free report before you send it. The report reads the words, not the template, so it will tell you whether the AI’s bullets say anything a recruiter can check. Fix those in Kickresume and export again.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Pricing (plans, prices, and what each includes)",
                publisher: "Kickresume",
                year: "Read " + formatChecked(),
                href: "https://www.kickresume.com/en/pricing/",
            },
        ],
    },
    {
        slug: "rezi",
        name: "Rezi",
        path: "/compare/rezi",
        title: "Rezi vs Recruiter in Your Pocket",
        hook: "Rezi scored the same resume 56, then 96.",
        spike: "That was 56 without a job posting and 96 with one, after it rebuilt the file and added a summary and a skills section the person didn’t write. Neither number says what a recruiter would stop on.",
        summary: "An AI resume builder with its own live score and keyword targeting, free with limits, $29 a month or $149 once.",
        sameResume: {
            them: "Rezi scored the same file 56 (“Needs improvement”) without a posting and 96 (“Excellent”) with one, after rebuilding it, adding a summary and a skills section the person didn’t write, and misreading a company name. Its readable advice was verb and punctuation rules, one of which flagged a correctly punctuated bullet.",
            us: OURS_ON_THE_SAME_RESUME,
        },
        hub: {
            does: "Builds a resume with AI, scores it against its own checklist as you type, and targets keywords from a posting. Pro adds unlimited resumes and a monthly expert review.",
            costs: "$29 a month, or $149 once for the lifetime plan.",
            free: "One resume, three PDF downloads, and a limited score.",
        },
        answer: (
            <>
                Rezi builds the resume with AI and scores it as you type, free for one resume and three downloads, then $29 a month or $149 once for everything. {OUR_NAME} reads the resume you already have the way a recruiter would, free for the first report, and never scores it against a checklist.
                If you want a builder that keeps a live score and feeds you keywords from the posting, Rezi is built for that. If you want to know what a person would question on the resume you have, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "An AI resume builder. You start from scratch or import a resume, its AI writes and edits bullets, and the Rezi Score rates the result as you go.",
                us: ourRows.whatItIs,
            },
            {
                label: "What it checks",
                them: "Its own score across a checklist, keyword targeting against a posting, and real-time content analysis. The free plan limits all three.",
                us: "What your bullets say you did and what changed because of it, the lines a recruiter would question, and the facts you left off.",
            },
            {
                label: "Who does the work",
                them: "Software. Pro adds one expert resume review a month; on the free plan a review starts at $8.",
                us: ourRows.whoReads,
            },
            {
                label: "What you get back",
                them: "A resume built in Rezi, exported as a PDF (Word and Google Drive on Pro), plus AI cover letters, an AI mock interview, and the score.",
                us: ourRows.whatYouGet,
            },
            {
                label: "Price",
                them: "$29 a month, or $149 once for the lifetime plan. Enterprise is $99 a month per 200 users.",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "One resume, one AI interview, three PDF downloads, the standard templates, and the AI writer and editor, with the score and keyword targeting limited.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "Pro recurs monthly until you cancel; the lifetime plan is one payment. The page’s title says all plans include a 30-day money-back guarantee.",
                us: ourRows.renewal,
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is Rezi worth it?",
                paragraphs: [
                    <>
                        If you’re writing from scratch and want a nudge on every line, the live score is the draw, and $149 once is a fair price for a builder you’ll use across several searches. The $29 month is for a short, intense one.
                    </>,
                    <>
                        What a score can’t tell you is whether the line is true, or whether a person would believe it. The Rezi Score is Rezi’s own checklist, and a score is still an algorithm’s recommendation: in one experiment, <ResearchLink to="human-vs-algorithm">an algorithm’s recommendation swayed recruiters even when they said they trusted it less than a person</ResearchLink>. Treat it as a prompt to check the line, not a verdict on it. Its keyword targeting is also Rezi’s own model of an applicant tracking system; <ResearchLink to="ats-myths">the systems employers use pull your text into fields, and automatic rejection runs on application questions, not on keyword counts</ResearchLink>.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You have a resume and want a reader’s opinion, not a meter. The report quotes the line behind every note and works down the page top to bottom, the way a recruiter reads it.
                    </>,
                    <>
                        You’d rather fix the facts than the score. When a line says what you did but not what changed, the report asks for <ResearchLink to="quantifying-impact">what changed, how you measured it, and what you did to get there</ResearchLink>, and rewrites from your answer.
                    </>,
                    <>
                        What it won’t do: build the resume, keep a running score, write cover letters, or run a mock interview.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        Rezi’s pricing page listed four plans on {formatChecked()}: Free at $0 with one resume, one AI interview, three PDF downloads, the standard templates, and the AI writer and editor, with the Rezi Score, keyword targeting, and real-time analysis limited; Pro at $29 a month with unlimited resumes, interviews, and downloads, all templates, the full score and keyword targeting, Word and Google Drive export, and one expert resume review a month; a Lifetime plan at $149 for one payment, described as all features; and Enterprise at $99 a month per 200 users. The page’s title says all plans include a 30-day money-back guarantee.
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
                        Build in Rezi if the live score keeps you writing, then export the PDF and run the free report before it goes out. Where the score says you’re done and the report cards a line, trust the card: it’s the question a recruiter would ask.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Pricing (plans and the feature comparison)",
                publisher: "Rezi",
                year: "Read " + formatChecked(),
                href: "https://www.rezi.ai/pricing",
            },
        ],
    },
    {
        slug: "enhancv",
        name: "Enhancv",
        path: "/compare/enhancv",
        title: "Enhancv vs Recruiter in Your Pocket",
        hook: "You made it beautiful. Does it say what you did?",
        spike: "Enhancv works on how the page looks. This report reads what the lines say, and the first one is free.",
        summary: "A design-first resume builder, free for seven days with branding, Pro from $16.50 a month on a six-month plan.",
        hub: {
            does: "Builds a visually designed resume with drag-and-drop sections, content suggestions, and an ATS check. The free plan lasts seven days and carries Enhancv branding.",
            costs: "$39 a month, $69 a quarter, or $99 for six months. Recurring.",
            free: "Seven days, with branding and a 12-item limit.",
        },
        answer: (
            <>
                Enhancv is a resume builder for people who want the page to look designed: hundreds of templates, drag-and-drop sections, and content suggestions, free for seven days with its branding on the PDF, then from $16.50 a month on a six-month plan. {OUR_NAME} doesn’t touch the design. It reads the words on the resume you have the way a recruiter would, free for the first report.
                If the look of the page is what you’re after, Enhancv is built for that. If you want to know whether the words hold up, start here.
            </>
        ),
        rows: [
            {
                label: "What it is",
                them: "A design-first resume builder with templates, custom sections, color and font options, and a cover letter builder.",
                us: ourRows.whatItIs,
            },
            {
                label: "What it checks",
                them: "Real-time content suggestions, a grammar and punctuation check, and an ATS check that reads the job ad you paste in.",
                us: "What your bullets say you did and what changed because of it, the lines a recruiter would question, and the facts you left off.",
            },
            {
                label: "What you get back",
                them: "A designed resume and cover letter as a PDF. Free downloads carry Enhancv branding.",
                us: ourRows.whatYouGet,
            },
            {
                label: "Price",
                them: "$39 a month, $69 every three months (shown as $23 a month), or $99 every six months (shown as $16.50 a month).",
                us: ourRows.price,
            },
            {
                label: "Free option",
                them: "A free plan valid for seven days, with all templates, basic sections, a 12-item limit, and Enhancv branding on the resume.",
                us: ourRows.free,
            },
            {
                label: "Renewal",
                them: "Recurring on the term you pick. The FAQ offers a refund when a fault is Enhancv’s; it states no general refund window.",
                us: ourRows.renewal,
            },
            {
                label: "Design",
                them: "Hundreds of templates, custom sections, and thousands of design options.",
                us: "None. The report reads the text we pull from your file, not the layout.",
            },
        ],
        sections: [
            {
                id: "worth-it",
                title: "Is Enhancv worth it?",
                paragraphs: [
                    <>
                        If a plain document is the problem, Enhancv solves it well: the templates are the most designed of the tools on these pages, and the six-month plan at $99 is the cheapest way to keep them for a search. The free week is a trial, not a free tier, so decide inside it.
                    </>,
                    <>
                        What a design can’t do is make a recruiter believe the bullets, and a heavy one can get in the way: <ResearchLink to="ats-myths">Greenhouse lists graphics, columns, tables, and text boxes among the layouts that can parse badly</ResearchLink>, and a failed parse means someone retyping your details by hand. Enhancv’s own ATS check is one answer to that. Keep the sections and headings a reader recognizes anyway, because <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>, and no template fills that section for you.
                    </>,
                ],
            },
            {
                id: "when-us",
                title: `When ${OUR_NAME} is the better choice`,
                paragraphs: [
                    <>
                        You care more about what your resume says than how it looks. The report quotes the lines a recruiter would question, in the order they’d read them.
                    </>,
                    <>
                        You want the resume to say who you are, which is a sentence, not a template: <ResearchLink to="who-you-are">a recruiter is trying to say who you are in one line and explain you to a hiring manager</ResearchLink>. Your report opens with that line, written from your resume. If it isn’t who you are, that’s what to fix first.
                    </>,
                    <>
                        What it won’t do: design the page, offer templates, or export a styled resume. The PDF you can download is the report.
                    </>,
                ],
            },
            {
                id: "prices",
                title: "What the prices cover",
                paragraphs: [
                    <>
                        Enhancv’s pricing page, shown to us in US dollars, listed a free plan and three Pro terms on {formatChecked()}: Free at $0, valid for seven days, with all templates, basic sections, a maximum of 12 section items, and Enhancv branding; Pro Monthly at $39 billed once a month; Pro Quarterly at $69 billed every three months, shown as $23 a month; and Pro Semiannual at $99 billed every six months, shown as $16.50 a month. Pro includes 300 resumes and cover letters, all templates, real-time content suggestions, the ATS check, Pro sections, no branding, unlimited section items, and the full set of design options. The FAQ says a refund is available when a problem is Enhancv’s fault; no general refund window is stated.
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
                        Design in Enhancv, then export the PDF and run the free report before you send it. If the lines the report quotes come out scrambled, the layout didn’t survive being read as text, and a parser may struggle with it too. Fix the words in Enhancv, keep the sections a reader expects, and export again.
                    </>,
                ],
            },
        ],
        sources: [
            {
                id: "source-1",
                title: "Pricing (free plan and Pro terms)",
                publisher: "Enhancv",
                year: "Read " + formatChecked(),
                href: "https://enhancv.com/pricing/",
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
