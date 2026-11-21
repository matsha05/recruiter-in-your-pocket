// The Research hub states what we believe as recruiters, and every research article sits under the belief it backs.
// Each research entry carries its short answer (the verdict), one sentence of what the study found, and what that
// rests on. Keep every word inside
// what the article's sources found: the verdicts are taken from each article's own opening answer, and the
// evidence from its own source line. When an article changes, check its entry here.
//
// November 6, 2026 (Matt): the hub is a reference people scan for answers, so every row has the same three
// parts. The site doesn't publish race and discrimination research; that article was removed the same day.
//
// November 10, 2026 (Matt): "nobody is going to look at 17 questions." The hub became six beliefs, in Matt's
// words and the recruiters' "we", each with its own page at /research/<id> (hub and spoke). Questions that back
// no belief are listed under the cards as additional research.

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

export type ResearchCategory = {
    id: string;
    /** The pillar name articles carry in their header. Pillars are named, never colored. */
    navLabel: string;
    title: string;
    /** "pillar": one of the six beliefs, with its own page at /research/<id>. "additional": research that backs no
     *  belief, listed under the hub's cards. "method": the methodology, linked from the hub, not listed. */
    kind: "pillar" | "additional" | "method";
    /** The belief, in the recruiters' "we" (Matt's wording, Nov 10, 2026). Pillars only. */
    belief?: string;
    articles: ResearchArticle[];
};

function study(entry: Omit<ResearchArticle, "answer"> & { verdict: string; finding: string; evidence: ResearchEvidence }): ResearchArticle {
    return { ...entry, answer: `${entry.verdict} ${entry.finding}` };
}

export const categories: ResearchCategory[] = [
    {
        id: "story",
        navLabel: "Story",
        title: "Story",
        kind: "pillar",
        belief: "We need to say who you are in one line, and picture you in the job.",
        articles: [
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
                id: "resume-length-myths",
                keywords: ["length", "one page", "two pages", "long", "short"],
                href: "/research/resume-length-myths",
                question: "Does my resume really have to fit on one page?",
                verdict: "No.",
                finding: "Use a second page when it adds experience that matters for the role.",
                evidence: { kind: "Study, abstract only", cite: "Blackburn-Brockman & Belanger, 2001 · 570 CPA recruiters" },
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
        ],
    },
    {
        id: "impact",
        navLabel: "Impact",
        title: "Impact",
        kind: "pillar",
        belief: "Show us what tangibly changed because you were there. Put a number or metric on it whenever possible.",
        articles: [
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
                keywords: ["star", "carl", "situation", "task", "action", "result", "format"],
                href: "/research/star-method",
                question: "How to use the STAR method on a resume (with an example)",
                verdict: "Start with what you did and what changed.",
                finding: "Add just enough context for someone outside your team to follow the bullet.",
                evidence: { kind: "Recruiter advice", cite: "Worked example, with interview guidance from Edinburgh and Microsoft" },
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
        id: "read",
        navLabel: "The read",
        title: "The read",
        kind: "pillar",
        belief: "We read your resume, and we spend our time on your background and experience.",
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
        ],
    },
    {
        id: "ats",
        navLabel: "ATS",
        title: "ATS",
        kind: "pillar",
        belief: "Software sometimes helps sort our pile. We still decide who moves forward, if you make it to us.",
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
        id: "referrals",
        navLabel: "Referrals",
        title: "Referrals",
        kind: "pillar",
        belief: "When we have hundreds of applicants, a referral gets you to the top of the list.",
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
                id: "asking-for-a-referral",
                keywords: ["referral", "ask", "network", "networking", "weak ties", "contacts", "introduction", "message"],
                href: "/research/asking-for-a-referral",
                question: "How do I ask for a referral?",
                verdict: "Ask widely, and lean on people who know your work.",
                finding: "Across 6 million Facebook users, most job help came through acquaintances, because people have so many. One close tie was worth more.",
                evidence: { kind: "Peer-reviewed studies", cite: "Gee, Jones & Burke, 2017 · 6 million Facebook users; Rajkumar et al., 2022 · 20 million LinkedIn members" },
            }),
        ],
    },
    {
        id: "offer",
        navLabel: "The offer",
        title: "The offer",
        kind: "pillar",
        belief: "We expect you to negotiate. Please do so!",
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
        id: "additional",
        navLabel: "Additional research",
        title: "Additional research",
        kind: "additional",
        articles: [
            study({
                id: "social-screening",
                keywords: ["social media", "instagram", "facebook", "twitter", "posts", "online"],
                href: "/research/social-screening",
                question: "Will employers judge me by my social media?",
                verdict: "In one experiment, yes.",
                finding: "Posts changed how candidates were rated. Nobody showed those ratings predict how you’d do the job.",
                evidence: { kind: "Experiment, working paper", cite: "Baker, Grimm & Ofek-Shanny · 1,500 online evaluators and 500 hiring professionals" },
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
            study({
                id: "human-vs-algorithm",
                keywords: ["ai", "algorithm", "automation", "trust"],
                href: "/research/human-vs-algorithm",
                question: "When AI weighs in on my resume, do recruiters listen?",
                verdict: "More than they say.",
                finding: "They rated human advice as more trustworthy, yet an algorithm’s pick still pulled their ratings toward it.",
                evidence: { kind: "Experiment", cite: "Lacroux & Martin-Lacroux, 2022 · 694 recruitment professionals" },
            }),
        ],
    },
    {
        id: "how-the-report-works",
        navLabel: "How the report works",
        title: "How the report works",
        kind: "method",
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

export type ResearchPillar = ResearchCategory & { kind: "pillar"; belief: string };

function isPillar(category: ResearchCategory): category is ResearchPillar {
    return category.kind === "pillar" && Boolean(category.belief);
}

/** The six beliefs, in the hub's order: what you control first (Matt, Nov 10, 2026). */
export const pillars: ResearchPillar[] = categories.filter(isPillar);

/** A belief's own page. */
export function pillarHref(pillar: ResearchPillar) {
    return `/research/${pillar.id}`;
}

/** A belief by its id ("impact"). */
export function pillar(id: string): ResearchPillar {
    const found = pillars.find((candidate) => candidate.id === id);
    if (!found) throw new Error(`"${id}" isn't one of the Research hub's beliefs (ResearchHubData.ts).`);
    return found;
}

/** The research that backs no belief, listed under the hub's cards. */
export const additionalResearch = categories.filter((category) => category.kind === "additional").flatMap((category) => category.articles);

/** The belief an article sits under, by its href, or null for additional research, guides outside a belief, and the
 *  methodology. Pillars are named, not colored: the pen colors already mean whose mark something is. */
export function pillarFor(href: string): ResearchPillar | null {
    return pillars.find((candidate) => candidate.articles.some((article) => article.href === href)) ?? null;
}

/** The belief's name an article carries in its header and related links, or null. */
export function pillarForHref(href: string) {
    return pillarFor(href)?.navLabel ?? null;
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
