// The Research hub is an index of the questions people actually ask. Each research entry carries its short
// answer (the verdict), one sentence of what the study found, and what that rests on. Keep every word inside
// what the article's sources found: the verdicts are taken from each article's own opening answer, and the
// evidence from its own source line. When an article changes, check its entry here.
//
// November 6, 2026 (Matt): the hub is a reference people scan for answers, so every row has the same three
// parts. The site doesn't publish race and discrimination research; that article was removed the same day.

export type ResearchEvidence = {
    /** What kind of source it is, in plain words: "Experiment", "Vendor data", "Practitioner advice, not a study". */
    kind: string;
    /** Who and how many, as the article's source line gives it. */
    cite: string;
};

export type ResearchArticle = {
    id: string;
    /** The page's own headline, only where it isn't the question (guides, tools, the methodology).
     *  A research article's headline is its question: the same string on the hub, the H1, and the search title. */
    title?: string;
    href: string;
    question: string;
    /** The short answer, set in bold: "No.", "A lot, at every stage." Research entries only. */
    verdict?: string;
    /** The sentence after the verdict. Research entries only. */
    finding?: string;
    /** The whole one-line answer: the verdict and the finding, or a guide's own line. Used for share cards and search snippets. */
    answer: string;
    evidence?: ResearchEvidence;
    /** Words people type that the row's own text doesn't contain: plurals, synonyms, the jargon. */
    keywords?: string[];
    /** Defaults to "Read". A tool says what it does instead. */
    action?: string;
};

type ResearchCategory = {
    id: string;
    /** The pillar name articles carry in their header. Pillars are named, never colored. */
    navLabel: string;
    title: string;
    /** Listed in the hub's index. Guides and the methodology are linked from the hub, not listed in it. */
    indexed: boolean;
    articles: ResearchArticle[];
};

function study(entry: Omit<ResearchArticle, "answer"> & { verdict: string; finding: string; evidence: ResearchEvidence }): ResearchArticle {
    return { ...entry, answer: `${entry.verdict} ${entry.finding}` };
}

export const categories: ResearchCategory[] = [
    {
        id: "how-recruiters-read",
        navLabel: "How recruiters read",
        title: "How recruiters read",
        indexed: true,
        articles: [
            study({
                id: "how-recruiters-read",
                keywords: ["six seconds", "eye tracking", "how long", "time", "skim", "scan", "read"],
                href: "/research/how-recruiters-read",
                question: "Do recruiters only spend six seconds on a resume?",
                verdict: "No.",
                finding: "No study shows a fixed timer. Recruiters who spent longer on Experience were more likely to move a resume forward.",
                evidence: { kind: "Peer-reviewed eye-tracking study", cite: "Pina et al., 2023 · 2,043 resume reviews" },
            }),
            study({
                id: "spelling-errors-impact",
                keywords: ["typos", "spelling", "grammar", "proofread", "mistakes", "errors"],
                href: "/research/spelling-errors-impact",
                question: "Will one typo on my resume cost me the interview?",
                verdict: "Don’t panic over one.",
                finding: "Five spelling errors cost 1.85 points on a 0–10 interview rating. A single typo wasn’t tested.",
                evidence: { kind: "Experiment", cite: "Sterkens et al., PLOS ONE, 2023 · 445 hiring professionals" },
            }),
            study({
                id: "who-you-are",
                keywords: ["first impression", "summary", "objective", "headline", "story"],
                href: "/research/who-you-are",
                question: "What does my resume say about who I am?",
                verdict: "Whatever a stranger can say in one line.",
                finding: "In mock interviews, first impressions predicted the final ratings and, later, real internship offers.",
                evidence: { kind: "Peer-reviewed study", cite: "Barrick, Swider & Stewart, 2010 · interviews, not resumes" },
            }),
            study({
                id: "social-screening",
                keywords: ["social media", "instagram", "facebook", "twitter", "posts", "online"],
                href: "/research/social-screening",
                question: "Will employers judge me by my social media?",
                verdict: "In one experiment, yes.",
                finding: "Posts changed how candidates were rated. Nobody showed those ratings predict how you’d do the job.",
                evidence: { kind: "Experiment, working paper", cite: "Baker, Grimm & Ofek-Shanny · 1,500 online evaluators and 500 hiring professionals" },
            }),
        ],
    },
    {
        id: "what-to-put-on-the-page",
        navLabel: "What to put on the page",
        title: "What to put on the page",
        indexed: true,
        articles: [
            study({
                id: "resume-length-myths",
                keywords: ["length", "one page", "two pages", "long", "short"],
                href: "/research/resume-length-myths",
                question: "Does my resume really have to fit on one page?",
                verdict: "No.",
                finding: "Use a second page when it adds experience that matters for the role.",
                evidence: { kind: "Study, abstract only", cite: "Blackburn-Brockman & Belanger, 2001 · 570 CPA recruiters" },
            }),
            study({
                id: "quantifying-impact",
                keywords: ["bullets", "numbers", "metrics", "results", "quantify", "impact", "achievements"],
                href: "/research/quantifying-impact",
                question: "How do I write resume bullets that show results?",
                verdict: "Say what changed.",
                finding: "Then how you measured it, and what you did to get there.",
                evidence: { kind: "Practitioner advice, not a study", cite: "Laszlo Bock’s formula, from Google" },
            }),
            study({
                id: "star-method",
                keywords: ["star", "situation", "task", "action", "result", "format"],
                href: "/research/star-method",
                question: "Is the STAR method worth using on a resume?",
                verdict: "For the story behind a line, yes.",
                finding: "Just don’t force every bullet into the formula.",
                evidence: { kind: "Research review", cite: "Levashina et al., 2014 · doesn’t test STAR itself" },
            }),
            study({
                id: "gaps-and-pivots",
                keywords: ["gap", "gaps", "career break", "unemployed", "caregiving", "dates", "pivot"],
                href: "/research/gaps-and-pivots",
                question: "Should I explain the gap on my resume?",
                verdict: "In the largest test, no.",
                finding: "A line explaining a caregiving gap did no better than leaving it unexplained. Listing years in each job instead of dates did help.",
                evidence: { kind: "Preregistered experiment", cite: "Kristal et al., 2023 · 9,022 UK employers" },
            }),
            study({
                id: "career-breaks",
                keywords: ["sabbatical", "time off", "caregiving", "returning to work", "interview", "gap", "layoff", "referral"],
                href: "/research/career-breaks",
                question: "How do I explain a career break?",
                verdict: "Briefly, and only with what’s true.",
                finding: "Naming caregiving did no better than silence in a UK test, and worse than a layoff in a US one.",
                evidence: { kind: "Field experiments", cite: "Kristal et al., 2023 · 9,022 UK employers; Weisshaar, 2018 · 3,407 US applications" },
            }),
            study({
                id: "writing-quality-hire-probability",
                keywords: ["writing", "grammar", "wording", "clear"],
                href: "/research/writing-quality-hire-probability",
                question: "Can better writing actually get me hired?",
                verdict: "It helped in one big experiment.",
                finding: "New freelancers whose profiles went through a grammar tool were hired 3.3% of the time, against 3.1%.",
                evidence: { kind: "Randomized experiment", cite: "Wiles, Munyikwa & Horton, 2025 · 480,948 jobseekers" },
            }),
        ],
    },
    {
        id: "software-and-search",
        navLabel: "Software and search",
        title: "Software and search",
        indexed: true,
        articles: [
            study({
                id: "ats-myths",
                keywords: ["ats", "applicant tracking", "parsing", "keywords", "robot", "software", "format"],
                href: "/research/ats-myths",
                question: "Is an ATS rejecting my resume before anyone reads it?",
                verdict: "Not with one magic score.",
                finding: "The software pulls your text into fields. If it can’t, the file stays attached and someone enters the details by hand.",
                evidence: { kind: "Vendor documentation", cite: "Greenhouse and Lever, on resume parsing" },
            }),
            study({
                id: "automation-and-bias",
                keywords: ["ai", "automation", "algorithm", "screening", "filter", "rejected"],
                href: "/research/automation-and-bias",
                question: "Where can software screen me out of a job?",
                verdict: "Earlier than you’d think.",
                finding: "Which job ads you see, whether you’re eligible, and how you reach a person.",
                evidence: { kind: "Review of hiring tools", cite: "Upturn (Bogen & Rieke), 2018" },
            }),
            study({
                id: "human-vs-algorithm",
                keywords: ["ai", "algorithm", "automation", "trust"],
                href: "/research/human-vs-algorithm",
                question: "When AI weighs in on my resume, do recruiters listen?",
                verdict: "More than they say.",
                finding: "They rated human advice as more trustworthy, yet an algorithm’s pick still pulled their ratings toward it.",
                evidence: { kind: "Experiment", cite: "Lacroux & Martin-Lacroux, 2022 · 694 recruitment professionals" },
            }),
            study({
                id: "linkedin-visibility",
                keywords: ["linkedin", "profile", "recruiter search", "headline", "skills", "visibility"],
                href: "/research/linkedin-visibility",
                question: "Why can’t recruiters find me on LinkedIn?",
                verdict: "They search titles, skills and the words in your profile.",
                finding: "LinkedIn doesn’t publish how it ranks the results.",
                evidence: { kind: "Platform documentation", cite: "LinkedIn Recruiter help pages" },
            }),
        ],
    },
    {
        id: "getting-in-and-pay",
        navLabel: "Getting in, and pay",
        title: "Getting in, and pay",
        indexed: true,
        articles: [
            study({
                id: "referral-advantage",
                keywords: ["referrals", "referred", "network", "networking", "employee referral", "connections"],
                href: "/research/referral-advantage",
                question: "How much does a referral really help?",
                verdict: "A lot, at every stage.",
                finding: "40% of referred applications reached an interview. Of applications sent in cold, 3% did.",
                evidence: { kind: "Vendor data", cite: "Ashby customers, 2021 to 2024 · 38 million applications" },
            }),
            study({
                id: "skills-first-promise-reality",
                keywords: ["degree", "no degree", "skills-based", "requirements", "college"],
                href: "/research/skills-first-promise-reality",
                question: "Do “no degree required” jobs actually mean it?",
                verdict: "Often not in practice.",
                finding: "By one estimate, dropping the requirement opened up new opportunity in fewer than 1 in 700 hires.",
                evidence: { kind: "Industry analysis", cite: "Harvard Business School and Burning Glass Institute, 2024" },
            }),
            study({
                id: "salary-history-bans",
                keywords: ["salary", "pay", "compensation", "current salary", "negotiate", "disclose"],
                href: "/research/salary-history-bans",
                question: "Should I tell a recruiter what I make now?",
                verdict: "There’s no one right answer.",
                finding: "For higher-paid candidates, disclosing brought higher offers and fewer callbacks. Know the local rule and ask for the range.",
                evidence: { kind: "Field experiment, working paper", cite: "Agan, Cowgill & Gee · 2,000+ fictional applications" },
            }),
        ],
    },
    {
        id: "after-the-offer",
        navLabel: "After the offer",
        title: "After the offer",
        indexed: false,
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
        ],
    },
    {
        id: "how-the-report-works",
        navLabel: "How the report works",
        title: "How the report works",
        indexed: false,
        articles: [
            {
                id: "how-we-score",
                title: "How the report works",
                href: "/methodology",
                question: "How does your report decide?",
                answer: "AI applies a recruiter's criteria. Here's how the score, the write-up and the cards are made, and what they can't tell you.",
            },
        ],
    },
];

/** The groups the hub's index lists, in order. */
export const indexedCategories = categories.filter((category) => category.indexed);

/** The research questions the hub lists, in the order it lists them. */
export const indexedAnswers = indexedCategories.flatMap((category) => category.articles);

/** The pillar an article belongs to, by its href, for labels outside the hub. Pillars are named, not colored:
 *  the pen colors already mean whose mark something is, so they are not spent on navigation. */
export function pillarForHref(href: string) {
    return categories.find((candidate) => candidate.articles.some((article) => article.href === href))?.navLabel ?? null;
}

/** Every entry the hub knows, research first, then the guides and the methodology it links to. */
export const hubAnswers = categories.flatMap((category) => category.articles);

/** A hub entry by its id. */
export function hubEntry(id: string) {
    return hubAnswers.find((article) => article.id === id);
}

/** The hub entry for a page, by its path. */
export function hubEntryForHref(href: string) {
    return hubAnswers.find((article) => article.href === href);
}

/** A link to a hub answer, titled the way its page is: a research article's question, or a guide's own title.
 *  Every list that links to research titles it through here, so the hub, the H1, and related links can't drift. */
export function hubLink(href: string) {
    const entry = hubEntryForHref(href);
    if (!entry) throw new Error(`${href} isn't on the Research hub (ResearchHubData.ts).`);
    return { title: entry.title ?? entry.question, href, tag: pillarForHref(href) ?? undefined };
}
