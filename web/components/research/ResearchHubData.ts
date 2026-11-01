// The Research hub is a list of questions people actually ask, each answered in
// one line from the article it links to. Keep every answer inside what that
// article's sources found; when an article changes, check its answer here.

export type ResearchArticle = {
    id: string;
    /** The page's own headline, only where it isn't the question (guides, tools, the methodology).
     *  A research article's headline is its question: the same string on the hub, the H1, and the search title. */
    title?: string;
    href: string;
    question: string;
    answer: string;
    /** Leads the page with the questions people ask most. */
    featured?: boolean;
    /** Defaults to "Read". A tool says what it does instead. */
    action?: string;
};

type ResearchCategory = {
    id: string;
    navLabel: string;
    title: string;
    articles: ResearchArticle[];
};

export const categories: ResearchCategory[] = [
    {
        id: "perception",
        navLabel: "Perception",
        title: "How you're read",
        articles: [
            {
                id: "ats-myths",
                href: "/research/ats-myths",
                question: "Is an ATS rejecting my resume before anyone reads it?",
                answer: "Not with one magic score. The software pulls your text into fields. If it can't, the file stays attached and someone enters the details by hand.",
                featured: true,
            },
            {
                id: "spelling-errors-impact",
                href: "/research/spelling-errors-impact",
                question: "Will one typo on my resume cost me the interview?",
                answer: "Don't panic over one. Five cost 1.85 points out of 10 in an experiment with 445 recruiters.",
                featured: true,
            },
            {
                id: "resume-length-myths",
                href: "/research/resume-length-myths",
                question: "Does my resume really have to fit on one page?",
                answer: "No. Use a second page when it adds experience that matters for the role.",
                featured: true,
            },
            {
                id: "how-recruiters-read",
                href: "/research/how-recruiters-read",
                question: "Do recruiters only spend six seconds on a resume?",
                answer: "No study shows one fixed timer. Recruiters who spent longer on Experience were more likely to move a resume forward.",
                featured: true,
            },
            {
                id: "social-screening",
                href: "/research/social-screening",
                question: "Will employers judge me by my social media?",
                answer: "In one experiment, posts changed candidate ratings. Nobody showed those ratings predict how you'd do the job.",
            },
            {
                id: "automation-and-bias",
                href: "/research/automation-and-bias",
                question: "Where can software screen me out of a job?",
                answer: "Earlier than you'd think: which ads you see, whether you're eligible, and how you reach a person.",
            },
            {
                id: "human-vs-algorithm",
                href: "/research/human-vs-algorithm",
                question: "When AI weighs in on my resume, do recruiters listen?",
                answer: "They say they trust it less than a person. A misleading algorithm still swayed their ratings.",
            },
            {
                id: "hiring-discrimination-meta-analysis",
                href: "/research/hiring-discrimination-meta-analysis",
                question: "Does racial bias still decide who gets a callback?",
                answer: "Yes. In US hiring experiments from 1989 to 2015, white applicants got 36% more callbacks than equally qualified Black applicants.",
            },
        ],
    },
    {
        id: "impact",
        navLabel: "Impact",
        title: "What you changed",
        articles: [
            {
                id: "quantifying-impact",
                href: "/research/quantifying-impact",
                question: "How do I write resume bullets that show results?",
                answer: "The result, how you measured it, and what you did to get there.",
            },
            {
                id: "writing-quality-hire-probability",
                href: "/research/writing-quality-hire-probability",
                question: "Can better writing actually get me hired?",
                answer: "It helped in one big experiment: grammar suggestions on short freelance profiles lifted hires from 3.1% to 3.3%.",
            },
            {
                id: "how-we-score",
                title: "How the report works",
                href: "/methodology",
                question: "How does your report decide?",
                answer: "AI applies a recruiter's criteria. Here's how the Verdict, Score, and Critical Miss are made, and what the score can't tell you.",
            },
        ],
    },
    {
        id: "referrals",
        navLabel: "Referrals",
        title: "Who brings you in",
        articles: [
            {
                id: "referral-advantage",
                href: "/research/referral-advantage",
                question: "How much does a referral really help?",
                answer: "A lot. In one recruiting platform's data on 38 million applications, 40% of referred applications got an interview. Of cold applications, 3% did.",
                featured: true,
            },
            {
                id: "linkedin-visibility",
                href: "/research/linkedin-visibility",
                question: "Why can’t recruiters find me on LinkedIn?",
                answer: "They search the skills in your headline, titles, summary, and experience. LinkedIn doesn't publish how it ranks them.",
            },
        ],
    },
    {
        id: "story",
        navLabel: "Story",
        title: "Who you are",
        articles: [
            {
                id: "gaps-and-pivots",
                href: "/research/gaps-and-pivots",
                question: "Should I explain the gap on my resume?",
                answer: "In one UK experiment, explaining a caregiving gap didn't help. Listing years in each job instead of dates did.",
            },
            {
                id: "who-you-are",
                href: "/research/who-you-are",
                question: "What does my resume say about who I am?",
                answer: "Whatever a stranger can say about you in one line. In one interview study, that early read predicted the final ratings and the offers.",
            },
            {
                id: "star-method",
                href: "/research/star-method",
                question: "Is the STAR method worth using on a resume?",
                answer: "For the story behind a line, yes. Just don't force every bullet into the formula.",
            },
            {
                id: "skills-first-promise-reality",
                href: "/research/skills-first-promise-reality",
                question: "Do “no degree required” jobs actually mean it?",
                answer: "Not often. By one 2024 estimate, dropping the requirement opened up fewer than 1 in 700 hires.",
            },
        ],
    },
    {
        id: "negotiation",
        navLabel: "After the offer",
        title: "After the offer",
        articles: [
            {
                id: "offer-negotiation",
                title: "How to negotiate a job offer",
                href: "/resources/offer-negotiation",
                question: "Should I negotiate?",
                answer: "Most people don't ask. In one big survey, most who did came away with more. Here's what to say about pay, and when.",
            },
            {
                id: "tech-offer-negotiation",
                title: "How to read and negotiate a tech offer",
                href: "/resources/tech-offer-negotiation",
                question: "How do I read an offer with equity?",
                answer: "Separate the cash, the bonus, and the equity, then make one clear counter.",
            },
            {
                id: "comp-calculator",
                title: "Compare job offers side by side",
                href: "/resources/tools/comp-calculator",
                question: "Which offer is actually better?",
                answer: "Put salary, bonus, equity, and one-time pay on the same footing, and let the calculator do the math. Compare benefits separately.",
                action: "Compare",
            },
            {
                id: "salary-history-bans",
                href: "/research/salary-history-bans",
                question: "Should I tell a recruiter what I make now?",
                answer: "The studies found different effects. No one script fits every pay conversation.",
            },
        ],
    },
];

export const featuredArticles = categories.flatMap((category) => category.articles).filter((article) => article.featured);

/** The pillar an article belongs to, by its href, for labels outside the hub. Pillars are named, not colored:
 *  the pen colors already mean whose mark something is, so they are not spent on navigation. */
export function pillarForHref(href: string) {
    return categories.find((candidate) => candidate.articles.some((article) => article.href === href))?.navLabel ?? null;
}

const allAnswers = categories.flatMap((category) => category.articles);

/** A hub answer by its id. */
export function hubEntry(id: string) {
    return allAnswers.find((article) => article.id === id);
}

/** The hub answer for a page, by its path. */
export function hubEntryForHref(href: string) {
    return allAnswers.find((article) => article.href === href);
}

/** A link to a hub answer, titled the way its page is: a research article's question, or a guide's own title.
 *  Every list that links to research titles it through here, so the hub, the H1, and related links can't drift. */
export function hubLink(href: string) {
    const entry = hubEntryForHref(href);
    if (!entry) throw new Error(`${href} isn't on the Research hub (ResearchHubData.ts).`);
    return { title: entry.title ?? entry.question, href, tag: pillarForHref(href) ?? undefined };
}
