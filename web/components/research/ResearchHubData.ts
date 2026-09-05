// Shared content and routing data for the Research hub.
// Keeping this separate lets the interactive surface stay focused on behavior and composition.

export type ResearchArticle = {
    id: string;
    title: string;
    description: string;
    readTime: string;
    href: string;
    note?: string;
};

type ResearchCategory = {
    descriptor: string;
    id: string;
    navLabel: string;
    title: string;
    subtitle: string;
    articles: ResearchArticle[];
};

export const categories: ResearchCategory[] = [
    {
        descriptor: "What recruiters may notice first.",
        id: "attention",
        navLabel: "First impressions",
        title: "What recruiters notice first",
        subtitle: "Research on first-pass attention, page length, structure, and visible errors.",
        articles: [
            {
                id: "how-recruiters-read",
                title: "What Recruiters Notice in the First Pass",
                description: "What eye-tracking research observed, what it did not prove, and why structure still matters.",
                readTime: "6 min read",
                href: "/research/how-recruiters-read",
                note: "Start here",
            },
            {
                id: "resume-length-myths",
                title: "Should a Resume Be One Page?",
                description: "When one page is enough, and when a second page adds relevant experience.",
                readTime: "6 min read",
                href: "/research/resume-length-myths",
            },
            {
                id: "spelling-errors-impact",
                title: "How Spelling Mistakes Affect Recruiter Judgment",
                description: "What one experiment found about repeated spelling errors and interview ratings.",
                readTime: "5 min read",
                href: "/research/spelling-errors-impact",
            },
        ],
    },
    {
        descriptor: "How to make your experience clear and credible.",
        id: "writing",
        navLabel: "Writing",
        title: "Clearer writing and stronger evidence",
        subtitle: "Research and practical guidance on bullets, context, outcomes, and structure.",
        articles: [
            {
                id: "quantifying-impact",
                title: "How to Describe a Result Without Making One Up",
                description: "How to connect what you did, the scope of the work, and what changed without manufacturing a metric.",
                readTime: "7 min read",
                href: "/research/quantifying-impact",
            },
            {
                id: "writing-quality-hire-probability",
                title: "How Writing Quality Affects Evaluation",
                description: "What a large field experiment found about resume writing assistance and hires.",
                readTime: "6 min read",
                href: "/research/writing-quality-hire-probability",
            },
            {
                id: "star-method",
                title: "When the STAR Method Helps",
                description: "A simple way to add context, action, and results to an interview answer or resume bullet.",
                readTime: "5 min read",
                href: "/research/star-method",
            },
            {
                id: "structured-interviews-why-star",
                title: "Why Are Structured Interviews More Reliable?",
                description: "How consistent questions and scoring criteria help interviewers compare candidates.",
                readTime: "6 min read",
                href: "/research/structured-interviews-why-star",
            },
            {
                id: "how-we-score",
                title: "How We Review Your Resume",
                description: "What the report looks for, how the score is used, and what it cannot tell you.",
                readTime: "5 min read",
                href: "/research/how-we-score",
                note: "Methodology",
            },
        ],
    },
    {
        descriptor: "What gets you found before someone opens the resume.",
        id: "visibility",
        navLabel: "Getting found",
        title: "Search, LinkedIn, and referrals",
        subtitle: "What affects whether a recruiter finds you before they ever open the resume.",
        articles: [
            {
                id: "linkedin-visibility",
                title: "What Makes a LinkedIn Profile Easier to Find",
                description: "What the platform publishes, what you control, and what remains private.",
                readTime: "5 min read",
                href: "/research/linkedin-visibility",
            },
            {
                id: "social-screening",
                title: "How Social Media Affects Candidate Ratings",
                description: "What a screening experiment found, and why public posts are a poor basis for judging job performance.",
                readTime: "6 min read",
                href: "/research/social-screening",
            },
            {
                id: "referral-advantage",
                title: "What a Referral Changes",
                description: "Why an application can be evaluated differently when someone adds context.",
                readTime: "6 min read",
                href: "/research/referral-advantage",
            },
        ],
    },
    {
        descriptor: "What the resume cannot control.",
        id: "systems",
        navLabel: "Hiring systems",
        title: "ATS, bias, and the hiring process",
        subtitle: "Where the resume can help, where it cannot, and how the rest of the hiring process shapes the outcome.",
        articles: [
            {
                id: "ats-myths",
                title: "What Applicant Tracking Systems Do",
                description: "What platform documentation says about parsing, stored information, and employer filters.",
                readTime: "6 min read",
                href: "/research/ats-myths",
            },
            {
                id: "automation-and-bias",
                title: "Hiring Algorithms, Equity, and Bias",
                description: "Where automated decisions can affect who sees a job, gets screened, or reaches a reviewer.",
                readTime: "6 min read",
                href: "/research/automation-and-bias",
            },
            {
                id: "human-vs-algorithm",
                title: "What Recruiters Trust and What They Follow",
                description: "Why recruiters in one experiment trusted human advice more but still followed misleading algorithmic advice.",
                readTime: "5 min read",
                href: "/research/human-vs-algorithm",
            },
            {
                id: "hiring-discrimination-meta-analysis",
                title: "What Hiring Studies Show About Discrimination",
                description: "What resume advice cannot fix about bias in hiring.",
                readTime: "6 min read",
                href: "/research/hiring-discrimination-meta-analysis",
            },
            {
                id: "skills-first-promise-reality",
                title: "Skills-First Hiring: Promise vs Reality",
                description: "The gap between what employers say they value and how they actually hire.",
                readTime: "7 min read",
                href: "/research/skills-first-promise-reality",
            },
            {
                id: "salary-history-bans",
                title: "What Salary History Studies Tell Us",
                description: "What research on salary history bans and disclosure can tell you about a pay conversation.",
                readTime: "5 min read",
                href: "/research/salary-history-bans",
            },
        ],
    },
];

export type FindingVisual = "spelling" | "parser" | "artifact" | "judgment";

export const featuredFindings: Array<{
    index: string;
    slug: string;
    navLabel: string;
    question: string;
    conclusion: string;
    sourceName: string;
    sourceDetail: string;
    sourceHref: string;
    sourceLabel: string;
    reportUse: string;
    href: string;
    visual: FindingVisual;
}> = [
    {
        index: "01",
        slug: "spelling-mistakes",
        navLabel: "Spelling",
        question: "Do spelling mistakes actually change the decision?",
        conclusion: "Repeated errors lowered recruiters' ratings in a 2023 experiment. Five errors reduced the average invitation rating by 1.85 points on a 0–10 scale. These were hypothetical decisions, not observed callbacks.",
        sourceName: "Sterkens et al., PLOS ONE (2023)",
        sourceDetail: "Factorial survey experiment with 445 genuine recruiters evaluating resumes across eight occupations.",
        sourceHref: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280",
        sourceLabel: "Read the study",
        reportUse: "The report reviews your experience and how you explain it. Follow it with a separate spelling check; it is not a dedicated proofreader.",
        href: "/research/spelling-errors-impact",
        visual: "spelling",
    },
    {
        index: "02",
        slug: "ats-parsing",
        navLabel: "ATS parsing",
        question: "What does an ATS do with the file?",
        conclusion: "It extracts text into fields. Greenhouse and Lever both document parsing failures caused by image files and hard-to-read formatting. Neither describes one universal score that decides every application.",
        sourceName: "Greenhouse + Lever product documentation (2025–2026)",
        sourceDetail: "Current operational documentation for two widely used applicant-tracking systems.",
        sourceHref: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse",
        sourceLabel: "Read Greenhouse documentation",
        reportUse: "We check for selectable text, conventional sections, and a reading order that survives extraction.",
        href: "/research/ats-myths",
        visual: "parser",
    },
    {
        index: "03",
        slug: "whole-resume",
        navLabel: "Whole resume",
        question: "Can a score or keyword profile stand in for the real resume?",
        conclusion: "In this study, recruiters used different information to judge full resumes than they used to judge simplified profiles. It did not test resume scores or establish that every scoring method is unsafe.",
        sourceName: "Fritzsche & Brannick, JOOP (2002)",
        sourceDetail: "Forty recruiters judged 60 actual resumes or corresponding resume profiles.",
        sourceHref: "https://stars.library.ucf.edu/facultybib2000/3203/",
        sourceLabel: "Read the study record",
        reportUse: "The report explains the findings behind your score. It considers your career progression, responsibilities, and results together.",
        href: "/research/how-we-score",
        visual: "artifact",
    },
    {
        index: "04",
        slug: "human-judgment",
        navLabel: "Human judgment",
        question: "Does trusting advice mean following it?",
        conclusion: "Not necessarily. In a 694-person experiment, recruiting professionals trusted human recommendations more. Yet misleading algorithmic advice influenced their candidate ratings while misleading human advice did not.",
        sourceName: "Lacroux & Martin-Lacroux, Frontiers in Psychology (2022)",
        sourceDetail: "Experiment with 694 professionals involved in screening job applications.",
        sourceHref: "https://pubmed.ncbi.nlm.nih.gov/35874355/",
        sourceLabel: "Read the study",
        reportUse: "We quote your resume and explain each recommendation so you can decide whether it fits your experience.",
        href: "/research/human-vs-algorithm",
        visual: "judgment",
    },
];

export const evidenceGaps = [
    {
        claim: "Every recruiter spends exactly six seconds on a resume.",
        correction: "Treat the opening as high-value space, but do not write for a stopwatch. No study establishes one universal timer or scan path.",
        href: "/research/how-recruiters-read",
    },
    {
        claim: "An ATS rejects a resume because it does not reach a magic score.",
        correction: "Make the file easy to parse and the evidence easy to find. There is no universal ATS score shared across employers and platforms.",
        href: "/research/ats-myths",
    },
    {
        claim: "A resume should always fit on one page.",
        correction: "Use a second page when it adds experience that matters for the role. Cut repetition before shrinking the text to fit one page.",
        href: "/research/resume-length-myths",
    },
];
