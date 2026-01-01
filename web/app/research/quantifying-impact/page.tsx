import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ImpactFormulaDiagram } from "@/components/research/diagrams/ImpactFormulaDiagram";

export const metadata: Metadata = {
    title: "Quantifying Impact: The Laszlo Bock Formula | Hiring Research",
    description: "Google's former SVP of People Operations on why numbers matter and how to find them when you think you don't have any.",
};

export default function QuantifyingImpactPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume writing",
                title: "Quantifying Impact: The Laszlo Bock Formula",
                description: "A structured formula for turning responsibilities into quantified impact.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Formula",
                stat: "X → Y → Z",
                statDescription: (
                    <>
                        Accomplished [X] as measured by [Y], by doing [Z]. Start with impact, prove it, then explain how.
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
                        Lead with the result, prove it with a metric, then explain your method.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ImpactFormulaDiagram />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Impact Detection",
                        description: "We identify bullets that lack measurable outcomes and suggest where numbers could go."
                    },
                    {
                        title: "Before/After Rewrites",
                        description: "We show you how to transform vague responsibilities into quantified accomplishments."
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
                    publisher: "LinkedIn (Laszlo Bock)",
                    year: "2014",
                    href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume"
                },
                {
                    id: "source-2",
                    title: "Algorithmic Writing Assistance Increases Hiring",
                    publisher: "NBER Working Paper",
                    year: "2023",
                    href: "https://www.nber.org/system/files/working_papers/w30886/w30886.pdf"
                },
                {
                    id: "source-3",
                    title: "TheLadders Eye-Tracking Study (2018 Update)",
                    publisher: "TheLadders",
                    year: "2018",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                }
            ]}
            faq={[
                {
                    question: "What if I do not have numbers?",
                    answer: "Use counts, time saved, or scope. If you cannot quantify, describe the outcome in terms of scale or impact."
                },
                {
                    question: "Is the XYZ formula the only format?",
                    answer: "No. It is a high-signal template that forces clarity, but other formats can work if they surface results early."
                },
                {
                    question: "Does this matter for every role?",
                    answer: "Yes. Every role produces outcomes. The form of the metric changes, but the principle stays the same."
                }
            ]}
        >
            <h2 className="research-h2">Why numbers work</h2>
            <p className="research-body mb-6">
                Numbers do three things that words cannot: they prove scale, enable comparison, and signal
                that you track your own performance. &quot;Improved customer satisfaction&quot; is a claim.
                &quot;Increased NPS from 42 to 67&quot; is evidence.
            </p>
            <p className="research-body mb-6">
                Bock&apos;s insight was that most candidates undersell themselves by describing responsibilities
                instead of results. The formula forces you to lead with the outcome, not the activity.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Evidence from a large field experiment shows that improving writing quality can increase hiring outcomes without reducing employer satisfaction.
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

            <h2 className="research-h2">The before and after</h2>
            <p className="research-body mb-6">
                <strong>Before:</strong> &quot;Responsible for managing social media accounts and creating content.&quot;
            </p>
            <p className="research-body mb-6">
                <strong>After:</strong> &quot;Grew Instagram following from 5K to 45K in 8 months by creating a
                data-driven content calendar that increased engagement rate from 2% to 8%.&quot;
            </p>
            <p className="research-body">
                Same job. Completely different impression. The second version answers the question every
                recruiter is asking: &quot;What will this person do for us?&quot;
            </p>

            <h2 className="research-h2">Definition: evidence density</h2>
            <p className="research-body mb-6">
                Evidence density is the amount of measurable proof packed into a line. Higher density reduces scan time and increases credibility.
                <Citation id="source-3">3</Citation>
            </p>
        </ResearchArticle>
    );
}
