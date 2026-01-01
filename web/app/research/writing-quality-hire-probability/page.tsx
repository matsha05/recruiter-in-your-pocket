import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "Writing Quality Changes Hiring Outcomes | Hiring Research",
    description: "Why clarity is not style - it is a measurable hiring signal.",
};

export default function WritingQualityHireProbabilityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Writing quality",
                title: "Writing quality is not style - it is hire probability",
                description: "Clearer resumes change outcomes in real hiring settings, even when experience stays the same.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Evidence",
                stat: "Clarity Lift",
                statDescription: (
                    <>
                        A large field experiment found that improving writing quality increases hiring outcomes without reducing employer satisfaction.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "NBER working paper on writing assistance",
                    href: "https://www.nber.org/system/files/working_papers/w30886/w30886.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Clarity vs. Signaling</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Clarity improves how fast a recruiter can extract signal during the initial skim.
                        <Citation id="source-2">2</Citation>
                    </p>
                    <figure className="riyp-figure">
                        <div className="riyp-figure-frame p-6">
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="border border-border/40 p-4">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Signaling view</div>
                                <p className="text-muted-foreground">The resume signals capability by making outcomes explicit and comparable.</p>
                            </div>
                            <div className="border border-brand/30 bg-brand/5 p-4">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Clarity view</div>
                                <p className="text-muted-foreground">Clear writing reduces scan cost, so evidence is seen before the window closes.</p>
                            </div>
                        </div>
                        <figcaption className="mt-4 text-xs text-muted-foreground">
                            Fig. 1 - Two complementary explanations for why clarity increases outcomes.
                        </figcaption>
                        </div>
                    </figure>
                </>
            }
            productTieIn={{
                title: "How RIYP applies this",
                items: [
                    {
                        title: "Clarity Pass",
                        description: "We flag dense, multi-idea bullets that raise scan cost."
                    },
                    {
                        title: "Rewrite Suggestions",
                        description: "We propose edits that surface outcomes earlier in the line."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Actually Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" },
                { title: "How People Scan Resumes", href: "/research/how-people-scan", tag: "Behavior" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Algorithmic Writing Assistance Increases Hiring",
                    publisher: "NBER Working Paper",
                    year: "2023",
                    href: "https://www.nber.org/system/files/working_papers/w30886/w30886.pdf"
                },
                {
                    id: "source-2",
                    title: "TheLadders Eye-Tracking Study (2018 Update)",
                    publisher: "TheLadders",
                    year: "2018",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is writing quality just style?",
                    answer: "No. The evidence suggests clarity improves hiring outcomes because it increases readable signal in the first pass."
                },
                {
                    question: "Can AI rewriting replace human insight?",
                    answer: "AI can improve clarity, but it cannot invent evidence. You still need real outcomes."
                },
                {
                    question: "What is the fastest way to improve clarity?",
                    answer: "Start bullets with outcomes and remove filler phrases that delay the point."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why clarity beats polish</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The first screen is short. If the reader cannot parse your impact quickly, the resume never gets the deeper read.
                Clarity is not aesthetic. It is access to the decision window.
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Clarity Raises Signal"
                    desc={
                        <>
                            When writing becomes easier to read, it becomes easier to believe.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Polish Is Not Enough"
                    desc="Recruiter lens: elegant phrasing without proof does not move the decision."
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: clarity lift</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Clarity lift is the measurable improvement in outcomes that comes from making information easier to read and verify.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Writing quality helps, but it cannot replace missing experience.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Results come from a specific experimental setting.</li>
            </ul>
        </ResearchArticle>
    );
}
