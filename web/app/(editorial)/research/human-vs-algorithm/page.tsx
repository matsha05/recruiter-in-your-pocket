import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "What Recruiters Trust and What They Follow | Hiring Research",
    description: "A resume-screening experiment found a gap between recruiters' stated trust and their response to algorithmic advice.",
};

export default function HumanVsAlgorithmPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Human + algorithmic judgment",
                title: "What recruiters trust and what they follow",
                description: "In a resume-screening experiment, recruiters said they trusted human advice more. Their choices told a more complicated story.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The uncomfortable finding",
                stat: "Higher trust in humans. More influence from the algorithm.",
                statDescription: (
                    <>
                        In an experiment with 694 professionals involved in recruitment, participants rated human recommendations as more trustworthy. Yet an inconsistent algorithmic recommendation still pulled evaluations toward the less-suitable resume.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Lacroux & Martin-Lacroux (2022), experiment",
                    href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.895997/full"
                },
                sampleSize: "694 professionals involved in recruitment"
            }}
            visualization={
                <>
                    <h2 className="research-h2">What people said versus what they did</h2>
                    <p className="research-body mb-6">
                        This was not a study of trust recovering after repeated mistakes. It compared recommendations from a human expert and a fictional algorithmic decision-support system, including recommendations that favored the less-suitable resume.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 not-prose">
                        <ArticleInsight
                            title="What they reported"
                            desc="Human recommendations were rated as more trustworthy, including when the recommendation was inconsistent."
                        />
                        <ArticleInsight
                            title="What changed their choices"
                            desc="Compared with the control group, the inconsistent algorithmic recommendation influenced evaluations; the inconsistent human recommendation did not."
                        />
                    </div>
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "A score you can question",
                        description: "A number is useful only when you can trace it back to the resume and the criteria. It cannot stand in for an employer's decision."
                    },
                    {
                        title: "Check the recommendation",
                        description: "We quote the resume behind each recommendation. Compare the advice with what you actually did before accepting it."
                    }
                ]
            }}
            relatedArticles={[
                { title: "ATS Myths", href: "/research/ats-myths", tag: "Industry" },
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Should I Trust the Artificial Intelligence to Recruit? Recruiters' Perceptions and Behavior When Faced With Algorithm-Based Recommendation Systems During Resume Screening",
                    publisher: "Frontiers in Psychology",
                    year: "2022",
                    href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.895997/full"
                }
            ]}
            faq={[
                {
                    question: "Does this mean scores are useless?",
                    answer: "No. A score is useful only when you can see what drove it and what to change. It is a starting point for the review, not objective truth."
                },
                {
                    question: "How should candidates respond?",
                    answer: "Make your evidence easy to inspect: clear role context, specific ownership, supportable outcomes, and no claims you cannot defend."
                }
            ]}
        >
            <h2 className="research-h2">The result was not simple algorithm aversion</h2>
            <p className="research-body mb-6">
                Participants reviewed two resume summaries for an HR manager role. They received either no recommendation or a recommendation from a human expert or algorithmic system; some recommendations favored the less-suitable candidate. Recruiters trusted the human source more, but the inconsistent algorithm still affected their evaluations.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                That gap matters. Stated skepticism is not the same as resistance in the moment. A tool can look less trustworthy and still change a decision.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                A resume tool should explain its recommendations so you can check them. Trusting a tool less does not necessarily protect you from following a weak suggestion.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Small experimental effects"
                    desc={
                        <>
                            The authors reported small effects and cautioned that the task was subjective and difficult to isolate from participants&apos; own judgments.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="One simulated hiring task"
                    desc={
                        <>
                            Participants judged two resume summaries for one HR manager role; this does not establish how every recruiter or production system behaves.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">What this means in practice</h2>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> compare a suggested change with the original resume and the job you want. Keep it only if it makes your experience clearer without adding facts or overstating your contribution.
            </p>
        </ResearchArticle>
    );
}
