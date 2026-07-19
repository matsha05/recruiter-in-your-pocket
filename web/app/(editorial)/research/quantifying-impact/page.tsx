import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ImpactFormulaDiagram } from "@/components/research/diagrams/ImpactFormulaDiagram";

export const metadata: Metadata = {
    title: "Quantifying Impact: The Laszlo Bock Formula | Hiring Research",
    description: "A practical resume formula from Google's former people leader, plus what research does and does not validate about it.",
};

export default function QuantifyingImpactPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume writing",
                title: "Show what changed, and your part in it.",
                description: "A practical way to turn a responsibility into a specific, supportable result.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "Practitioner guidance",
                stat: "X → Y → Z",
                statDescription: (
                    <>
                        Accomplished [X] as measured by [Y], by doing [Z]. Start with the result, add scale, then explain how.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Laszlo Bock (Google) resume formula",
                    href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">The formula visualized</h2>
                    <p className="research-body mb-6">
                        Lead with the result, give it context with a metric or concrete detail, then explain your method.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ImpactFormulaDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Missing context",
                        description: "We point out when a bullet names the activity but not what changed or how much work was involved."
                    },
                    {
                        title: "Fact-protective rewrites",
                        description: "We ask for the missing result or scale instead of inventing a number for you."
                    }
                ]
            }}
            relatedArticles={[
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Structure" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "My personal formula for a better resume",
                    publisher: "Laszlo Bock on LinkedIn (practitioner guidance)",
                    year: "2014",
                    href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume"
                },
                {
                    id: "source-2",
                    title: "Algorithmic Writing Assistance on Jobseekers' Resumes Increases Hires",
                    publisher: "NBER Working Paper",
                    year: "2023",
                    href: "https://www.nber.org/system/files/working_papers/w30886/w30886.pdf"
                }
            ]}
            faq={[
                {
                    question: "What if I do not have numbers?",
                    answer: "Use counts, time saved, or scope. If you cannot quantify, describe the outcome in terms of scale or impact."
                },
                {
                    question: "Is the XYZ formula the only format?",
                    answer: "No. It is one way to make the result, action, and context visible. Any clear, accurate format can work."
                },
                {
                    question: "Does this matter for every role?",
                    answer: "Most roles produce outcomes, but not every useful result has a clean number. Use a metric when it adds honest context."
                }
            ]}
        >
            <h2 className="research-h2">Why numbers work</h2>
            <p className="research-body mb-6">
                Numbers can show scale and make comparisons easier, but only when the number is accurate and meaningful.
                &quot;Improved customer satisfaction&quot; is vague. &quot;Increased NPS from 42 to 67&quot; gives the reader a specific result to evaluate.
            </p>
            <p className="research-body mb-6">
                Bock&apos;s insight was that most candidates undersell themselves by describing responsibilities
                instead of results. The formula encourages you to lead with the outcome, not the activity.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                A separate field experiment with nearly half a million jobseekers found that algorithmic writing assistance improved measurable writing quality and increased hires by 8%, without evidence of lower employer satisfaction. It tested broad writing assistance, not Bock&apos;s formula, quantified bullets, or one specific rewrite pattern.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">Finding numbers when you think you don&apos;t have any</h2>
            <p className="text-sm text-muted-foreground mb-4">
                Illustrative examples, not benchmarks.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Time"
                    desc="Reduced processing time by 30%. Cut onboarding from 2 weeks to 3 days."
                />
                <ArticleInsight
                    title="Money"
                    desc="Saved $50K annually. Generated $200K in new revenue. Reduced costs by 15%."
                />
                <ArticleInsight
                    title="Scale"
                    desc="Managed a team of 12. Handled 500+ customer tickets monthly. Launched in 8 markets."
                />
                <ArticleInsight
                    title="Frequency"
                    desc="First time in company history. Implemented process used by 200+ employees."
                />
            </div>

            <h2 className="research-h2">An illustrative before and after</h2>
            <p className="text-sm text-muted-foreground mb-4">
                The facts and numbers below belong to the example. A real rewrite must use details you can support.
            </p>
            <p className="research-body mb-6">
                <strong>Before:</strong> &quot;Responsible for managing social media accounts and creating content.&quot;
            </p>
            <p className="research-body mb-6">
                <strong>After:</strong> &quot;Grew Instagram following from 5K to 45K in 8 months by creating a
                data-driven content calendar that increased engagement rate from 2% to 8%.&quot;
            </p>
            <p className="research-body">
                The second version gives the reader a clearer result to evaluate.
            </p>

            <h2 className="research-h2">Give the reader enough context</h2>
            <p className="research-body mb-6">
                A number without context can still mislead. &quot;Cut time by 40%&quot; is more useful when the reader can tell what process changed, from what baseline, and what you actually did. The goal is not maximum numerals; it is a claim another person can understand and defend.
            </p>

            <h2 className="research-h2">What the evidence does not prove</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Bock&apos;s X–Y–Z formula is experienced practitioner guidance, not a controlled trial.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The NBER experiment studied an online labor market and bundled several forms of writing help.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Neither source justifies inventing a metric or forcing a number into every bullet.</li>
            </ul>
        </ResearchArticle>
    );
}
