// The Research hub is a list of questions people actually ask, each answered in
// one line from the article it links to. Keep every answer inside what that
// article's sources found; when an article changes, check its answer here.

export type ResearchArticle = {
    id: string;
    /** The article's own title, for screen-reader link text. */
    title: string;
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
                title: "What applicant tracking systems actually do",
                href: "/research/ats-myths",
                question: "Is a robot rejecting me?",
                answer: "Not with one magic score. The software pulls your text into fields. If it can't, the file stays attached and someone enters the details by hand.",
                featured: true,
            },
            {
                id: "spelling-errors-impact",
                title: "How spelling errors changed recruiter ratings",
                href: "/research/spelling-errors-impact",
                question: "Does one typo sink me?",
                answer: "Don't panic over one. Five cost 1.85 points out of 10 in an experiment with 445 recruiters.",
                featured: true,
            },
            {
                id: "resume-length-myths",
                title: "There is no universal one-page rule",
                href: "/research/resume-length-myths",
                question: "Does it have to fit on one page?",
                answer: "No. Use a second page when it adds experience that matters for the role.",
                featured: true,
            },
            {
                id: "how-recruiters-read",
                title: "What recruiters notice in the first pass",
                href: "/research/how-recruiters-read",
                question: "Do recruiters really give it six seconds?",
                answer: "No study shows one fixed timer. Recruiters who spent longer on Experience were more likely to move a resume forward.",
                featured: true,
            },
            {
                id: "social-screening",
                title: "How public social cues changed candidate ratings",
                href: "/research/social-screening",
                question: "Do recruiters judge my social media?",
                answer: "In one experiment, posts changed candidate ratings. Nobody showed those ratings predict how you'd do the job.",
            },
            {
                id: "automation-and-bias",
                title: "Where automation enters hiring",
                href: "/research/automation-and-bias",
                question: "Where can software screen me out?",
                answer: "Earlier than you'd think: which ads you see, whether you're eligible, and how you reach a person.",
            },
            {
                id: "human-vs-algorithm",
                title: "What recruiters trust and what they follow",
                href: "/research/human-vs-algorithm",
                question: "Do recruiters trust AI advice?",
                answer: "Less than human advice. A misleading algorithm still swayed their ratings.",
            },
            {
                id: "hiring-discrimination-meta-analysis",
                title: "Discrimination in hiring hasn't gone away",
                href: "/research/hiring-discrimination-meta-analysis",
                question: "Does bias still decide who gets called?",
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
                title: "Show what changed and your part in it",
                href: "/research/quantifying-impact",
                question: "What makes a bullet point land?",
                answer: "The result, how you measured it, and what you did to get there.",
            },
            {
                id: "writing-quality-hire-probability",
                title: "Writing help led to more hires in one experiment",
                href: "/research/writing-quality-hire-probability",
                question: "Does better writing get you hired?",
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
                title: "What a referral changes",
                href: "/research/referral-advantage",
                question: "Do referrals really matter?",
                answer: "A lot. In one recruiting platform's data on 38 million applications, 40% of referred applications got an interview. Of cold applications, 3% did.",
                featured: true,
            },
            {
                id: "linkedin-visibility",
                title: "What makes a LinkedIn profile easier to find",
                href: "/research/linkedin-visibility",
                question: "Can recruiters find me on LinkedIn?",
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
                title: "Gaps, pivots, and short stints",
                href: "/research/gaps-and-pivots",
                question: "Should I explain a gap?",
                answer: "In one UK experiment, explaining a caregiving gap didn't help. Listing years in each job instead of dates did.",
            },
            {
                id: "who-you-are",
                title: "Can a recruiter tell who you are?",
                href: "/research/who-you-are",
                question: "Does the first impression stick?",
                answer: "In one interview study, the early read of a candidate predicted the final ratings and the offers.",
            },
            {
                id: "star-method",
                title: "Tell the story behind the line",
                href: "/research/star-method",
                question: "Should I use the STAR method?",
                answer: "For the story behind a line, yes. Just don't force every bullet into the formula.",
            },
            {
                id: "skills-first-promise-reality",
                title: "Skills-first hiring: the promise and the practice",
                href: "/research/skills-first-promise-reality",
                question: "Do “no degree required” jobs mean it?",
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
                title: "Should you share your salary history?",
                href: "/research/salary-history-bans",
                question: "Should I share my salary history?",
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
