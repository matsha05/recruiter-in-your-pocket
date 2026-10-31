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
        descriptor: "How you're read",
        id: "perception",
        navLabel: "Perception",
        title: "How you're read",
        subtitle: "What a recruiter, and the software in front of them, takes from your resume before deciding anything.",
        articles: [
            {
                id: "how-recruiters-read",
                title: "What recruiters notice in the first pass",
                description: "What eye-tracking research observed, what it didn't prove, and why structure still matters.",
                readTime: "5 min read",
                href: "/research/how-recruiters-read",
                note: "Start here",
            },
            {
                id: "resume-length-myths",
                title: "There is no universal one-page rule",
                description: "When one page is enough, and when a second page adds relevant experience.",
                readTime: "4 min read",
                href: "/research/resume-length-myths",
            },
            {
                id: "spelling-errors-impact",
                title: "How spelling errors changed recruiter ratings",
                description: "What one experiment found about repeated spelling errors and interview ratings.",
                readTime: "4 min read",
                href: "/research/spelling-errors-impact",
            },
            {
                id: "social-screening",
                title: "How public social cues changed candidate ratings",
                description: "What a screening experiment found, and why public posts are a poor basis for judging job performance.",
                readTime: "5 min read",
                href: "/research/social-screening",
            },
            {
                id: "ats-myths",
                title: "What applicant tracking systems actually do",
                description: "What platform documentation says about parsing, stored information, and employer filters.",
                readTime: "5 min read",
                href: "/research/ats-myths",
            },
            {
                id: "automation-and-bias",
                title: "Where automation enters hiring",
                description: "Where automated decisions can affect who sees a job, gets screened, or reaches a reviewer.",
                readTime: "4 min read",
                href: "/research/automation-and-bias",
            },
            {
                id: "human-vs-algorithm",
                title: "What recruiters trust and what they follow",
                description: "Why recruiters in one experiment trusted human advice more but still followed misleading algorithmic advice.",
                readTime: "4 min read",
                href: "/research/human-vs-algorithm",
            },
            {
                id: "hiring-discrimination-meta-analysis",
                title: "Discrimination in hiring hasn't gone away",
                description: "What resume advice can't fix about bias in hiring.",
                readTime: "5 min read",
                href: "/research/hiring-discrimination-meta-analysis",
            },
        ],
    },
    {
        descriptor: "What you changed",
        id: "impact",
        navLabel: "Impact",
        title: "What you changed",
        subtitle: "Showing what changed because of your work, and which part of it was yours.",
        articles: [
            {
                id: "quantifying-impact",
                title: "Show what changed and your part in it",
                description: "How to connect what you did, the scope of the work, and what changed without manufacturing a metric.",
                readTime: "5 min read",
                href: "/research/quantifying-impact",
                note: "Start here",
            },
            {
                id: "writing-quality-hire-probability",
                title: "Writing help led to more hires in one experiment",
                description: "What a large field experiment found about resume writing assistance and hires.",
                readTime: "4 min read",
                href: "/research/writing-quality-hire-probability",
            },
            {
                id: "how-we-score",
                title: "How the report works",
                description: "How the Verdict, score, and Critical Miss are made, and what the score can't tell you.",
                readTime: "5 min read",
                href: "/methodology",
                note: "Methodology",
            },
        ],
    },
    {
        descriptor: "Who brings you in",
        id: "referrals",
        navLabel: "Referrals",
        title: "Who brings you in",
        subtitle: "How a referral, or being easy to find, puts your resume in front of a person who's already interested.",
        articles: [
            {
                id: "referral-advantage",
                title: "What a referral changes",
                description: "Referred candidates are a sliver of applicants and a big share of hires. What the studies show, and what a referral can't do for you.",
                readTime: "7 min read",
                href: "/research/referral-advantage",
                note: "Start here",
            },
            {
                id: "linkedin-visibility",
                title: "What makes a LinkedIn profile easier to find",
                description: "What the platform publishes, what you control, and what remains private.",
                readTime: "4 min read",
                href: "/research/linkedin-visibility",
            },
        ],
    },
    {
        descriptor: "Who you are",
        id: "story",
        navLabel: "Story",
        title: "Who you are",
        subtitle: "Whether a recruiter can tell who you are, follow what you've done, and picture you in the job.",
        articles: [
            {
                id: "who-you-are",
                title: "Can a recruiter tell who you are?",
                description: "Early impressions carry through to offers, coherent careers get hired more, and specifics let a stranger picture you in the job.",
                readTime: "6 min read",
                href: "/research/who-you-are",
                note: "Start here",
            },
            {
                id: "star-method",
                title: "Tell the story behind the line",
                description: "How to use STAR on a resume line and in a structured interview without forcing the formula.",
                readTime: "6 min read",
                href: "/research/star-method",
            },
            {
                id: "skills-first-promise-reality",
                title: "Skills-first hiring: the promise and the practice",
                description: "The gap between what employers say they value and how they actually hire.",
                readTime: "4 min read",
                href: "/research/skills-first-promise-reality",
            },
        ],
    },
    {
        descriptor: "Negotiating the offer",
        id: "negotiation",
        navLabel: "After the offer",
        title: "Negotiating the offer",
        subtitle: "What to say about pay, how to read an offer, and how to compare two of them.",
        articles: [
            {
                id: "offer-negotiation",
                title: "How to negotiate a job offer",
                description: "A step-by-step sequence with scripts you can adapt, and what to ask for beyond base salary.",
                readTime: "10 min read",
                href: "/resources/offer-negotiation",
                note: "Playbook",
            },
            {
                id: "tech-offer-negotiation",
                title: "How to read and negotiate a tech offer",
                description: "How to separate cash, bonus, and equity, and make a clear counter.",
                readTime: "12 min read",
                href: "/resources/tech-offer-negotiation",
                note: "Playbook",
            },
            {
                id: "comp-calculator",
                title: "Compare two offers side by side",
                description: "Put salary, bonus, equity, and benefits on the same footing before you decide.",
                readTime: "Tool",
                href: "/resources/tools/comp-calculator",
                note: "Calculator",
            },
            {
                id: "salary-history-bans",
                title: "Should you share your salary history?",
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
        conclusion: "Repeated errors lowered recruiters' ratings in a 2023 experiment. Five errors reduced the average interview rating by 1.85 points on a 0–10 scale. These were hypothetical decisions, not observed callbacks.",
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
        href: "/methodology",
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
