import type { Metadata } from "next";
import { ResearchArticle, Citation } from "@/components/research/ResearchArticle";
import { PageTwoGateDiagram } from "@/components/research/diagrams/PageTwoGateDiagram";

export const metadata: Metadata = {
    title: "Resume Length: What Research Says | Hiring Research",
    description: "What a peer-reviewed recruiter study does and does not say about one-page and two-page resumes.",
};

export default function ResumeLengthPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume structure",
                title: "Resume length: there is no universal one-page rule",
                description: "The evidence is narrower than the advice. Relevance and context decide what earns space.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "What the study found",
                stat: "Two-page versions ranked higher in one narrow test",
                statDescription: (
                    <>
                        Recruiters from major accounting firms ranked two-page versions of resumes from highly qualified entry-level accounting candidates more favorably than one-page versions.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Blackburn-Brockman & Belanger (2001)",
                    href: "https://journals.sagepub.com/doi/abs/10.1177/002194360103800104"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Give every page a job</h2>
                    <p className="research-body mb-6">
                        The study does not set a rule for every field or career stage. A useful editing approach is to make page one carry the core case, then use page two only for relevant depth.
                    </p>
                    <PageTwoGateDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "What the review can judge",
                        description: "We review relevance, scope, ownership, and results in the text you submit. Page count is not a scoring shortcut."
                    },
                    {
                        title: "What it cannot judge",
                        description: "Text analysis cannot reliably measure the visual density of your exported PDF. Check the final document yourself at 100% zoom."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "One Page or Two?: A National Study of CPA Recruiters' Preferences for Resume Length",
                    publisher: "The Journal of Business Communication",
                    year: "2001",
                    href: "https://journals.sagepub.com/doi/abs/10.1177/002194360103800104"
                }
            ]}
            faq={[
                {
                    question: "Is one page still the safest option?",
                    answer: "There is no universal safest length. Use the shortest version that preserves the relevant evidence a reviewer needs."
                },
                {
                    question: "When is two pages acceptable?",
                    answer: "When page 1 is clear and page 2 adds relevant, non-repetitive evidence."
                }
            ]}
        >
            <h2 className="research-h2">What the study actually tested</h2>
            <p className="research-body mb-6">
                Researchers created one-page and two-page versions of resumes for four fictitious, highly qualified graduating accounting students. They mailed mixed sets to 570 personnel recruiters at major accounting firms and asked respondents to rank the candidates as if they were hiring for entry-level roles.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                The two-page versions ranked more favorably. That is useful because it contradicts the claim that a second page is automatically harmful. It does not establish that two pages are better in every market.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What it does not settle</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The study covered entry-level accounting candidates, not every role or career stage.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Recruiters ranked supplied resumes. The study did not measure real callbacks, interviews, or hires.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The study was published in 2001, before today&apos;s digital application workflow.</li>
            </ul>

            <h2 className="research-h2">A better editing rule</h2>
            <p className="research-body mb-6">
                <strong>RIYP interpretation:</strong> use the shortest version that preserves the evidence a reviewer needs. Put the experience and results most relevant to the role on page one. Use page two for additional work only when it adds useful scope, depth, or context.
            </p>
            <p className="research-body">
                Every line should pass a simpler test: &quot;Does this help a reviewer understand my fit for this role?&quot;
            </p>

            <h2 className="research-h2">Make the important details easy to find</h2>
            <p className="research-body mb-6">
                A second page is not a permission slip for repetition. Keep the role, scope, and strongest results easy to locate. If page two mostly repeats page one or preserves irrelevant history, cut it.
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>This is a peer-reviewed study, but its setting is narrow and dated.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The abstract reports that packets went to 570 recruiters; it does not make 570 the completed-response count.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use the finding to reject a rigid one-page rule, not to replace it with a rigid two-page rule.</li>
            </ul>
        </ResearchArticle>
    );
}
