import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "Signal vs Clarity in Resumes | Hiring Research",
    description: "When clarity matters more than signaling - and why both matter.",
};

export default function SignalVsClarityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume theory",
                title: "The resume as signal vs the resume as clarity",
                description: "Two competing views of what a resume does - and how evidence supports the clarity view.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Evidence",
                stat: "Clarity View",
                statDescription: (
                    <>
                        Field evidence suggests that clearer writing improves hiring outcomes without reducing employer satisfaction.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "NBER field experiment on writing quality",
                    href: "https://www.nber.org/system/files/working_papers/w30886/w30886.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Two paths</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        One view treats the resume as a signal. The other treats it as a clarity device.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <figure className="riyp-figure">
                        <div className="riyp-figure-frame p-6">
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="border border-border/40 p-4">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Signal view</div>
                                    <p className="text-muted-foreground">Outcome is about signaling quality to overcome uncertainty.</p>
                                </div>
                                <div className="border border-brand/30 bg-brand/5 p-4">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Clarity view</div>
                                    <p className="text-muted-foreground">Outcome improves because clarity lets recruiters evaluate true ability faster.</p>
                                </div>
                            </div>
                            <figcaption className="mt-4 text-xs text-muted-foreground">
                                Fig. 1 - Two interpretations of why good resumes work.
                            </figcaption>
                        </div>
                    </figure>
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "Clarity scoring",
                        description: "We measure how quickly a reader can extract your signal."
                    },
                    {
                        title: "Evidence-first editing",
                        description: "We move proof earlier in the line to reduce ambiguity."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Writing Quality and Hiring", href: "/research/writing-quality-hire-probability", tag: "Evidence" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Eye-tracking" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Algorithmic Writing Assistance Increases Hiring",
                    publisher: "NBER Working Paper",
                    year: "2023",
                    href: "https://www.nber.org/system/files/working_papers/w30886/w30886.pdf"
                }
            ]}
            faq={[
                {
                    question: "What is the signal view?",
                    answer: "It treats resumes as signals of capability that reduce uncertainty."
                },
                {
                    question: "What is the clarity view?",
                    answer: "It treats resumes as tools that help recruiters evaluate real ability faster."
                },
                {
                    question: "Which view is correct?",
                    answer: "Both can be true. Evidence suggests clarity has measurable effects in hiring outcomes."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why this matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                If the clarity view is correct, then better writing is not just polish - it is a hiring lever.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Clarity wins"
                    desc="Clear writing raises the probability that your signal is actually seen."
                />
                <ArticleInsight
                    title="Signal still matters"
                    desc="Recruiter lens: clarity is necessary, but evidence is what closes the decision."
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">A fast clarity test</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: if a reader cannot extract the outcome in a quick skim, the bullet does not work.
                The field evidence on writing quality supports this idea of clarity as an access point.
                <Citation id="source-1">1</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>First seven words should reveal the action or outcome.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Remove role adjectives that do not change the story.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Make the metric or impact visible before line wrap.</li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Signal and clarity work together</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Clarity does not replace proof. It makes proof visible. The strongest resumes use clarity to deliver the signal and then
                back it with evidence, not adjectives.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: clarity device</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                A clarity device reduces the effort needed to understand ability. The resume is that device when written well.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Clarity improves access to evidence but cannot create missing outcomes.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The cited field evidence is context-specific and may not generalize to every role.</li>
            </ul>
        </ResearchArticle>
    );
}
