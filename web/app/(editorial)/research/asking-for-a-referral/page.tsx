import { pageMetadata } from "@/lib/seo/metadata";
import { Citation } from "@/components/research/ResearchArticle";
import { AdviceList, AnswerArticle, ArticleBridge, EvidenceList } from "@/components/research/AnswerArticle";
import { CopyPrompt } from "@/components/research/CopyPrompt";
import { ResearchLink } from "@/components/research/ResearchLink";

const PATH = "/research/asking-for-a-referral";
const GEE = "https://doi.org/10.1086/686225";
const RAJKUMAR = "https://doi.org/10.1126/science.abl4476";
const LINKEDIN_EXPORT = "https://www.linkedin.com/help/linkedin/answer/a566336";

// Our prompt, for any AI assistant that reads an attached spreadsheet. It asks the assistant to list, not to judge
// relationships, and to draft only from facts the reader gives it.
const REFERRAL_PROMPT = `I'm applying for [job title] at [company]. Here's the posting: [paste the link or the text].

I've attached my LinkedIn connections (Connections.csv) and my resume.

1. List everyone in the file whose Company is [company], with their name, position, and the date we connected. Put anyone whose title sounds close to this role or its team first.
2. Don't guess how well I know anyone. After the list, ask me which of these people I know and how.
3. For each person I pick, draft a short message I could send on LinkedIn. Use only facts from my resume and what I tell you about how we know each other. Don't invent shared history, praise, or details about their work.
4. Each message should say how we know each other in one line, name the role with the link, ask whether they'd be comfortable referring me, offer to send a few sentences they can paste into the referral form, and make it easy to say no.

Write it the way I'd message a former colleague: warm, plain, and short enough to read on a phone, with no buzzwords.`;

export const metadata = pageMetadata({
    path: PATH,
    title: "How do I ask for a referral?",
    description: "Most job help comes through acquaintances, but one close contact counts for more. Who to ask for a referral, and what to send, from two large network studies.",
    type: "article",
});

export default function AskingForAReferralPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Ask widely, and lean on people who know your work. Across 6 million Facebook users, most job help came through acquaintances, because people have so many. One close tie was worth more.
                </>
            }
            answerSource={{
                text: <>From a peer-reviewed study of 6 million Facebook users (Gee, Jones &amp; Burke, Journal of Labor Economics, 2017).</>,
                href: GEE,
            }}
            painNote="Asking feels like a big favor. Done well, it's a small one."
            nextQuestions={["referral-advantage", "linkedin-visibility", "how-recruiters-read"]}
            sources={[
                {
                    id: "source-1",
                    title: "Social Networks and Labor Markets: How Strong Ties Relate to Job Finding on Facebook's Social Network",
                    publisher: "Gee, Jones & Burke. Journal of Labor Economics 35(2)",
                    year: "2017",
                    href: GEE,
                },
                {
                    id: "source-2",
                    title: "A causal test of the strength of weak ties",
                    publisher: "Rajkumar, Saint-Jacques, Bojinov, Brynjolfsson & Aral. Science 377",
                    year: "2022",
                    href: RAJKUMAR,
                },
            ]}
        >
            <h2 className="research-h2">Who to ask</h2>
            <p className="research-body mb-6">
                Two large studies of real networks agree on the shape. Most people get job help from someone they know less well, simply because they know so many more of them. But one close contact counts for more than one acquaintance.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                {" "}So ask more than your closest friends, and put the most care into the people who&rsquo;ve seen your work.
            </p>

            <AdviceList
                items={[
                    {
                        lead: "Start with people who've seen your work.",
                        body: <>Former managers, teammates and clients can say what you did. In field experiments, <ResearchLink to="referral-advantage">referrals told employers the most when the referrer knew the person well</ResearchLink>.</>,
                    },
                    {
                        lead: "Then go one step out.",
                        body: <>Someone you share a few connections with, like a former teammate&rsquo;s new colleague, is the kind of tie that went with the most job moves in LinkedIn&rsquo;s experiments. Ask the person you know well to introduce you.</>,
                    },
                    {
                        lead: "Send everything in one message.",
                        body: <>The job link, your resume, and two or three sentences they can paste into the referral form: how you know each other, and what you&rsquo;d bring to this role.</>,
                    },
                    {
                        lead: "Make no easy to say.",
                        body: <>They&rsquo;re putting their name next to yours. &ldquo;No worries if it&rsquo;s not a fit&rdquo; keeps the relationship either way.</>,
                    },
                ]}
            />

            <h2 className="research-h2">Find them, then draft the ask</h2>
            <p className="research-body mb-6">
                An AI assistant can sort your connections and write a first draft, as long as you give it the list. It can&rsquo;t open your LinkedIn for you.
            </p>
            <ol className="mb-6 list-decimal space-y-2 pl-6 marker:text-muted-foreground">
                <li>
                    <strong>Download your connections.</strong> On LinkedIn, go to Settings &amp; Privacy, then Data privacy, then Get a copy of your data, and pick the archive that includes connections.
                    {" "}<a href={LINKEDIN_EXPORT} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link">LinkedIn&rsquo;s steps<span className="sr-only"> (opens in a new tab)</span></a>. It emails you a link; the list is the file named Connections.csv.
                </li>
                <li>
                    <strong>Delete the email column first.</strong> Those are other people&rsquo;s addresses, and the assistant doesn&rsquo;t need them.
                </li>
                <li>
                    <strong>Attach the file and your resume</strong> to ChatGPT, Claude, Gemini or another assistant, paste the prompt below, and fill in the brackets.
                </li>
            </ol>
            <CopyPrompt label="Our prompt" text={REFERRAL_PROMPT} />
            <p className="research-body mb-6">
                Read every draft before you send it. You know the relationship; the assistant only knows a spreadsheet. If a message says something you wouldn&rsquo;t, fix it or don&rsquo;t send it.
            </p>

            <h2 className="research-h2">What a referral does on the recruiter&rsquo;s side</h2>
            <p className="research-body mb-6">
                <strong>Our take:</strong> this is recruiter experience, not a finding from the studies below. Every application a recruiter opens shows whether someone referred you, and when a role has hundreds of applicants, that gets your resume read. It doesn&rsquo;t make the decision for you. Once it&rsquo;s open, <ResearchLink to="how-recruiters-read">recruiters spend their time on your experience</ResearchLink>, the same as everyone else&rsquo;s.
            </p>

            <ArticleBridge question="Is it ready for a real read?">
                The write-up in your report says what a recruiter takes from your resume first. Check it before someone vouches for you. The report can&rsquo;t tell you who to ask; it reads the resume they&rsquo;ll open.
            </ArticleBridge>

            <h2 className="research-h2">The evidence</h2>
            <EvidenceList
                entries={[
                    {
                        id: "gee-2017",
                        name: "Gee, Jones & Burke, 2017",
                        kind: "Peer-reviewed study",
                        href: GEE,
                        linkLabel: "Read the study",
                        found: "Most people who got job help got it through one of their many weak ties. A single stronger tie was significantly more valuable at the margin.",
                        method: "Data from 6 million Facebook users. A person counted as helped when they went on to work with someone who was already their friend.",
                        limit: "Whether anyone made a formal referral, or how they asked. Working alongside a friend is a stand-in for help, not a record of it.",
                    },
                    {
                        id: "rajkumar-2022",
                        name: "Rajkumar et al., 2022",
                        kind: "Randomized experiments, peer-reviewed",
                        href: RAJKUMAR,
                        linkLabel: "Read the study",
                        found: "Moderately weak ties, measured by mutual connections, and the weakest ties, measured by how often people interacted, created the most job mobility. Weak ties helped more in digital industries; strong ties helped more in less digital ones.",
                        method: "LinkedIn randomly varied its connection suggestions for more than 20 million members over five years, a period with 2 billion new ties and 600,000 new jobs.",
                        limit: "Referrals specifically. It measures moving to a new job, on one platform, not who referred whom.",
                    },
                ]}
            />

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Neither study tested how to word a referral request. The four moves above are our advice.</li>
                <li>Both studies use one platform&rsquo;s data, so they describe its users, not every job seeker.</li>
            </ul>
        </AnswerArticle>
    );
}
