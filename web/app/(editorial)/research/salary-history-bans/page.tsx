import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";

const PATH = "/research/salary-history-bans";

export const metadata = pageMetadata({
    path: PATH,
    title: "Should I tell a recruiter what I make now?",
    description: "Studies of salary history bans and disclosure found different effects. Why neither supports one script for every pay conversation, and how to prepare.",
    type: "article",
});

export default function SalaryHistoryPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    There&rsquo;s no one right answer. For higher-paid candidates, disclosing brought higher offers and fewer callbacks, and not disclosing drew negative inferences.
                    Know the local rule, ask for the range, and prepare your own number.
                </>
            }
            answerSource={{
                text: <>From a field experiment with hundreds of recruiters and more than 2,000 fictional applications (Agan, Cowgill &amp; Gee), described from its 2023 working-paper version.</>,
                href: "https://www.nber.org/papers/w29460",
            }}
            painNote="The question sounds like small talk. It isn’t."
            nextQuestions={["offer-negotiation", "skills-first-promise-reality", "referral-advantage", "quantifying-impact"]}
            visualization={
                <>
                    <h2 className="research-h2">Choose the reference point you can defend</h2>
                    <p className="research-body mb-6">
                        Across three general negotiation experiments, the party making the first offer did better, and first offers strongly predicted final settlements. That supports preparing a role-based range. It does not prove that withholding salary history improves an individual outcome.
                        <Citation id="source-3">3</Citation>
                    </p>
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Information and the Persistence of the Gender Wage Gap: Early Evidence from California's Salary History Ban",
                    publisher: "Hansen & McNichols. NBER Working Paper 27054",
                    year: "2020",
                    href: "https://www.nber.org/papers/w27054"
                },
                {
                    id: "source-2",
                    title: "Salary History and Employer Demand: Evidence from a Two-Sided Audit",
                    publisher: "Agan, Cowgill & Gee. NBER Working Paper 29460; published in AEJ: Applied Economics 17(3), 2025",
                    year: "2021; revised 2023",
                    href: "https://www.nber.org/papers/w29460"
                },
                {
                    id: "source-3",
                    title: "First offers as anchors: The role of perspective-taking and negotiator focus",
                    publisher: "Galinsky & Mussweiler. Journal of Personality and Social Psychology 81(4) (via PubMed)",
                    year: "2001",
                    href: "https://pubmed.ncbi.nlm.nih.gov/11642352/"
                }
            ]}
        >
            <h2 className="research-h2">What salary history bans actually changed</h2>
            <p className="research-body mb-6">
                Hansen and McNichols studied the early effects of statewide salary history bans. Using difference-in-differences and synthetic-control methods, they found the gender earnings ratio increased by about 1% in states with bans, with the gains concentrated in several subgroups. Their design estimates the net policy effect; it does not show that every employer switched cleanly from past pay to market pricing.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Disclosure can help and hurt</h2>
            <p className="research-body mb-6">
                A separate field experiment used hundreds of recruiters and more than 2,000 fictional applications. Employers made negative inferences about candidates who did not disclose, the way <ResearchLink to="who-you-are">a reader fills in whatever a resume leaves open, and rarely in your favor</ResearchLink>. For men and other higher-paid candidates, disclosure produced higher salary offers but also fewer callbacks after accounting for salary. Those results do not identify one choice that improves both outcomes for everyone.
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="A clean redirect"
                    desc="‘Could you share the budgeted range? I’m evaluating the scope, level, and total package.’"
                />
                <ArticleInsight
                    title="If you name a target"
                    desc={<>Tie it to the role: responsibilities, level, location, market data, and the full compensation mix, with <ResearchLink to="tech-offer-negotiation">the cash, the bonus, and the equity separated</ResearchLink>.</>}
                />
            </div>

            <h2 className="research-h2">What candidates can control</h2>
            <p className="research-body mb-6">
                Know the local rule, ask for the employer&apos;s range, and prepare your own walk-away point before the conversation. Prepare to ask, too: <ResearchLink to="offer-negotiation">most people don&rsquo;t, and in one large survey most who did came away with more</ResearchLink>. Never invent a current salary. If you choose not to disclose, be ready to redirect calmly; if you do disclose, understand what signal the number may send in that market.
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li><strong>Bring your market evidence.</strong> Compare the responsibilities, level, location, and available salary ranges before choosing your target. Check how recent and relevant each comparison is. When offers arrive, <ResearchLink to="comp-calculator">put salary, bonus, equity, and one-time pay on the same footing</ResearchLink> before you compare them.</li>
                <li><strong>No universal disclosure rule.</strong> The studies do not establish that every candidate should disclose or refuse. Check the rules where the job is based and decide what information you want to share.</li>
            </ul>

            <ArticleBridge question="Is the resume that got you here doing its job?">
                Your report won&apos;t tell you what to ask for. It reads your resume: the write-up says what it says first, and each line a recruiter trips on gets a card that asks for what&apos;s missing instead of inventing it.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Legal requirements vary by jurisdiction. This is not legal advice.</li>
                <li>Neither study says what will happen in an individual negotiation.</li>
            </ul>
        </AnswerArticle>
    );
}
